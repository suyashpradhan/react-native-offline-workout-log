import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eq } from "drizzle-orm";
import dayjs from "dayjs";
import { randomUUID } from "expo-crypto";
import { db } from "../db/client";
import { workouts } from "../db/schema";
import { addToSyncQueue } from "../sync/queue";

// Read all non-deleted workouts
export function useWorkouts() {
  return useQuery({
    queryKey: ["workouts"],
    queryFn: async () => {
      return await db
        .select()
        .from(workouts)
        .where(eq(workouts.isDeleted, 0));
    },
  });
}

// Create a new workout
export function useCreateWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (title: string) => {
      const now = dayjs().toISOString();
      const id = randomUUID();

      const newWorkout = {
        id,
        title,
        performedAt: now,
        createdAt: now,
        updatedAt: now,
        isDeleted: 0,
      };

      // 1. Write to local DB
      await db.insert(workouts).values(newWorkout);

      // 2. Log to sync queue
      await addToSyncQueue("workouts", id, "INSERT", newWorkout);

      return newWorkout;
    },
    onSuccess: () => {
      // 3. Invalidate so useWorkouts() re-fetches from SQLite
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });
}

// Soft-delete a workout
export function useDeleteWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const now = dayjs().toISOString();

      // 1. Soft delete in local DB
      await db
        .update(workouts)
        .set({ isDeleted: 1, updatedAt: now })
        .where(eq(workouts.id, id));

      // 2. Log to sync queue
      await addToSyncQueue("workouts", id, "DELETE", {
        id,
        isDeleted: 1,
        updatedAt: now,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });
}