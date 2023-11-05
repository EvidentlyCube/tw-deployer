# TW Deployer

A tool for adding and managing multiple TiddlyWiki5 instances on the same server.

**Warning!** This tool is not production ready at the moment. It's also designed more towards experienced users.

**Warning!** This is still work in progress and a lot of important functionalities are just not working.

# Installing

Huge thanks to [this post on talk.tiddlywiki.org](https://talk.tiddlywiki.org/t/how-to-tiddlywiki-on-nodejs-nginx-proxy-letsencrypt/1183)
which I used as an inspiration.

## Prerequisites

1. Make sure `nginx` is installed on the server
2. Make sure `node` is installed on the server
3. Make sure `pm2` is installed globally -- `npm install -g pm2`

## Installation

-   Download (or clone) this repository and paste it in a directory of your liking
-   No need to install dependencies, this tool is dependency-free
-   Copy `config.example.js`, rename it to `config.js` and setup the file

## Preparing Nginx

I recommend having a single nginx configuration file for this tool. The minimal configuration is as follows:

```
server {
    server_name example.com
    client_max_body_size    10M;

    location / {
        proxy_pass              http://127.0.0.1:8001;
        proxy_set_header        Host             $host;
        proxy_set_header        X-Real-IP        $remote_addr;
        proxy_set_header        X-Forwarded-For  $proxy_add_x_forwarded_for;
    }
}
```

There MUST be `location / {` (mind the spaces) in the configuration file.
Make sure to run `sudo service nginx reload` for changes to have effect.

## Starting the app

Change the directory to where you downloaded/checked out the app. Then run `node index.js`. If errors are reported,
fix them. If no errors are reported press CTRL+C to kill the process and then run `pm2 start --name "TW Deployer" node -- index.js`
to register it with PM2 and make sure it's always running.

## Testing if things work

Go to the domain where you set up TW Deployer and test the app. **Warning!** At this point it's not possible to create
a new, empty wiki, only copy existing ones so it's not really possible to do anything productive on a fresh environment
right now.
