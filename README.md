<h1 align="center">Welcome to mysql-cloner 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <a href="#" target="_blank">
    <img alt="License: ISC" src="https://img.shields.io/badge/License-ISC-yellow.svg" />
  </a>
</p>

> An elegant solution to clone any remote mysql database to your laptop with minimum local setup 😌

## Pre-requisites
- docker, docker-compose
- Nodejs >= 16.0.0

## Install
```sh
npm install
```

## Create .env file
The .env file is required as it contains the configuration of remote and local mysql
```sh
npm run create-env
```

## Spin up local environment
Spin up the local instance of mysql and phpmyadmin
```sh
docker compose up -d
``` 

## Clone a remote mysql locally
```sh
npm run clone-db
```
or
```sh
npm run clone-db-schema-only
```

## Clone a remote mysql users grants locally
Sometimes you want to clone the mysql users permissions locally.  Note: you should have cloned the database first.
```sh
npm run clone-grants
```

## Reset local mysql
This will simply delete the local docker volume and downloaded files so you can start over.
```sh
npm run reset-local
```

## Author
👤 **DigiDub**


## Show your support
Give a ⭐️ if this project helped you!

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_