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

## Clone
```
docker-compose up (if not already up)
npm run clone
or: npm run clone-no-data (to export the database schema only)
```

## Reset local mysql
The reset command will simply delete the local docker volume and downloaded sql export file so you can start over.
```
npm run reset
```

## Author
👤 **Digidub**


## Show your support
Give a ⭐️ if this project helped you!

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_