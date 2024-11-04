const amqplib = require('amqplib');

const exchangeName = 'rpc_with_topic_exchange';
const queueName = 'rpc_file_operations';
const key = 'file.#';

function fibonacci(n, memo = {}) {
    if (n === 0 || n === 1) return n;
    if (memo[n]) return memo[n];

    memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
    return memo[n];
}

const receivemsg = async () => {
    try {
        const connection = await amqplib.connect('amqp://localhost');
        const channel = await connection.createChannel();

        await channel.assertExchange(exchangeName, 'topic', { durable: false });
        const q = await channel.assertQueue(queueName, { durable: false });
        channel.bindQueue(q.queue, exchangeName, key);

        console.log("[X] Awaiting RPC requests");

        channel.consume(queueName, msg => {
            const routingKey = msg.fields.routingKey;
            console.log(`[.] Received message with routing key: ${routingKey}`);
            
            const n = parseInt(msg.content.toString());

            if (isNaN(n)) {
                console.error("Received an invalid number");
                channel.ack(msg);
                return;
            }

            console.log("[.] fib(%d)", n);
            const fibNum = fibonacci(n);

            channel.sendToQueue(
                msg.properties.replyTo,
                Buffer.from(fibNum.toString()),
                { correlationId: msg.properties.correlationId }
            );

            channel.ack(msg);
        }, { noAck: false });
    } catch (error) {
        console.error("Error in receivemsg:", error);
    }
}

receivemsg();
