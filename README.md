restfs
======

A Node JS web app that exposes the filesystem over a REST API

## Setup

```
git clone git@github.com:guidomb/restfs.git
cd restfs
brew install node
npm install
node app.js PATH_TO_BASE_DIR
```

then

```
curl -v "http://localhost:4040/files?path=PATH_RELATIVE_TO_BASE_DIR"
```
