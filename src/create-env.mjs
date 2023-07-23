import * as fs from 'fs';
import { $, question } from "zx";
import { showSuccess, showWarning, writeFile } from './utils.mjs';
import { program } from 'commander';

const ENV_FILE = ".env"
const DEFAULT_LOCAL_MYSQL_DOCKER_IMAGE = "mysql:8"
const DEFAULT_LOCAL_PHPMYADMIN_DOCKER_IMAGE = "phpmyadmin/phpmyadmin:latest"
const DEFAULT_LOCAL_MYSQL_PORT = 3306
const DEFAULT_LOCAL_PHPMYADMIN_PORT = 8080

// program
//     .requiredOption('--execute', 'execute env file check', false)
// program.parse(process.argv);

// const options = program.opts();
// if (options.execute === true) {
//     checkForMissingEnvFile(true)
// }

export async function checkForMissingEnvFile(showConfirmationMessageIfAlreadyExists = false) {
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
        const remoteMySqlGrantUsers = await question("Remote mysql users (separated by comma) required if you want to replicate users locally / press Enter to skip: ")
        console.log(`\n`)


        writeFile(ENV_FILE, `LOCAL_MYSQL_DOCKER_IMAGE=${localMySqlDockerImage || DEFAULT_LOCAL_MYSQL_DOCKER_IMAGE}
LOCAL_PHPMYADMIN_DOCKER_IMAGE=${localPHPmyadminDockerImage || DEFAULT_LOCAL_PHPMYADMIN_DOCKER_IMAGE}
LOCAL_MYSQL_PORT=${localMySqlPort || DEFAULT_LOCAL_MYSQL_PORT}
LOCAL_PHPMYADMIN_PORT=${localPhpMyAdminPort || DEFAULT_LOCAL_PHPMYADMIN_PORT}
REMOTE_MYSQL_HOST=${remoteMySqlHost}
REMOTE_MYSQL_USER=${remoteMySqlUser}
REMOTE_MYSQL_PASSWORD=${remoteMySqlPassword}
REMOTE_MYSQL_PORT=${remoteMySqlPort}
REMOTE_MYSQL_DATABASE=${remoteMySqlDatabase}
REMOTE_MYSQL_GRANT_USERS=${remoteMySqlGrantUsers}
`)

        showSuccess(`${ENV_FILE} file is generated`)
        process.exit(0)
    } else {
        if (showConfirmationMessageIfAlreadyExists) {
            showSuccess(".env file already exists")
        }
    }


}