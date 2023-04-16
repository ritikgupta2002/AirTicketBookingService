const amqplib = require("amqplib");
const { MESSAGE_BROKER_URL, EXCHANGE_NAME } = require("../config/serverConfig");
//setup for message queue .
const createChannel = async () => {
  try {
    const connection = await amqplib.connect(MESSAGE_BROKER_URL);
    /*  
    we will take message broker or rabbit mq server url from env file,this message broker
     maintains multiple queues (we are using rabbit mq message broker)
    */
    const channel = await connection.createChannel();
    /*  creating channel so that message broker can connect with the queues */
    await channel.assertExchange(EXCHANGE_NAME, "direct",  false);
    return channel;
    /* assertExchange:-once you have created the channel now
    this message broker helps to distribute the 
    message between the queues  (because we may 
    have multiple queues) ; */
  } catch (error) {
    throw error;
  }
};

const subscribeMessage = async (channel, service, binding_key) => {
  try {
    const applicationQueue = await channel.assertQueue("REMINDER_QUEUE");

    channel.bindQueue(applicationQueue.queue, EXCHANGE_NAME, binding_key);

    channel.consume(applicationQueue.queue, (msg) => {
      console.log("received data");
      console.log(msg.content.toString());
      channel.ack(msg);
    });
  } catch (error) {
    throw error;
  }
};
//questions how to connect exchange distributor to publisher ?
//ans:-
const publishMessage = async (channel, binding_key, message) => {
  try {
    await channel.assertQueue("REMINDER_QUEUE");
    await channel.publish(EXCHANGE_NAME, binding_key, Buffer.from(message));
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createChannel,
  subscribeMessage,
  publishMessage,
};
