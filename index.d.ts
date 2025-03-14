declare module 'struct-fs' {
    /**
     * Configuration options for struct-fs.
     */
    export interface StructFsOptions {
        /**
         * The ignore file to use (e.g., `.gitignore`, `.npmignore`).
         * Default: `.gitignore`
         */
        ignoreFile?: string;

        /**
         * Behavior for ignored directories.
         * - `'ignore'`: Completely remove ignored directories.
         * - `'seal'`: Keep ignored directories but hide their contents.
         * - `'redact'`: Keep ignored directories but replace names with `redactedDirName`.
         * Default: `'ignore'`
         */
        dirMode?: 'ignore' | 'seal' | 'redact';

        /**
         * Behavior for ignored files.
         * - `'ignore'`: Completely remove ignored files.
         * - `'redact'`: Keep ignored files but replace names with `redactedFileName`.
         * Default: `'ignore'`
         */
        fileMode?: 'ignore' | 'redact';

        /**
         * Behavior for hidden directories (those starting with `.`, e.g., `.git`).
         * - `'ignore'`: Completely remove hidden directories.
         * - `'seal'`: Keep hidden directories but hide their contents.
         * - `'redact'`: Keep hidden directories but replace names with `redactedDirName`.
         * Default: `'ignore'`
         */
        hiddenMode?: 'ignore' | 'seal' | 'redact';

        /**
         * Whether to return absolute paths instead of relative paths.
         * Default: `false`
         */
        absolutePaths?: boolean;

        /**
         * Whether to recursively traverse directories.
         * Default: `false`
         */
        recursive?: boolean;

        /**
         * Placeholder name for redacted directories.
         * Default: `"!dir"`
         */
        redactedDirName?: string;

        /**
         * Placeholder name for redacted files.
         * Default: `"!file"`
         */
        redactedFileName?: string;
    }

    /**
     * Structure representing a file or directory in the output.
     */
    export interface StructFsEntry {
        /**
         * The path of the file or directory.
         */
        path: string;

        /**
         * If the entry is a directory, it may contain children.
         */
        children?: StructFsEntry[];

        /**
         * If the entry is a symbolic link.
         */
        sym?: boolean;
    }

    /**
     * Generates a structured representation of the file system.
     *
     * @param dir - The directory to scan.
     * @param options - Optional configuration settings.
     * @returns A promise resolving to the structured representation of the file system.
     */
    export function structureFs(
        dir: string,
        options?: StructFsOptions,
    ): Promise<StructFsEntry>;

    export default structureFs;
}
