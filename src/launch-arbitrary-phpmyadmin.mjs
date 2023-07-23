import { $, question, spinner } from "zx";
import { parseMysqlConnectionString, showError } from "./utils.mjs";

try {
    const connectionString = await question("Enter the connection string of the arbitrary MySql Database you want to connect to: ")
    const connectionObject = parseMysqlConnectionString(connectionString)
    await spinner(`Running the container on http://localhost:8082`, () => $`docker run --name phpmyadmin_arbitrary -e "PMA_HOST=${connectionObject.host}" -e "PMA_PORT=${connectionObject.port}" -e "PMA_USER=${connectionObject.username}" -e "PMA_PASSWORD=${connectionObject.password}" -p 8082:80 --rm phpmyadmin`)
} catch (e) {
    showError(`Error running the container: ${e}`)
    process.exit(1)
}