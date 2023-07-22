import { $, spinner, question } from "zx";
import { containerNotAvailable, showError, showWarning, formatQuestion, parseMysqlConnectionString } from "./utils.mjs";
import { program } from 'commander';


const localDatabaseName = await question(`Enter the local mySql database name you want to upload: `)

console.log(`\n\nYou will be entering now the configurations of the remote database you want you UPLOAD to.  Bad things can happen if you point to the wrong database server!`)


const connectionString = await question("Enter the connection string of the remote database: ")
const connectionObject = parseMysqlConnectionString(connectionString)

const remoteDatabaseHost = connectionObject.host
const remoteDatabasePort = connectionObject.port
const remoteDatabaseUser = connectionObject.username
const remoteDatabasePassword = connectionObject.password
const remoteDatabaseName = connectionObject.database


const exportFileName = "export/exported-db-from-local.sql"


program
    .requiredOption('--uploadSchemaOnly', 'upload only schema without data', false)

program.parse(process.argv);
const options = program.opts()

try {
    await spinner(`Exporting local database ${localDatabaseName}...`, () => $`docker exec -i db mysqldump --set-gtid-purged=OFF ${options.uploadSchemaOnly ? '--no-data' : ''} -hlocalhost -uroot -proot -P3306 ${localDatabaseName}  > ${exportFileName}`)
} catch (e) {
    const errorMessage = containerNotAvailable(e)
    showError(errorMessage || `Could not export local database: ${e}`)
    process.exit(1)
}

try {
    await spinner(`Creating remote database ${remoteDatabaseName}...`, () => $`docker exec db mysql -h${remoteDatabaseHost} -u${remoteDatabaseUser} -p${remoteDatabasePassword} -P${remoteDatabasePort} -e 'CREATE DATABASE ${remoteDatabaseName};'`)
} catch (e) {
    const errorMessage = containerNotAvailable(e)
    showWarning(errorMessage || `Could not create remote database: ${e}`)
    const proceed = await question(formatQuestion(`\nThere has been an error in creating remote database ${remoteDatabaseName}, would you like to continue anyway? (y/N): `))
    if (proceed !== "y" && proceed !== "Y") {
        process.exit(1)
    }
}

try {
    await spinner(`Uploading local database ${localDatabaseName} to ${remoteDatabaseHost}:${remoteDatabasePort}/${remoteDatabaseName}...`, () => $`docker exec -i db mysql -h${remoteDatabaseHost} -u${remoteDatabaseUser} -p${remoteDatabasePassword} -P${remoteDatabasePort} ${remoteDatabaseName} < ${exportFileName}`)
} catch (e) {
    const errorMessage = containerNotAvailable(e)
    showError(errorMessage || `Could not upload local database: ${e}`)
    process.exit(1)
}