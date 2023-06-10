import chalk from 'chalk';
import fs from 'fs';

export function showSuccess(s) {
    console.log("✅ " + chalk.green(s))
}

export function showWarning(w) {
    console.error("🟡 " + chalk.yellow.bold(w));
}

export function showError(e) {
    console.error("❌ " + chalk.blue.bgRed.bold(e));
}

export function formatQuestion(q) {
    return chalk.underline(q)
}

export function writeFile(fileName, data) {
    const fd = fs.openSync(fileName, 'w');
    fs.writeSync(fd, data);
    fs.closeSync(fd);
}