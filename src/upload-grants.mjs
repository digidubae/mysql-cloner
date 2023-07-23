import { $, spinner, question } from "zx";
import { containerNotAvailable, showError, parseMysqlConnectionString, showSuccess, fixExportedGrants } from "./utils.mjs";


const exportFileName = "export/exported-grants-from-local.sql"


const localDatabaseName = await question(`Enter the local mySql database name containing the grants you want to upload: `)
const localMySqlTargetUsers = await question(`Enter MySQL target local target users, separated by comma:`)

console.log(`\n\nYou will be entering now the configurations of the remote database you want you UPLOAD to.  Bad things can happen if you point to the wrong database server!`)

const connectionString = await question("Enter the connection string of the remote database: ")
const connectionObject = parseMysqlConnectionString(connectionString)

const remoteDatabaseHost = connectionObject.host
const remoteDatabasePort = connectionObject.port
const remoteDatabaseUser = connectionObject.username
const remoteDatabasePassword = connectionObject.password
const remoteDatabaseName = connectionObject.database


try {
    await spinner(`Fetching user grants from local database...`, () => $`docker exec -it percona_toolkit pt-show-grants --host=db --port=3306 --user=root --password=root --database=${localDatabaseName} --only=${localMySqlTargetUsers} > ${exportFileName}`)
  } catch (e) {
    const errorMessage = containerNotAvailable(e)
    showError(errorMessage || `Error fetching user grants: ${e}`)
    process.exit(1)
  }
  showSuccess(`Successfully exported local grants to ${exportFileName}`)

  try {
    await fixExportedGrants(exportFileName);
  } catch (e) {
    showError(`Error updating exported grants file: ${e}`)
    process.exit(1)
  }

  try {
    await spinner(`Uploading user grants to local database ${remoteDatabaseName}...`, () => $`docker exec -i db mysql -h${remoteDatabaseHost} -u${remoteDatabaseUser} -p${remoteDatabasePassword} -P${remoteDatabasePort} ${remoteDatabaseName} < ${exportFileName}`)
  } catch (e) {
    const errorMessage = containerNotAvailable(e)
    showError(errorMessage || `Error uploading exported grants to remote database: ${e}`)
    process.exit(1)
  }


  showSuccess(`Grants uploaded successfully!`)
