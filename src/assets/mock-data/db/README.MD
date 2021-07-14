# Getting started

See https://www.npmjs.com/package/json-server

Install json-server globally

```
npm install -g json-server
```

Start JSON server

```
json-server --watch db.json
```

Or run JSON server on docker

```
docker run -d -p 3001:80 -v {absolute-directory-path-here}\db.json:/data/db.json clue/json-server
```
