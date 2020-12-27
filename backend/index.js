const express = require('express');
const Datastore = require('nedb');

const app = express();
app.listen(3000, () => console.log('listening at 3000'));
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));

const database = new Datastore('database.db');
database.loadDatabase();

const path = '/api';

app.get(path, (request, response) => {
  database.find({}, (err, data) => {
    if (err) {
      response.end();
      return;
    }
    response.json(data);
  });
});

app.post(path, (request, response) => {
  const data = request.body;
  database.insert(data);
  response.json(data);
});

app.patch(path, (request, response) => {
  const data = request.body;
  database.update({"_id":data._id}, data, {});
  response.json(data);
  });

app.delete(path, (request, response) => {
  const data = request.body;
  database.remove(data);
  response.json(data);
});
