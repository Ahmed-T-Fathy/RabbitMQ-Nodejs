const amqplib = require('amqplib');

const args = process.argv.slice(2);


const exchangeName = "header_logs";


const consumeMsg = async () => {
    const connection = await amqplib.connect('amqp://localhost');
    const channel = await connection.createChannel();

    // for safe consuming form queue
    await channel.assertExchange(exchangeName, 'headers', { durable: false });

    /**
     * its mean that once the consumers stop listening "connection closed" so remove queue
     */
    const q = await channel.assertQueue('', { exclusive: true });
    console.log(`waiting for messages in queue: ${q.queue}`)

    
    /**
     * account must be new 
     * or
     * method must be google
     */
    channel.bindQueue(q.queue, exchangeName, '', { 'account': 'new', 'method': 'facebook', 'x-match': 'any' });
    channel.consume(q.queue, (msg) => {
        if (msg.content) console.log(`Routing Key: ${JSON.stringify(msg.properties.headers)}, The Message is: ${msg.content.toString()}`);

    }, { noAck: true });
}
consumeMsg();
