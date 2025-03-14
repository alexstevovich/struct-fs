/* *******************************************************
 * struct-fs
 * 
 * @license
 * 
 * Apache-2.0
 * 
 * Copyright 2015-2025 Alex Stevovich
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * @meta
 *
 * package_name: struct-fs
 * file_name: gen/index.cjs
 * purpose: Core functionality and exports combined.
 *  
 * @system
 *
 * generated_on: 2025-03-14T22:36:40.535Z
 * certified_version: 1.0.0
 * file_uuid: 16c9c744-fcf6-4bb0-82f6-dda2aefa5dca
 * file_size: 7176 bytes
 * file_hash: 50105abe61ee90413cac98087294808a377a0f08917c5147412b129ef34a2acc
 * mast_hash: 3a89d8d2322d33a39c258ff73be48f6dc090986619c7cd8c3add51395b3bfff4
 * generated_by: preamble on npm!
 *
 * [Preamble Metadata]
********************************************************/ 
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var index_exports = {};
__export(index_exports, {
  default: () => index_default,
  structureFs: () => structureFs
});
module.exports = __toCommonJS(index_exports);
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_ignore = __toESM(require("ignore"), 1);

function getIgnoreFilter(baseDir, ignoreFile) {
  const ignorePath = import_path.default.join(baseDir, ignoreFile);
  let ig = (0, import_ignore.default)();
  if (import_fs.default.existsSync(ignorePath)) {
    const ignoreContent = import_fs.default.readFileSync(ignorePath, "utf8");
    ig = ig.add(ignoreContent.split("\n"));
  }
  return ig;
}
function getIgnoreStatus(baseDir, filePath, isDir, mode, ig) {
  const relativePath = import_path.default.relative(baseDir, filePath);
  if (relativePath.startsWith("..")) return false;
  const baseName = import_path.default.basename(filePath);
  const isHiddenDir = isDir && baseName.startsWith(".");
  const ignoredByIgnoreFile = ig.ignores(relativePath) || ig.ignores(`${relativePath}/`);
  let effectiveMode = mode;
  if (isHiddenDir) {
    effectiveMode = mode.hiddenMode;
  } else if (isDir) {
    effectiveMode = mode.dirMode;
  } else {
    effectiveMode = mode.fileMode;
  }
  if (ignoredByIgnoreFile) {
    switch (effectiveMode) {
      case "ignore":
        return "ignored";
      // Completely remove
      case "seal":
        return "sealed";
      // Keep, but with empty `children: []`
      case "redact":
        return "redacted";
      // Keep, rename as `redactedDirName` or `redactedFileName`, with `children: []`
      default:
        return "ignored";
    }
  }
  return false;
}
async function traverseDirectory(directory, baseDir, mode, ig, absolutePaths, recursive, redactedDirName, redactedFileName) {
  const getPath = (p) => absolutePaths ? import_path.default.resolve(p) : import_path.default.relative(baseDir, p);
  const result = { path: getPath(directory), children: [] };
  let entries;
  try {
    entries = await import_fs.default.promises.readdir(directory, { withFileTypes: true });
  } catch {
    return result;
  }
  for (const entry of entries) {
    const fullPath = import_path.default.join(directory, entry.name);
    const isDir = entry.isDirectory();
    if (entry.isSymbolicLink()) {
      result.children.push({ path: getPath(fullPath), sym: true });
      continue;
    }
    const ignoreStatus = getIgnoreStatus(
      baseDir,
      fullPath,
      isDir,
      mode,
      ig
    );
    if (ignoreStatus === "ignored") {
      continue;
    }
    if (ignoreStatus === "sealed") {
      result.children.push({ path: getPath(fullPath), children: [] });
      continue;
    }
    if (ignoreStatus === "redacted") {
      result.children.push({
        path: isDir ? redactedDirName : redactedFileName,
        children: isDir ? [] : void 0
      });
      continue;
    }
    if (isDir) {
      if (recursive) {
        const childData = await traverseDirectory(
          fullPath,
          baseDir,
          mode,
          ig,
          absolutePaths,
          recursive,
          redactedDirName,
          redactedFileName
        );
        result.children.push(childData);
      } else {
        result.children.push({ path: getPath(fullPath), children: [] });
      }
    } else {
      result.children.push({ path: getPath(fullPath) });
    }
  }
  return result;
}
async function structureFs(dir, {
  ignoreFile = ".gitignore",
  // Custom ignore file (default to `.gitignore`)
  dirMode = "ignore",
  // "ignore", "seal", "redact"
  fileMode = "ignore",
  // "ignore", "redact"
  hiddenMode = "ignore",
  // "ignore", "seal", "redact"
  absolutePaths = false,
  // Use absolute paths instead of relative paths
  recursive = false,
  // Whether to go deeper than the first level
  redactedDirName = "!dir",
  // Default redacted directory name
  redactedFileName = "!file"
  // Default redacted file name
} = {}) {
  if (!import_fs.default.existsSync(dir)) {
    throw new Error(`Directory "${dir}" does not exist.`);
  }
  const ig = getIgnoreFilter(dir, ignoreFile);
  const result = await traverseDirectory(
    dir,
    dir,
    { dirMode, fileMode, hiddenMode },
    ig,
    absolutePaths,
    recursive,
    redactedDirName,
    redactedFileName
  );
  return result || {
    path: absolutePaths ? import_path.default.resolve(dir) : dir,
    children: []
  };
}
var index_default = structureFs;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  structureFs
});
