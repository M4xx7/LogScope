import amqp, { Channel, Connection } from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672";
export const QUEUE_NAME = "log_analysis_queue";

let channel: amqp.Channel | null = null;

export async function getChannel(): Promise<Channel> {
  if (channel) return channel;

  const connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });

  return channel;
}
