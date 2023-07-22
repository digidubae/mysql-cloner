import { $, spinner } from "zx";
import dotenv from 'dotenv';
import replace from "replace-in-file"
import { checkForMissingEnvFile } from "./create-env.mjs";
import { containerNotAvailable, showError, showSuccess, validateRequiredEnvironmentVars } from "./utils.mjs";

dotenv.config();
const remoteMySqlHost = process.env.REMOTE_MYSQL_HOST
const remoteMySqlPort = process.env.REMOTE_MYSQL_PORT
const remoteMySqlUser = process.env.REMOTE_MYSQL_USER
const remoteMySqlPassword = process.env.REMOTE_MYSQL_PASSWORD
const remoteMySqlDatabase = process.env.REMOTE_MYSQL_DATABASE

const localMySqlDatabase = remoteMySqlDatabase
const localMySqlPort = process.env.LOCAL_MYSQL_PORT

const exportFileName = "export/exported-grants-from-remote.sql"

await checkForMissingEnvFile()

validateRequiredEnvironmentVars({
  REMOTE_MYSQL_DATABASE: { type: 'string' },
  REMOTE_MYSQL_HOST: { type: 'string' },
  REMOTE_MYSQL_USER: { type: 'string' },
  REMOTE_MYSQL_PASSWORD: { type: 'string' },
  REMOTE_MYSQL_PORT: { type: 'integer' },
  LOCAL_MYSQL_PORT: { type: 'integer' },
  REMOTE_MYSQL_GRANT_USERS: { type: 'string' },
},
  {
    requiredProperties: ['REMOTE_MYSQL_DATABASE', 'REMOTE_MYSQL_HOST', 'REMOTE_MYSQL_USER', 'REMOTE_MYSQL_PASSWORD', 'REMOTE_MYSQL_PORT', 'LOCAL_MYSQL_PORT', 'REMOTE_MYSQL_GRANT_USERS'],
  },)

const remoteMySqlTargetUsers = process.env.REMOTE_MYSQL_GRANT_USERS

if (!remoteMySqlTargetUsers) {
  showError("Please set the REMOTE_MYSQL_GRANT_USERS in the .env file (comma separated for multiple users) ")
  process.exit(1)
}

try {
  await spinner(`Fetching user grants from ${remoteMySqlDatabase}...`, () => $`docker exec -it percona_toolkit pt-show-grants --host=${remoteMySqlHost} --port=${remoteMySqlPort} --user=${remoteMySqlUser} --password=${remoteMySqlPassword} --database=${remoteMySqlDatabase} --only=${remoteMySqlTargetUsers} > ${exportFileName}`)
} catch (e) {
  const errorMessage = containerNotAvailable(e)
  showError(errorMessage || `Error fetching user grants: ${e}`)
  process.exit(1)
}
showSuccess(`Successfully exported grants from ${remoteMySqlDatabase} to ${exportFileName}`)

try {
  await fixExportedGrants();
} catch (e) {
  showError(`Error updating exported grants file: ${e}`)
  process.exit(1)
}
try {
  await spinner(`Importing user grants to local database ${localMySqlDatabase}...`, () => $`docker exec -i db mysql -uroot -proot -P${localMySqlPort} ${localMySqlDatabase} < ${exportFileName}`)
} catch (e) {
  const errorMessage = containerNotAvailable(e)
  showError(errorMessage || `Error importing exported grants to local database: ${e}`)
  process.exit(1)
}

showSuccess(`Grants for users ${remoteMySqlTargetUsers} has been imported into the local database`)


async function fixExportedGrants() { // percona toolkit use double quotes which mysql does not like
  const options = {
    // files: './grants.sql',
    files: exportFileName,
    from: /"/g,
    to: '`',
    countMatches: true,

  };
  const results = await replace.replaceInFile(options)
  //   console.log(results)
}
