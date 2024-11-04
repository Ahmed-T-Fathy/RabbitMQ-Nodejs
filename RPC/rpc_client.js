const amqplib = require('amqplib');
const { v4: uuidv4 } = require('uuid');

if (process.argv.length <= 2) {
    console.log("Usage: rpc_client.js <num>");
    process.exit(1);
}

const exchangeName = "rpc_with_topic_exchange";
const num = parseInt(process.argv[2], 10);
const key = 'file.delete';

if (isNaN(num)) {
    console.error("Please provide a valid number.");
    process.exit(1);
}

const getFib = async () => {
    const connection = await amqplib.connect('amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertExchange(exchangeName, 'topic', { durable: false });
    const q = await channel.assertQueue('', { exclusive: true });
    const correlationId = uuidv4();

    console.log("[X] Requesting fib(%d)", num);

    channel.publish(exchangeName, key, Buffer.from(num.toString()), {
        replyTo: q.queue,
        correlationId
    });


    channel.consume(q.queue, msg => {
        if (msg.properties.correlationId == correlationId) {
            console.log(' [.] Got %s', msg.content.toString());
            setTimeout(() => {
                connection.close();
                process.exit(0);
            }, 500);
        }
    }, { noAck: true })

}

getFib();