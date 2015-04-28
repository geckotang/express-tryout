# browser-sync + nodemon + expressjs + basic-auth

A gulp recipe using vanilla [```browser-sync```](https://github.com/shakyShane/browser-sync) and [```gulp-nodemon```](https://github.com/JacksonGariety/gulp-nodemon) and [```basic-auth-connect```](https://github.com/expressjs/basic-auth-connect) to run an ExpressJS server app with Basic Auth Middleware and live-reloading.

## Install

```sh
$npm install
```

## Run server with browserSync

```sh
$npm start
```

1. Running `gulp` will start two server applications:
    - Our vanilla ExpressJS server at http://localhost:5000
    - A proxied version of our ExpressJS server at http://localhost:3000 (This will be connected to browser-sync)
2. To see browser-sync + nodemon working together:
    - Edit `www/common/js/script.js` or `www/common/css/style.css` to see `browser-sync` injecting changed css into page without reloading page
    - Edit `www/index.html` to see browser-sync reloading browser upon change
    - Edit `app.js` to see `nodemon` restarting server and `browser-sync` reloading page upon page

## Run server

```sh
$npm run server
```

- Running `gulp` will start a server applications:
    - Our vanilla ExpressJS server at http://localhost:5000
