import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eq, and } from "drizzle-orm";
import dayjs from "dayjs";
import { randomUUID } from "expo-crypto";
import { db } from "../db/client";
import { exercises } from "../db/schema";
import { addToSyncQueue } from "../sync/queue";

// Read all non-deleted exercises
export function useExercises(workoutId: string) {
    return useQuery({
        queryKey: ["exercises", workoutId],
        queryFn: async () => {
            return await db
                .select()
                .from(exercises)
                .where(and(eq(exercises.workoutId, workoutId), eq(exercises.isDeleted, 0)));
        },
    });
}

// Create a new workout
export function useCreateExercises(workoutId: string) {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async ({ name, sets, reps, weight, workoutId }: { name: string, sets: number, reps: number, weight: number, workoutId: string }) => {
        const now = dayjs().toISOString();
        const id = randomUUID();
  
        const newExercise = {
          id,
          name,
          sets,
          reps,
          weight,
          workoutId,
          createdAt: now,
          updatedAt: now,
          isDeleted: 0,
        };
  
        // 1. Write to local DB
        await db.insert(exercises).values(newExercise);
  
        // 2. Log to sync queue
        await addToSyncQueue("exercises", id, "INSERT", newExercise);
  
        return newExercise;
      },
      onSuccess: () => {
        // 3. Invalidate so useExercises() re-fetches from SQLite
        queryClient.invalidateQueries({ queryKey: ["exercises", workoutId] });
      },
    });
  }

// Delete an exercise
export function useDeleteExercises(workoutId: string) {
    const queryClient = useQueryClient();
  
    return useMutation({
        mutationFn: async (id: string) => {
          const now = dayjs().toISOString();
    
          // 1. Soft delete in local DB
          await db
            .update(exercises)
            .set({ isDeleted: 1, updatedAt: now })
            .where(and(eq(exercises.id, id), eq(exercises.workoutId, workoutId)));
    
          // 2. Log to sync queue
          await addToSyncQueue("exercises", id, "DELETE", {
            id,
            isDeleted: 1,
            updatedAt: now,
          });
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["exercises", workoutId] });
        },
      });
  }