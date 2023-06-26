<h1 align="center">Welcome to mysql-cloner 👋</h1>
<p align="center">
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <a href="#" target="_blank">
    <img alt="License: ISC" src="https://img.shields.io/badge/License-ISC-yellow.svg" />
  </a>
</p>

> Simplify and Accelerate MySQL Cloning Process for Your Local Environment 🚀

## 🌟 What is MySql Cloner
MySql Cloner is a light-weight solution designed to clone any remote MySQL database and run it locally with minimal setup required. 

## ✨ Why MySql Cloner
More often than not, I find myself in a situation where I need to clone a remote MySQL database locally to backup the database schema and user grants, or to quickly spin up a local database for local development.

## 📋 Pre-requisites
Ensure you have the following prerequisites installed:

- Docker and Docker Compose
- Node.js version 16.0.0 or higher

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

## 🚕 Start the local MySQL database
Spin up the local instance of MySQL and PHPMyAdmin
```sh
docker compose up -d
```

## 🥷🏻 Commands
Clone the remote MySQL database locally
```sh
npm run clone-db
```
or
```sh
npm run clone-db-schema-only
```

Clone the remote MySQL user grants locally (Note: You must have already cloned the database)
```sh
npm run clone-grants
```

Reset the local MySQL environment (Deletes the local Docker volume and downloaded files so you can start over)
```sh
npm run reset-local
```

## ✍️ Author
👤 **DigiDub**

## 🌟 Show Your Support
If this project has helped you in any way, give it a ⭐️ to show your appreciation!

***
_This README was generated with ❤️ using [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_