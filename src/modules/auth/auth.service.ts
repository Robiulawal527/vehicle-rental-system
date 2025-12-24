// Import bcrypt for secure password hashing
// bcrypt is a cryptographic hash function designed for password storage
// Uses adaptive hashing with configurable work factor to remain resistant to brute-force attacks
import bcrypt from "bcrypt";
// Import jsonwebtoken for creating JWT tokens
// JWT provides a stateless authentication mechanism
import jwt from "jsonwebtoken";

// Import the database connection pool for executing queries
// dbPool manages PostgreSQL connections efficiently
import { dbPool } from "../../config/db";

// Import TypeScript types for type safety
// These interfaces define the structure of auth-related data
import { SigninPayload, SignupPayload, User } from "./auth.types";

// Helper function to normalize email addresses to lowercase
// Ensures consistent email comparison regardless of input case
// Example: "User@Email.com" becomes "user@email.com"
const normalizeEmail = (email: string): string => email.toLowerCase();

// Service function to create a new user account
// Handles password hashing and database insertion
// Returns the created user object (including hashed password)
export const signupUser = async (payload: SignupPayload): Promise<User> => {
  // Destructure incoming user data from the payload object
  // = "customer" provides a default value if role is not specified
  const { name, email, password, phone, role = "customer" } = payload;

  // Convert email to lowercase for consistent storage
  // Prevents duplicate accounts with different email cases
  const normalizedEmail = normalizeEmail(email);

  // Hash the plain text password using bcrypt with salt rounds of 10
  // Salt rounds determine computational cost (10 is a good balance of security and performance)
  // await is needed because bcrypt.hash is asynchronous
  // Higher salt rounds = more secure but slower
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert new user into the database with parameterized query
  // $1, $2, etc. are placeholders to prevent SQL injection attacks
  // RETURNING clause returns the inserted row data
  const result = await dbPool.query<User>(
    // SQL INSERT statement to add user to users table
    // Specifies all required columns
    `INSERT INTO users (name, email, password, phone, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, password, phone, role`,
    // Array of values to replace the $1, $2, etc. placeholders
    // Order must match the placeholders in the SQL query
    [name, normalizedEmail, hashedPassword, phone, role]
  );

  // Return the first (and only) row from the result
  // rows[0] contains the newly created user with auto-generated id
  return result.rows[0];
};

// Service function to authenticate a user and generate JWT token
// Validates credentials and returns token for session management
export const signinUser = async (
  // Payload contains email and password from login form
  payload: SigninPayload
) => {
  // Normalize email to lowercase for consistent database lookup
  const normalizedEmail = normalizeEmail(payload.email);

  // Query database to find user by email
  // SELECT retrieves user data needed for authentication
  const result = await dbPool.query<User>(
    // SQL SELECT statement to fetch user by email
    // WHERE clause filters for matching email
    `SELECT id, name, email, password, phone, role
     FROM users
     WHERE email = $1`,
    // $1 is replaced with the normalized email
    [normalizedEmail]
  );

  // Check if no user was found with the provided email
  // rows.length === 0 means no matching records
  if (result.rows.length === 0) {
    // Create a new Error object with descriptive message
    // Generic message "Invalid email or password" prevents email enumeration attacks
    const error = new Error("Invalid email or password");
    // Add statusCode property to the error for the global error handler
    // 400 Bad Request indicates client sent invalid data
    (error as any).statusCode = 400;
    // Throw the error to be caught by the controller's try-catch
    throw error;
  }

  // Extract the user record from the database result
  // rows[0] contains the user data including hashed password
  const user = result.rows[0];

  // Compare the provided password with the stored hashed password
  // bcrypt.compare hashes the input password and compares it with the stored hash
  // Returns true if passwords match, false otherwise
  const isPasswordValid = await bcrypt.compare(payload.password, user.password);

  // Check if password comparison failed
  if (!isPasswordValid) {
    // Create error with same message as "user not found" case
    // Using the same message prevents attackers from determining if email exists
    const error = new Error("Invalid email or password");
    // Set 400 status code for invalid credentials
    (error as any).statusCode = 400;
    // Throw error to be handled by controller
    throw error;
  }

  // Create JWT payload with essential user information
  // Keep payload small as JWT is sent with every request
  const tokenPayload = {
    // User's unique identifier
    id: user.id,
    // User's email for identification
    email: user.email,
    // User's role for authorization checks
    role: user.role,
  };

  // Generate JWT token signed with secret key from environment variable
  // Token can be verified by server to authenticate future requests
  const token = jwt.sign(
    // Data to encode in the token
    tokenPayload,
    // Secret key used to sign the token (must match when verifying)
    // as string asserts that JWT_SECRET is defined (TypeScript)
    process.env.JWT_SECRET as string,
    // Options object configuring token behavior
    // expiresIn: "7d" means token expires in 7 days
    { expiresIn: "7d" }
  );

  // Return both token and sanitized user data
  // Client will store token for authenticated requests
  return {
    // JWT token for authentication
    token,
    // User data without sensitive password field
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  };
};

