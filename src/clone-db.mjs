import { $, spinner } from "zx";
import { program } from 'commander';
import dotenv from 'dotenv';
import { containerNotAvailable, showError, showSuccess, validateRequiredEnvironmentVars } from "./utils.mjs";
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

const exportFileName = "export/exported-db-from-remote.sql"

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
    await spinner(`Downloading remote database ${conf.remoteMySqlDatabase}...`, () => $`docker exec -i db mysqldump --set-gtid-purged=OFF ${options.exportSchemaOnly ? '--no-data' : ''} -h${conf.remoteMySqlHost} -u${conf.remoteMySqlUsername} -p${conf.remoteMySqlPassword} -P${conf.remoteMySqlPort} --databases ${conf.remoteMySqlDatabase}  > ${exportFileName}`)
} catch (e) {
    const errorMessage = containerNotAvailable(e)
    showError(errorMessage || `Error downloading remote database: ${e}`)
    process.exit(1)
}

try {
    await spinner(`Importing data into local database ${conf.remoteMySqlDatabase}...`, () => $`docker exec -i db mysql -uroot -proot -P${conf.localMySqlPort} < ${exportFileName}`)
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

console.log(`\nYou can also connect to your local database through phpmyadmin at: http://localhost:${conf.localPhpMyAdminPort}\n`)






