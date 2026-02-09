import dayjs from "dayjs";
import { db } from "../db/client";
import { syncQueue } from "../db/schema";

type Operation = "INSERT" | "UPDATE" | "DELETE";

export async function addToSyncQueue(
  tableName: string,
  recordId: string,
  operation: Operation,
  payload: Record<string, unknown>
) {
  await db.insert(syncQueue).values({
    tableName,
    recordId,
    operation,
    payload: JSON.stringify(payload),
    createdAt: dayjs().toISOString(),
  });
}