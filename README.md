<h1 align="center">Welcome to mysql-cloner 👋</h1>
<p align="center">
  <img alt="Version" src="https://img.shields.io/badge/version-1.1.0-blue.svg?cacheSeconds=2592000" />
  <a href="#" target="_blank">
    <img alt="License: ISC" src="https://img.shields.io/badge/License-ISC-yellow.svg" />
  </a>
</p>

> Download and Upload MySql databases with ease 🚀

## 🌟 What is MySql Cloner
MySql Cloner is a developer best friend to handle the operations of cloning of MySql databases with a focus on simplicity and minimum requirements. 

## ✨ Why MySql Cloner
Despite the existence of more modern ways to sync productions and development MySql databases (databases migrations / databases as a code), more often than not, I find myself in a situation where I need to clone remote MySQL database locally to backup the database schema and user grants, or to quickly spin up a local database for development.

This repo is not a total solution, but a pretty good scaffold that saves you tons of time to achieve a simple objective and to expand from it to other use cases you might require.

## 📋 Pre-requisites
Ensure you have the following prerequisites installed:

- Docker (tested on docker v20.10.24)
- Node.js version 16.0.0 or higher (tested on v16.18.0)

## 🛞 Setup
Follow these steps to get up and running:

1. Install the necessary dependencies
```sh
npm install
```

2. Create the `.env` file containing the configuration for both the remote and local MySQL
```sh
npm run create-env
```
Tip: choose a MySql docker image that matches your remote MySql you want to clone to avoid compatibility issues.

## 🚕 Start the local MySQL database
Spin up the local instance of MySQL and PHPMyAdmin
```sh
docker compose up -d
```

## 🥷🏻 Commands
### Clone the remote MySQL database locally
```sh
npm run clone-db
```
or
```sh
npm run clone-db-schema-only
```

### Clone the remote MySQL user grants locally (Note: You must have already cloned the database)
```sh
npm run clone-grants
```

### Upload the local MySQL database to another destination
⚠️ This command can do damage if you don't know what you're doing.

Only use if you intend to upload the current local MySQL database in it's current state to another database destination.  Bad things can happen if you upload the wrong database to a production server.

This command will explicitly ask you for the local database name to upload AND the remote MySql connection string as a safety measure.

```sh
npm run upload-local-db
```
or
```sh
npm run upload-local-db-schema-only
```

### Upload the local MySQL database user grants to another destination
⚠️ This command can do damage if you don't know what you're doing.

Only use if you intend to upload the current local MySQL database user grants to a remote database.  Bad things can happen if you upload the wrong grants to a production server.

This command will explicitly ask you for the local users to upload AND the remote MySql connection string as a safety measure.

```sh
npm run upload-grants
```
### Connect to an arbitrary MySql server
Connect to any MySql server using phpmyadmin.  This can be super useful sometimes for ad-hoc requirements.
```sh
npm run launch-arbitrary-phpmyadmin
```

### Reset the local MySQL environment (Deletes the local Docker volume and downloaded files)
```sh
npm run reset-local
```

## ✍️ Author
👤 **DigiDub**

## 🌟 Show Your Support
If this project has helped you in any way, give it a ⭐️ to show your appreciation!

***
_This README was generated with ❤️ using [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_