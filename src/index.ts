// Import the configured Express application instance from the app.ts file
// This imports the entire app with all middleware, routes, and configurations already set up
import { app } from "./app";

// Define the port number where the server will listen for incoming HTTP requests
// Uses the PORT environment variable if available (for production deployments), otherwise defaults to 5000
// The || operator provides a fallback value when process.env.PORT is undefined
const PORT = process.env.PORT || 5000;

// Start the Express server and listen for incoming connections on the specified PORT
// This is the entry point that makes the application accessible via HTTP
// The app.listen() method binds and listens for connections on the specified host and port
app.listen(PORT, () => {
  // This callback function executes once the server successfully starts listening
  // It logs a message to the console confirming the server is running and on which port
  // Helps developers verify that the application has started correctly
  console.log(`Server is running on port ${PORT}`);
});



