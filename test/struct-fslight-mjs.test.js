import { describe, it, expect } from 'vitest';
import structFs from '../src/index.js';
import path from 'path';

const mockupPath = path.join('test', 'mockup');

describe('structFs()', () => {
    it('Basic functionality - Ensures relative paths & ignores certain files', async () => {
        const result = await structFs(mockupPath, { recursive: true });

        let bFoundNested = true;

        result.children.forEach((child) => {
            if (child.path == 'nested') {
                bFoundNested = true;
            }

            expect(bFoundNested).toEqual(true);

            expect(child.path).not.toBe('node_modules'); // Should be ignored
            expect(child.path).not.toBe('.env'); // Should be ignored
        });
    });

    it('No recursion - Ensures only first level is read', async () => {
        const result = await structFs(mockupPath);

        result.children.forEach((child) => {
            if (child.children) {
                expect(child.children.length).toEqual(0); // Shouldn't traverse deeper
            }
        });
    });

    it('IgnoreFile - Allows using a different ignore file', async () => {
        const result = await structFs(mockupPath, { ignoreFile: 'NOTHING' });

        let bFoundEnv = false;

        result.children.forEach((child) => {
            if (child.path === '.env') {
                bFoundEnv = true;
            }
        });

        expect(bFoundEnv).toBe(true); // .env should be found because NOTHING is not a real ignore file
    });

    it('Sealed directories - Ignores but keeps directory with empty children', async () => {
        const result = await structFs(mockupPath, {
            dirMode: 'seal',
            recursive: true,
        });

        result.children.forEach((child) => {
            if (child.path === 'node_modules') {
                expect(child.children).toEqual([]); // Should be empty
            }
        });
    });

    it('Redacted directories - Renames ignored directories but keeps them', async () => {
        const result = await structFs(mockupPath, {
            dirMode: 'redact',
            recursive: true,
        });

        const containsRedacted = result.children.some(
            (child) => child.path === '!dir',
        );

        expect(containsRedacted).toBe(true); // Some directories should be redacted
    });

    it('Redacted files - Renames ignored files but keeps them', async () => {
        const result = await structFs(mockupPath, { fileMode: 'redact' });

        const containsRedacted = result.children.some(
            (child) => child.path === '!file',
        );

        expect(containsRedacted).toBe(true); // Some files should be redacted
    });

    it('Detects symbolic links correctly', async () => {
        const result = await structFs(mockupPath, { recursive: true });

        const containsSymlink = result.children.some(
            (child) => child.sym === true,
        );

        expect(containsSymlink).toBe(true); // At least one symlink should be present
    });

    it('Supports absolute paths when enabled', async () => {
        const result = await structFs(mockupPath, { absolutePaths: true });

        expect(result.path).toEqual(path.resolve(mockupPath));

        result.children.forEach((child) => {
            expect(child.path).toContain(path.resolve(mockupPath)); // Paths should be absolute
        });
    });

    it('Handles deep recursion - Nested files are included', async () => {
        const result = await structFs(mockupPath, { recursive: true });

        const nestedFolder = result.children.find(
            (child) => child.path === 'nested',
        );

        expect(nestedFolder).toBeDefined(); // Ensure nested folder exists
        expect(nestedFolder.children.length).toBeGreaterThan(0); // Ensure children exist
    });

    it('Handles empty directories - Empty folders should still appear', async () => {
        const result = await structFs(mockupPath, { recursive: true });

        const emptyFolder = result.children.find(
            (child) => child.path === 'empty-folder',
        );

        expect(emptyFolder).toBeDefined(); // Empty folder should still be there
        expect(emptyFolder.children).toEqual([]); // Should have no children
    });
});
