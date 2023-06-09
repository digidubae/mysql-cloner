import { $, spinner, question } from "zx";
import { program } from 'commander';
import dotenv from 'dotenv';
import { containerNotAvailable, formatQuestion, showError, showSuccess, showWarning, validateRequiredEnvironmentVars } from "./utils.mjs";
import { checkForMissingEnvFile } from "./create-env.mjs";

$.verbose = false;

await checkForMissingEnvFile()

dotenv.config();

validateRequiredEnvironmentVars({
    REMOTE_MYSQL_DATABASE: { type: 'string' },
    REMOTE_MYSQL_HOST: { type: 'string' },
    REMOTE_MYSQL_USER: { type: 'string' },
    REMOTE_MYSQL_PASSWORD: { type: 'string' },
    REMOTE_MYSQL_PORT: { type: 'integer' },
    LOCAL_MYSQL_PORT: { type: 'integer' },
    LOCAL_PHPMYADMIN_PORT: { type: 'integer' },
},
    {
        requiredProperties: ['REMOTE_MYSQL_DATABASE', 'REMOTE_MYSQL_HOST', 'REMOTE_MYSQL_USER', 'REMOTE_MYSQL_PASSWORD', 'REMOTE_MYSQL_PORT', 'LOCAL_MYSQL_PORT', 'LOCAL_PHPMYADMIN_PORT'],
    },)

program
    .requiredOption('--exportSchemaOnly', 'export only schema without data', false)

program.parse(process.argv);
const options = program.opts();

const exportFileName = "export/backup.sql"

const conf = {
    remoteMySqlDatabase: process.env.REMOTE_MYSQL_DATABASE,
    remoteMySqlHost: process.env.REMOTE_MYSQL_HOST,
    remoteMySqlUsername: process.env.REMOTE_MYSQL_USER,
    remoteMySqlPassword: process.env.REMOTE_MYSQL_PASSWORD,
    remoteMySqlPort: process.env.REMOTE_MYSQL_PORT,
    localPhpMyAdminPort: process.env.LOCAL_PHPMYADMIN_PORT,
    localMySqlPort: process.env.LOCAL_MYSQL_PORT,
}

try {
    await spinner(`Downloading remote database ${conf.remoteMySqlDatabase}...`, () => $`docker exec -i db mysqldump --set-gtid-purged=OFF ${options.exportSchemaOnly ? '--no-data' : ''} -h${conf.remoteMySqlHost} -u${conf.remoteMySqlUsername} -p${conf.remoteMySqlPassword} -P${conf.remoteMySqlPort} ${conf.remoteMySqlDatabase}  > ${exportFileName}`)
} catch (e) {
    const errorMessage = containerNotAvailable(e)
    showError(errorMessage || `Error downloading remote database: ${e}`)
    process.exit(1)
}

try {
    await spinner(`Creating local database ${conf.remoteMySqlDatabase}...`, () => $`docker exec db mysql -uroot -proot -P${conf.localMySqlPort} -e 'CREATE DATABASE ${conf.remoteMySqlDatabase};'`)
} catch (e) {
    const errorMessage = containerNotAvailable(e)
    showWarning(errorMessage || `Could not create local database: ${e}`)
    const proceed = await question(formatQuestion(`\nThere has been an error in creating local database ${conf.remoteMySqlDatabase}, would you like to continue anyway? (y/N): `))
    if (proceed !== "y" && proceed !== "Y") {
        process.exit(1)
    }
}

try {
    await spinner(`Importing data into local database ${conf.remoteMySqlDatabase}...`, () => $`docker exec -i db mysql -uroot -proot -P${conf.localMySqlPort} ${conf.remoteMySqlDatabase} < ${exportFileName}`)
} catch (e) {
    const errorMessage = containerNotAvailable(e)
    showError(errorMessage || `Error importing data into local database: ${e}`)
    process.exit(1)
}

showSuccess(`\nAwesome, you can now connect to your local mysql database with the following settings:`)

console.log(`username = root`)
console.log(`password = root`)
console.log(`host = localhost`)
console.log(`port = ${process.env.LOCAL_MYSQL_PORT}`)
console.log(`database = ${conf.remoteMySqlDatabase}`)
console.log(`*You can change any of the above by updating the .env file and docker compose up -d to pick up the changes\n`)

console.log(`\nYou can also connect to your local database through phpmyadmin at: http://localhost:${conf.localPhpMyAdminPort}\n`)






