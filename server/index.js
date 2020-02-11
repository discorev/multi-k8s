const keys = require('./keys');

// --------------------------------------
// Express App Setup
// --------------------------------------
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const http = require('http').createServer(app);
app.use(cors());
app.use(bodyParser.json());

// --------------------------------------
// Postgres Client Setup
// --------------------------------------
const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});
pgClient.on('error', () => console.log('Lost PG connection'));
pgClient
    .query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch(err => console.log(err));

// --------------------------------------
// Redis Client Setup
// --------------------------------------
const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

// --------------------------------------
// WebSockets
// --------------------------------------
const WebSocket = require('ws');
const wss = new WebSocket.Server({server: http});
wss.on('connection', ws => {
    ws.isAlive = true;

    ws.on('pong', () =>{
        ws.isAlive = true;
    });
    console.log('Connected');
});
const interval = setInterval(() => {
    wss.clients.forEach(function each(ws) {
        if (ws.isAlive === false) {
            console.log('Client is dead');
            return ws.terminate();
        }
        
        ws.isAlive = false;
        ws.ping(() => {});
    });
}, 3000);

// --------------------------------------
// Redis subscriptions
// --------------------------------------

// Subscribe to calculation updates
const redisUpdateSubscription = redisClient.duplicate();
redisUpdateSubscription.on('message', (channel, message) => {
    wss.clients.forEach((ws) => {
        const msg = JSON.stringify({result: JSON.parse(message)});
        ws.send(msg);
    });
});
redisUpdateSubscription.subscribe('update');

// Subscribe to new indexes being inserted
// We can't just use the put method below as that will only message
// clients on the same server
const redisInsertSubscription = redisClient.duplicate();
redisInsertSubscription.on('message', (channel, message) => {
    wss.clients.forEach((ws) => {
        const msg = JSON.stringify({number: parseInt(message)});
        ws.send(msg);
    });
});
redisInsertSubscription.subscribe('insert');

// --------------------------------------
// Express route handlers
// --------------------------------------
app.get('/', (req, res) => {
    res.send('Hi');
});

app.get('/values/all', async (req, res) => {
    const values = await pgClient.query('SELECT * FROM values ORDER BY 1');
    
    res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
    redisClient.hgetall('values', (err, values) => {
        res.send(values);
    });
});

const redisPublisher = redisClient.duplicate();
app.put('/values', async (req, res) => {
    const index = parseInt(req.body.index);

    if (index < 0) {
        return res.status(422).send('Index too low');
    }

    if (index > 40) {
        return res.status(422).send('Index too high');
    }

    const value = await pgClient.query('SELECT number from values WHERE number = $1', [index]);
    if (value.rowCount < 1) {
        redisClient.hset('values', index, 'Nothing yet!');
        redisPublisher.publish('insert', index);
        pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);
        res.send({working: true});
    } else {
        res.send({working: false, result: value.rows[0]['number']})
    }
});

app.delete('/values', async (req, res) => {
    pgClient.query('DELETE FROM values');
    redisClient.flushdb();

    res.send({complete: true});
});

// --------------------------------------
// Setup a http listener
// --------------------------------------
http.listen(5000, err => {
    console.log('Listening');
});
