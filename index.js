// Importieren der erforderlichen Module
const { v4: uuidv4 } = require('uuid'); // UUID-Generator
const { redis } = require("./redis");   // Redis-Datenbank-Verbindung
const { app } = require("./app");       // Express.js-Anwendung

const path = '/api';        // Basispfad für die API-Endpunkte
const keyPrefix = 'links:'; // Präfix für Redis-Schlüssel

// HTTP-GET-Route, um Daten aus Redis abzurufen
app.get(path, async (request, response) => {
  try {
    // Alle Schlüssel mit dem angegebenen Präfix in Redis abrufen
    const keys = await redis.keys(keyPrefix + '*');
    // Die Daten für die gefundenen Schlüssel aus Redis abrufen
    const data = await redis.mget(keys);
    // Die Redis-Antwort formatieren und nach dem 'title'-Eigenschaftswert sortieren
    response.send(formatRedisResponse(data).sort(compareValues('title')));
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// HTTP-POST-Route, um Daten in Redis zu speichern
app.post(path, async (request, response) => {
  try {
    // Eine UUID ohne Bindestriche generieren
    const uuid = createUuidWithoutMinus();
    const data = request.body;
    // Die generierte UUID der Anfrage-Daten hinzufügen
    Object.assign(data, { _id: uuid });

    // Eine Multi-Transaktion in Redis erstellen und Daten speichern
    const multi = redis.multi();
    multi.set(`${keyPrefix + uuid}:${data.title}`, JSON.stringify(data));
    await multi.exec();

    response.status(200).json({});
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// HTTP-PATCH-Route, um Daten in Redis zu aktualisieren
app.patch(path, async (request, response) => {
  try {
    const data = request.body;
    // Daten in Redis anhand von '_id' und 'title' aktualisieren
    await redis.set(`${keyPrefix + data._id}:${data.title}`, JSON.stringify(data));
    response.status(200).json({});
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// HTTP-PATCH-Route, um Statistiken für einen Link zu aktualisieren
app.patch(path + '/stats', async (request, response) => {
  try {
    const data = request.body.data;
    // Daten für den Link aus Redis abrufen und als JSON parsen
    let loadedData = await redis.get(`${keyPrefix + data._id}:${data.title}`);
    let loadedDataJson = JSON.parse(loadedData);

    // Wenn 'clicked' nicht existiert, hinzufügen; andernfalls erhöhen
    if (!loadedDataJson.hasOwnProperty('clicked')) {
      Object.assign(loadedDataJson, { clicked: 1 });
    } else {
      loadedDataJson.clicked += 1;
    }

    // Aktualisierte Daten zurück in Redis speichern
    await redis.set(`${keyPrefix + data._id}:${data.title}`, JSON.stringify(loadedDataJson));
    response.status(200).json({});
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// HTTP-DELETE-Route, um Daten aus Redis zu löschen
app.delete(path, async (request, response) => {
  try {
    const data = request.body;
    // Den Schlüssel für den zu löschenden Link in Redis suchen
    const key = await redis.keys(`${keyPrefix + data._id}:*`);
    // Den Link aus Redis löschen
    await redis.del(key[0]);
    response.status(200).json({});
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Funktion zum Konvertieren der Redis-Antwort in JavaScript-Objekte
function formatRedisResponse(data) {
  return data.map(elm => JSON.parse(elm));
}

// Funktion zum Generieren einer UUID ohne Bindestriche
function createUuidWithoutMinus() {
  return uuidv4().replace(/-/g, '');
}

// Funktion zum Sortieren von Objekten anhand eines bestimmten Schlüssels
function compareValues(key, order = 'asc') {
  return function innerSort(a, b) {
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
      // Der Eigenschaft existiert nicht in einem der beiden Objekte
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
