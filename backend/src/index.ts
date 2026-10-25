import express from 'express';
import cors from 'cors';
import { randomUUID } from "node:crypto";
import { ApiLog } from './types';
import { getChannel, QUEUE_NAME } from './rabbitmq';
import './worker'
import { getJob, setJob } from './jobStore';

const app = express();
const PORT = 3000;



app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.post('/api/analyze', async (req, res) => {
  try {
    const logs: ApiLog[] = req.body;

    if (!Array.isArray(logs) || logs.length === 0) {
      res.status(400).json({ error: "No valid JSON log entries provided." });
      return;
    }

    const jobId = randomUUID();
    await setJob(jobId, { status: 'pending' });

    const channel = await getChannel();
    const payload = JSON.stringify({ jobId, logs });

    channel.sendToQueue(QUEUE_NAME, Buffer.from(payload), { persistent: true });


    res.status(202).json({ jobId, message: "Job queued successfully." });

  } catch (error: any) {
    console.error(`Error queueing job: ${error.message}`);
    res.status(500).json({ error: "Internal server error during queueing." });
  }
});

app.get("/api/jobs/:id", async (req, res) => {

  const job = await getJob(req.params.id);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json(job);
})

app.listen(PORT, () => {
  console.log(`API is running`);
});