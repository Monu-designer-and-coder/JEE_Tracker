import mongoose from 'mongoose';

// Define a type for the connection status
type ConnectionObject = {
	isConnected?: number; // Optional property to track connection status
};

// Initialize the connection object
const connection: ConnectionObject = {};

const MONGODB_URI: string = process.env.MONGO_URI as string;

if (!MONGODB_URI) {
	throw new Error(
		'Please define the MONGODB_URI environment variable inside .env.local',
	);
}

// Function to establish a database connection
async function dbConn(): Promise<void> {
	// Check if already connected to the database
	if (connection.isConnected) {
		console.log('Database already connected!'); // Log connection status
		return; // Exit the function if already connected
	}

	try {
		// Attempt to connect to the MongoDB database
		const db = await mongoose.connect(MONGODB_URI);

		// Update the connection status
		connection.isConnected = db.connections[0].readyState; // 1 indicates connected
		console.log('DB connected successfully!'); // Log successful connection
	} catch (err) {
		// Handle connection errors
		console.error('Database connection failed!', err); // Log the error
		process.exit(1); // Exit the process with a failure code
	}
}

export default dbConn; // Export the dbConn function for use in other modules
