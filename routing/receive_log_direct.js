const amqplib = require('amqplib');

const args = process.argv.slice(2);

if (args.length == 0) {
    console.log("Usage: receive_logs_direct.js [info] [warning] [error]");
    process.exit(1);
}

const exchangeName = "direct_logs";


const consumeMsg = async () => {
    const connection = await amqplib.connect('amqp://localhost');
    const channel = await connection.createChannel();

    // for safe consuming form queue
    await channel.assertExchange(exchangeName, 'direct', { durable: false });

    /**
     * its mean that once the consumers stop listening "connection closed" so remove queue
     */
    const q = await channel.assertQueue('', { exclusive: true });
    console.log(`waiting for messages in queue: ${q.queue}`)
    args.forEach(function(serevity){
        channel.bindQueue(q.queue,exchangeName,serevity);
    });
    channel.consume(q.queue, (msg) => {
        if (msg.content) console.log(`Routing Key: ${msg.fields.routingKey}, The Message is: ${msg.content.toString()}`);

    }, { noAck: true });
}
consumeMsg();
