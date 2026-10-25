import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
export const redis = new Redis(REDIS_URL);

export interface JobRecord {
  status: "pending" | "processing" | "completed" | "failed";
  result?: any;
  error?: string;
}

const JOB_TTL_SECONDS = 1800;

export async function setJob(jobId: string, data: JobRecord): Promise<void> {
  await redis.set(
    `job:${jobId}`,
    JSON.stringify(data),
    "EX",
    JOB_TTL_SECONDS
  );
}

export async function getJob(jobId: string): Promise<JobRecord | null> {
  const raw = await redis.get(`job:${jobId}`);
  if (!raw) return null;
  return JSON.parse(raw) as JobRecord;
}