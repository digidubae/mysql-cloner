import chalk from 'chalk';
import fs from 'fs';
import { validateEnv } from "env-vars-validator"
import { ConnectionStringParser } from "connection-string-parser";

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

export function parseMysqlConnectionString(connectionString) {
    const connectionStringParser = new ConnectionStringParser({
        scheme: "mysql",
        hosts: []
    });
    const connectionObject = connectionStringParser.parse(connectionString);

    if (connectionObject.hosts.length !== 1) {
        throw new Error(`Expected 1 host in connection string, got ${connectionObject.hosts.length}`)
    }
    const username = connectionObject.username
    const password = connectionObject.password
    const host = connectionObject.hosts[0].host
    const port = connectionObject.hosts[0].port
    const database = connectionObject.endpoint;

    const nullishKeys = getNullishProperties({ username: username, password: password, host: host, port: port, database: database })
    if (nullishKeys.length > 0) {
        throw new Error(`Could not parse mysql connection string: ${nullishKeys} are required`)
    }

    return {username, password, host, port, database}

}


function getNullishProperties(obj) {
    if (typeof obj !== 'object' || obj === null) {
        throw new Error('Could not check object for nullish. Not a valid object');
    }

    const nullishKeys = [];

    for (const key in obj) {
        if (obj[key] === null || obj[key] === undefined) {
            nullishKeys.push(key);
        }
    }

    return nullishKeys;
}