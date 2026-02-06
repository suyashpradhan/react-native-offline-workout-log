import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const workouts = sqliteTable("workouts", {
  id: text("id").primaryKey(),             
  title: text("title").notNull(),           
  performedAt: text("performed_at").notNull(), 
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  isDeleted: integer("is_deleted").default(0).notNull(),
});

export const exercises = sqliteTable("exercises", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    sets: integer("sets").notNull(),
    reps: integer("reps").notNull(),
    weight: real("weight").notNull(),
    workoutId: text("workout_id").references(() => workouts.id).notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    isDeleted: integer("is_deleted").default(0).notNull(),
})

export const syncQueue = sqliteTable("sync_queue", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    tableName: text("table_name").notNull(),     
    recordId: text("record_id").notNull(),        
    operation: text("operation").notNull(),        
    payload: text("payload").notNull(),            
    createdAt: text("created_at").notNull(),
    synced: integer("synced").default(0).notNull(),
  });