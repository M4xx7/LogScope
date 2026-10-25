import { getChannel, QUEUE_NAME } from "./rabbitmq";
import { processLogs } from "./analyzer";
import { ApiLog } from "./types";
import { setJob } from "./jobStore";

interface MessagePayload {
    jobId: string;
    logs: ApiLog[];
}

export async function startWorker() {
    const channel = await getChannel();

    await channel.prefetch(1);

    console.log("Worker waiting for jobs...");

    channel.consume(
        QUEUE_NAME,
        async (msg) => {
            if (!msg) return;

            const payload: MessagePayload = JSON.parse(msg.content.toString());
            const { jobId, logs } = payload;

            try {
                console.log(`[Worker] Starting job: ${jobId}`);
                await setJob(jobId, { status: "processing" });

                const results = processLogs(logs);

                await setJob(jobId, { status: "completed", result: results });
                console.log(`[Worker] Finished job: ${jobId}`);

                channel.ack(msg);
            } catch (err: any) {
                console.error(`[Worker] Failed job ${jobId}:`, err);
                await setJob(jobId, { status: "failed", error: err.message });

                channel.nack(msg, false, false);
            }
        },
        { noAck: false }
    );
}

startWorker().catch(console.error);