import chalk from 'chalk';
import fs from 'fs';
import { validateEnv } from "env-vars-validator"

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

export function containerNotAvailable(e) {
    if (e.toString().includes("No such container")) {
        return `Docker does not seem to be up.  Try docker compose up -d first.`
    }
}

export function validateRequiredEnvironmentVars(validationSchema, options) {
    try {
        validateEnv(validationSchema, options);
    } catch (e) {
        showError(`Invalid environment variables: ${e} `)
        process.exit(1)
    }
}