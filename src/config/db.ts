// Import the Pool class from the pg (node-postgres) library
// Pool manages a collection of database connections for efficient reuse
// Using a connection pool is more efficient than creating a new connection for each query
import { Pool } from "pg";

// Create and export a PostgreSQL connection pool instance
// This pool will be imported and used across the application for all database queries
// Export allows other modules to access this single shared pool instance
export const dbPool = new Pool({
  // Primary connection string format: postgresql://user:password@host:port/database
  // Takes precedence over individual connection parameters if provided
  connectionString: process.env.DATABASE_URL,
  // Database server hostname or IP address (e.g., 'localhost' or '127.0.0.1')
  // Only used if connectionString is not provided
  host: process.env.DB_HOST,
  // Database server port number (PostgreSQL default is 5432)
  // Convert string from environment variable to number using Number()
  // The ternary operator returns undefined if DB_PORT is not set, letting Pool use its default
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
  // Name of the specific database to connect to within the PostgreSQL server
  // Only used if connectionString is not provided
  database: process.env.DB_NAME,
  // Database username for authentication
  // Only used if connectionString is not provided
  user: process.env.DB_USER,
  // Database password for authentication
  // Only used if connectionString is not provided
  password: process.env.DB_PASSWORD,
});

