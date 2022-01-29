const express = require('express');
const {v4 : uuidv4} = require('uuid');
const Redis = require("ioredis");

const redis = new Redis({
  port: 6379, // Redis port
  host: "192.168.2.125", // Redis host
  family: 4, // 4 (IPv4) or 6 (IPv6)
  db: 0,
});

const app = express();
app.listen(3000, () => console.log('listening at 3000'));
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE')
    return res.status(200).json({});    
  }
  next();
})

const path = '/api';
const keyPrefix = 'links:'

app.get(path, async (request, response) => {
  let keys = await redis.keys(keyPrefix + '*')
  let data = await redis.mget(keys)
  response.send(formatRedisResponse(data).sort(compareValues('title')))
});

app.post(path, async (request, response) => {
  let uuid = createUuidWithoutMinus()
  const data = request.body;
  Object.assign(data, {_id:uuid})
  let n = await redis.set(`${keyPrefix + uuid}:${data.title}`, JSON.stringify(data))
  response.status(200).json({});
});

app.patch(path, (request, response) => {
  const data = request.body;
  redis.set(`${keyPrefix + data._id}:${data.title}`, JSON.stringify(data))
  response.status(200).json({});
});

app.patch(path + '/stats',async (request, response) => {
  const data = request.body.data;
  let loadetData = await redis.get(`${keyPrefix + data._id}:${data.title}`)
  let loadetDataJson = JSON.parse(loadetData)
  if(!loadetDataJson.hasOwnProperty('clicked')){
    Object.assign(loadetDataJson, {clicked:1})
  } else {
    loadetDataJson.clicked = loadetDataJson.clicked + 1 
  }
  redis.set(`${keyPrefix + data._id}:${data.title}`, JSON.stringify(loadetDataJson))
  response.status(200).json({});
});

app.delete(path, async (request, response) => {
  const data = request.body;
  let key = await redis.keys(`${keyPrefix + data._id}:*`)
  redis.del(key[0])
  response.status(200).json({});
});

function formatRedisResponse(data) {
  let res = []
  data.forEach(elm=>{
    res.push(JSON.parse(elm))
  })
  return res
}

function createUuidWithoutMinus(){
  return uuidv4().replace(/-/g,'')
}

function compareValues(key, order = 'asc') {
  return function innerSort(a, b) {
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
      // property doesn't exist on either object
      return 0;
    }

    const varA = (typeof a[key] === 'string')
      ? a[key].toUpperCase() : a[key];
    const varB = (typeof b[key] === 'string')
      ? b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }
    return (
      (order === 'desc') ? (comparison * -1) : comparison
    );
  };
}