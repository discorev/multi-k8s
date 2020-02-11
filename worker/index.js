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

// on first startup, loop through all current message
redisClient.hgetall('values', (err, values) => {
    // Handle the case that redis is empty
    if (values == null)
        return
    for(const key of Object.keys(values)) {
        if (values[key] === 'Nothing yet!') {
            // Mark as being done
            redisClient.hset('values', key, 'Calculating...');
            // Calculate!
            const index = parseInt(key);
            const fibNumber = fib(index);
            redisClient.hset('values', key, fibNumber);
        
            // Publish the message with a json dictionary
            const result = {index: index, number: fibNumber};
            pub.publish('update', JSON.stringify(result));
        }
    }
});

sub.on('message', (channel, message) => {
    const index = parseInt(message);
    const fibNumber = fib(index);
    redisClient.hset('values', message, fibNumber);

    // Publish the message with a json dictionary
    const result = {index: index, number: fibNumber};
    pub.publish('update', JSON.stringify(result));
});
sub.subscribe('insert');
