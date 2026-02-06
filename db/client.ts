import { drizzle } from 'drizzle-orm/expo-sqlite'
import { openDatabaseSync } from 'expo-sqlite'
import * as schema from './schema'

const DATABASE_NAME = 'workouts.db'

export const expoDB = openDatabaseSync(DATABASE_NAME)

export const db = drizzle(expoDB,{schema})