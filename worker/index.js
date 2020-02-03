const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});
const pub = redisClient.duplicate();
const sub = redisClient.duplicate();

function fib(index) {
    if (index < 2) return index;
    return fib(index - 1) + fib (index - 2);
}

sub.on('message', (channel, message) => {
    const result = fib(parseInt(message))
    redisClient.hset('values', message, result);

    pub.publish('update', `${message}:${result}`);
});
sub.subscribe('insert');
