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
 * file_name: src/index.js
 * purpose: Core functionality and exports combined.
 *
 * @system
 *
 * generated_on: 2025-03-15T03:00:02.150Z
 * certified_version: 1.0.0
 * file_uuid: 16c9c744-fcf6-4bb0-82f6-dda2aefa5dca
 * file_size: 6635 bytes
 * file_hash: 9031da2ee3524e5baa76be2ca3e115db7a4af317337c00fe427954139d09533d
 * mast_hash: eed65c3ca703508c2fc0070eb3b1dc5cd0ec5a9283f47e14038ca774a1312a79
 * generated_by: preamble on npm!
 *
 * [Preamble Metadata]
 ********************************************************/
import fs from 'fs';
import path from 'path';
import ignore from 'ignore';

/**
 * Reads the specified ignore file and returns an ignore filter function.
 */
function getIgnoreFilter(baseDir, ignoreFile) {
    const ignorePath = path.join(baseDir, ignoreFile);
    let ig = ignore();

    if (fs.existsSync(ignorePath)) {
        const ignoreContent = fs.readFileSync(ignorePath, 'utf8');
        ig = ig.add(ignoreContent.split('\n'));
    }

    return ig;
}

/**
 * Determines how a file or directory should be treated based on the mode settings.
 */
function getIgnoreStatus(baseDir, filePath, isDir, mode, ig) {
    const relativePath = path.relative(baseDir, filePath);
    if (relativePath.startsWith('..')) return false; // Ensure we stay within the base directory

    const baseName = path.basename(filePath);
    const isHiddenDir = isDir && baseName.startsWith('.');
    const ignoredByIgnoreFile =
        ig.ignores(relativePath) || ig.ignores(`${relativePath}/`);

    let effectiveMode = mode;

    if (isHiddenDir) {
        effectiveMode = mode.hiddenMode; // Use hiddenMode for hidden directories
    } else if (isDir) {
        effectiveMode = mode.dirMode; // Use dirMode for normal directories
    } else {
        effectiveMode = mode.fileMode; // Use fileMode for files
    }

    // Respect the ignore file strictly; only allow "ignore", "seal", or "redact"
    if (ignoredByIgnoreFile) {
        switch (effectiveMode) {
            case 'ignore':
                return 'ignored'; // Completely remove
            case 'seal':
                return 'sealed'; // Keep, but with empty `children: []`
            case 'redact':
                return 'redacted'; // Keep, rename as `redactedDirName` or `redactedFileName`, with `children: []`
            default:
                return 'ignored'; // Default to ignored if an invalid mode is provided
        }
    }

    return false; // Not ignored by ignore file, include normally
}

/**
 * Recursively traverses a directory and builds the file structure.
 */
async function traverseDirectory(
    directory,
    baseDir,
    mode,
    ig,
    absolutePaths,
    recursive,
    redactedDirName,
    redactedFileName,
) {
    const getPath = (p) =>
        absolutePaths ? path.resolve(p) : path.relative(baseDir, p);

    const result = { path: getPath(directory), children: [] };

    let entries;
    try {
        entries = await fs.promises.readdir(directory, { withFileTypes: true });
    } catch {
        return result; // Handle permission errors, etc.
    }

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);
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
            ig,
        );

        if (ignoreStatus === 'ignored') {
            continue;
        }

        if (ignoreStatus === 'sealed') {
            result.children.push({ path: getPath(fullPath), children: [] });
            continue;
        }

        if (ignoreStatus === 'redacted') {
            result.children.push({
                path: isDir ? redactedDirName : redactedFileName,
                children: isDir ? [] : undefined,
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
                    redactedFileName,
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

/**
 * Main function to generate a structured file system object.
 */
export async function struct(
    dir,
    {
        ignoreFile = '.gitignore', // Custom ignore file (default to `.gitignore`)
        dirMode = 'ignore', // "ignore", "seal", "redact"
        fileMode = 'ignore', // "ignore", "redact"
        hiddenMode = 'ignore', // "ignore", "seal", "redact"
        absolutePaths = false, // Use absolute paths instead of relative paths
        recursive = false, // Whether to go deeper than the first level
        redactedDirName = '!dir', // Default redacted directory name
        redactedFileName = '!file', // Default redacted file name
    } = {},
) {
    if (!fs.existsSync(dir)) {
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
        redactedFileName,
    );

    return (
        result || {
            path: absolutePaths ? path.resolve(dir) : dir,
            children: [],
        }
    ); // Ensures the root directory is always included
}

export default struct;
