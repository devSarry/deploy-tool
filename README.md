# deploy-tool

The aim of this tool is to automate some the deployment process of laravel apps.

## Big TODO
- [x] Mechanisim to connect over ssh to server
- [x] Check if server has been provisioned
- [x] Run a provision script if need be
- [ ] Create a project folder (/var/project/project_name)
- [ ] initilize it at a bare repo
- [ ] craete post recieve scripts and make them executable (chmod +x)
    - responsible for composer install, migrations, etc
    - clean up
    - restart services
- [ ] add new git remotoe to the local repo and push
- [ ] create nginx or caddy file (/etc/nginx/sites-enabled/hostname.com)
- [ ] restart services

## Components needed
1. Some templating engine for creating bash/nginx/caddy files
2. Some config file and a generator to create config file.

## Small TODO / Bugs
- [x] change where error log writes to.
- [ ] if the server is a new server node-ssh hangs when it tries to connect because server key is not in known hosts

---

# Documentation

## Introduction
The trimmer cli tool is built around a config.json file that stores the most important information about each project.

Each `config.json` file will be published in the root of a project with the `trimmer init` command.

## Structure 

```json 
{
  "digital_ocean": {
    "confirm": true,
    "key": "aaaaaaaaaaaa"
  },
  "server": {
    "confirm": false
  },
  "project": {
    "domain": "site.com",
    "github_repo": "dopyoman/test",
    "folder": "/var/site/",
    "git_folder": "/home/user/site.git"
  },
  "provision": {
    "confirm": true,
    "script": "path",
    "remote_working_dir": "path"
  }
  
  ```
The data structure is the heart of the application.

Next we will look at a high level overview of the application and it's main components. 

## Overview

![overview](https://github.com/dopyoman/deploy-tool/blob/master/trimmer.png?raw=true)


What you can see here are 3 main modules

1. ErrorHandler
2. SSH
3. config

There is also one file helper module not figured. It's job is to just assist with file input output tasks.

The diamond is the external templeting app called `jigsaw-trimmer` and it's job is to create and build the template files. 

Finally there are several files that the app reads and writes to.

