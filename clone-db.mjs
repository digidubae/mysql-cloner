import { $, spinner, question } from "zx";
import { program } from 'commander';
import dotenv from 'dotenv';
import { formatQuestion, showError, showSuccess, showWarning } from "./utils.mjs";
import { checkEnvFile } from "./create-env.mjs";
$.verbose = false;

await checkEnvFile() 

dotenv.config();

program
    .requiredOption('--localMySqlDockerImage <localMySqlDockerImage>', 'local mysql docker image name', process.env.LOCAL_MYSQL_DOCKER_IMAGE)
    .requiredOption('--localPhpMyAdminImage <localPhpMyAdminImage>', 'local phpmyadmin docker image name', process.env.LOCAL_PHPMYADMIN_DOCKER_IMAGE)
    .requiredOption('--localMySqlPort <localMySqlPort>', 'local mysql port', process.env.LOCAL_MYSQL_PORT)
    .requiredOption('--localPhpMyAdminPort <localPhpMyAdminPort>', 'local phpmyadmin port', process.env.LOCAL_PHPMYADMIN_PORT)
    .requiredOption('--remoteMySqlHost <remoteMySqlHost>', 'remote mysql host', process.env.REMOTE_MYSQL_HOST)
    .requiredOption('--remoteMySqlPort <remoteMySqlPort>', 'remote mysql port', process.env.REMOTE_MYSQL_PORT)
    .requiredOption('--remoteMySqlUsername <remoteMySqlUsername>', 'remote mysql username', process.env.REMOTE_MYSQL_USER)
    .requiredOption('--remoteMySqlPassword <remoteMySqlPassword>', 'remote mysql password', process.env.REMOTE_MYSQL_PASSWORD)
    .requiredOption('--remoteMySqlDatabase <remoteMySqlDatabase>', 'remote mysql name', process.env.REMOTE_MYSQL_DATABASE)
    .requiredOption('--exportSchemaOnly', 'export only schema without data', false)



program.parse(process.argv);
const options = program.opts();

try {
    await spinner(`Downloading remote database ${options.remoteMySqlDatabase}...`, () => $`docker exec -i db mysqldump --set-gtid-purged=OFF ${options.exportSchemaOnly ? '--no-data' : ''} -h${options.remoteMySqlHost} -u${options.remoteMySqlUsername} -p${options.remoteMySqlPassword} -P${options.remoteMySqlPort} ${options.remoteMySqlDatabase}  > backup.sql`)
} catch (e) {
    const errorMessage = containerNotAvailable(e)
    showError(errorMessage || `Error downloading remote database: ${e}`)
    process.exit(1)
}

try {
    await spinner(`Creating local database ${options.remoteMySqlDatabase}...`, () => $`docker exec db mysql -uroot -proot -P${options.localMySqlPort} -e 'CREATE DATABASE ${options.remoteMySqlDatabase};'`)
} catch (e) {
    const errorMessage = containerNotAvailable(e)
    showWarning(errorMessage || `Could not create local database: ${e}`)
    const proceed = await question(formatQuestion(`\nThere has been an error in creating local database ${options.remoteMySqlDatabase}, would you like to continue anyway? (y/N): `))
    if (proceed !== "y" && proceed !== "Y") {
        process.exit(1)
    }
}

try {
    await spinner(`Importing data into local database ${options.remoteMySqlDatabase}...`, () => $`docker exec -i db mysql -uroot -proot -P${options.localMySqlPort} ${options.remoteMySqlDatabase} < backup.sql`)
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
console.log(`database = ${options.remoteMySqlDatabase}`)
console.log(`*You can change any of the above by updating the .env file and docker compose up -d to pick up the changes\n`)

console.log(`\nYou can also connect to your local database through phpmyadmin at: http://localhost:${options.localPhpMyAdminPort}\n`)



function containerNotAvailable(e) {
    if (e.toString().includes("No such container")) {
        return `Docker does not seem to be up.  Try docker-compose up -d first.`
    }
}


