const amqplib = require('amqplib');

const queueName = "task";


const consumeMsg = async () => {
    const connection = await amqplib.connect('amqp://localhost');
    const channel = await connection.createChannel();

    // for safe consuming form queue
    await channel.assertQueue(queueName, { durable: true });

    /**
     * is for tell the  limits the number of unacknowledged messages sent to a consumer to one,
     * ensuring it processes each message fully before receiving the next,
     * which helps prevent overwhelming the consumer.
     */
    channel.prefetch(1);
    console.log(`waiting for messages in queue: ${queueName}`)
    channel.consume(queueName, (msg) => {
        const secs=msg.content.toString().split('.').length -1;
        console.log("[X] Received:", msg.content.toString());
        setTimeout(()=>{
            console.log("Done resizing img")
            channel.ack(msg)
        },secs*1000)
    }, { noAck: false });
}
consumeMsg();
