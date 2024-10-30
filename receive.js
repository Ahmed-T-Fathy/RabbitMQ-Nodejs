const amqplib = require('amqplib');

const queueName = "hello";


const consumeMsg = async () => {
    const connection = await amqplib.connect('amqp://localhost');
    const channel = await connection.createChannel();

    // for safe consuming form queue
    await channel.assertQueue(queueName, { durable: false });
    console.log(`waiting for messages in queue: ${queueName}`)
    channel.consume(queueName, (msg) => {
        console.log("[X] Received:", msg.content.toString());

    }, { noAck: true });
}
consumeMsg();
