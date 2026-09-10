const fs = require('fs');
const path = require('path');

const IGNORED_DIRS = ['node_modules', '.git', '.vscode'];
const IGNORED_FILES = ['package-lock.json', 'dump-code.js', 'project-code.txt'];
const ALLOWED_EXT = ['.js', '.ejs', '.json', '.css'];

let output = '';

function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!IGNORED_DIRS.includes(file)) {
                scanDir(fullPath);
            }
        } else {
            const ext = path.extname(file);
            if (ALLOWED_EXT.includes(ext) && !IGNORED_FILES.includes(file)) {
                const relativePath = path.relative(__dirname, fullPath);
                output += `\n\n==================== FILE: ${relativePath} ====================\n\n`;
                output += fs.readFileSync(fullPath, 'utf-8');
            }
        }
    }
}

scanDir(__dirname);
fs.writeFileSync('project-code.txt', output);
console.log('Done! All code saved into project-code.txt');