import { $, spinner, question } from "zx";
import { program } from 'commander';
import dotenv from 'dotenv';
import chalk from 'chalk';
import * as fs from 'fs';
$.verbose = true;

const ENV_FILE = ".env"
const DEFAULT_LOCAL_MYSQL_DOCKER_IMAGE = "mysql:8"
const DEFAULT_LOCAL_PHPMYADMIN_DOCKER_IMAGE = "phpmyadmin/phpmyadmin:latest"
const DEFAULT_LOCAL_MYSQL_PORT = 3306
const DEFAULT_LOCAL_PHPMYADMIN_PORT = 8080

await checkEnvFile() // help the user create .env file if does not exist.

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
    showError( errorMessage || `Error importing data into local database: ${e}`)
    process.exit(1)
}

console.log(chalk.green(`\nAwesome, you can now connect to your local mysql database with the following settings:`))

console.log(`username = root`)
console.log(`password = root`)
console.log(`host = localhost`)
console.log(`port = ${process.env.LOCAL_MYSQL_PORT}`)
console.log(`database = ${options.remoteMySqlDatabase}`)
console.log(`*You can change any of the above by updating the .env file and docker compose up -d to pick up the changes\n`)

console.log(`\nYou can also connect to your local database through phpmyadmin at: http://localhost:${options.localPhpMyAdminPort}\n`)


function formatQuestion(q) {
    return chalk.underline(q)
}

function showError(e) {
    console.error(chalk.blue.bgRed.bold(e));
}

function showWarning(w) {
    console.error('⚠️ ' + chalk.yellow.bold(w));
}

function containerNotAvailable(e) {
    if (e.toString().includes("No such container")) {
        return `Docker does not seem to be up.  Try docker-compose up -d first.`
    }
}





async function checkEnvFile() {
    if (!fs.existsSync(ENV_FILE)) {
        showWarning("No .env file found.  Let me help you create one..\n")
        const localMySqlDockerImage = await question(`Local mysql docker image (enter for default ${DEFAULT_LOCAL_MYSQL_DOCKER_IMAGE}): `)
        const localPHPmyadminDockerImage = await question(`Local phpmyadmin docker image (enter for default ${DEFAULT_LOCAL_PHPMYADMIN_DOCKER_IMAGE}): `)

        const localMySqlPort = await question(`Local mysql port (enter for default ${DEFAULT_LOCAL_MYSQL_PORT}): `)
        const localPhpMyAdminPort = await question(`Local phpmyadmin port (enter for default ${DEFAULT_LOCAL_PHPMYADMIN_PORT}): `)
        const remoteMySqlHost = await question("Remote mysql host: ")
        const remoteMySqlUser = await question("Remote mysql username: ")
        const remoteMySqlPassword = await question("Remote mysql password: ")
        const remoteMySqlPort = await question("Remote mysql port: ")
        const remoteMySqlDatabase = await question("Remote mysql database name: ")
        console.log(`\n`)

        await $`cat > ${ENV_FILE} << EOF
LOCAL_MYSQL_DOCKER_IMAGE=${localMySqlDockerImage || DEFAULT_LOCAL_MYSQL_DOCKER_IMAGE}
LOCAL_PHPMYADMIN_DOCKER_IMAGE=${localPHPmyadminDockerImage || DEFAULT_LOCAL_PHPMYADMIN_DOCKER_IMAGE}
LOCAL_MYSQL_PORT=${localMySqlPort || DEFAULT_LOCAL_MYSQL_PORT}
LOCAL_PHPMYADMIN_PORT=${localPhpMyAdminPort || DEFAULT_LOCAL_PHPMYADMIN_PORT}
REMOTE_MYSQL_HOST=${remoteMySqlHost}
REMOTE_MYSQL_USER=${remoteMySqlUser}
REMOTE_MYSQL_PASSWORD=${remoteMySqlPassword}
REMOTE_MYSQL_PORT=${remoteMySqlPort}
REMOTE_MYSQL_DATABASE=${remoteMySqlDatabase}
EOF`

        console.log(`\n\n./${ENV_FILE} file is generated, now do this:`)
        console.log(`docker-compose up -d`)
        console.log(`npm start`)
        process.exit(0)
    }
}