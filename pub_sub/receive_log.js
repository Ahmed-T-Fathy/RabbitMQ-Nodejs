const amqplib = require('amqplib');

const exchangeName = "logs";


const consumeMsg = async () => {
    const connection = await amqplib.connect('amqp://localhost');
    const channel = await connection.createChannel();

    // for safe consuming form queue
    await channel.assertExchange(exchangeName,'fanout', { durable: false });

    /**
     * its mean that once the consumers stop listening "connection closed" so remove queue
     */
    const q=await channel.assertQueue('',{exclusive:true}); 
    console.log(`waiting for messages in queue: ${q.queue}`)
    channel.bindQueue(q.queue,exchangeName,'');
    channel.consume(q.queue, (msg) => {
if(msg.content)console.log(`The Message is: ${msg.content.toString()}`);
       
    }, { noAck: true });
}
consumeMsg();
