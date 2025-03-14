import fs from 'fs';
import path from 'path';
import os from 'os';

const symlinkPath = './test/mockup/symlink-folder';
const targetPath = './test/mockup/test';

function createSymlink() {
    if (fs.existsSync(symlinkPath)) {
        console.log('Symlink already exists.');
        return;
    }

    try {
        const absoluteTargetPath = path.resolve(targetPath);
        const absoluteSymlinkPath = path.resolve(symlinkPath);

        const symlinkType = os.platform() === 'win32' ? 'junction' : 'dir'; // Use junctions on Windows
        fs.symlinkSync(absoluteTargetPath, absoluteSymlinkPath, symlinkType);
        console.log(
            `✅ Created symlink: ${absoluteSymlinkPath} -> ${absoluteTargetPath} (Type: ${symlinkType})`,
        );
    } catch (err) {
        console.error(`❌ Failed to create symlink: ${err.message}`);
    }
}

createSymlink();
