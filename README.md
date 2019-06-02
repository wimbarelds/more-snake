# cw-snake

## Project setup
```
npm install
```

### Compiles and minifies for production
```
npm run build:all
```

### Build Frontend Once
```
npm run build
```

### Build Backend Once
```
npm run server:build
```

### Build + Watch Frontend
```
npm run watch
```

### Build + Watch Backend
```
npm run server:build:watch
```

### Run Server Once
```
npm run server
```

### Run Server with Nodemon
```
npm run server:watch
```

## Recommendation
* For development, use `watch`, `build:server:watch` and `server:watch` simultaneously.
* For production, use `build:all` together with something like [PM2](https://www.npmjs.com/package/pm2).