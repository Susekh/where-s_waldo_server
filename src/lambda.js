import serverlessExpress from '@codegenie/serverless-express';
import { app } from './app.js';
import connectDB from './db/index.js';


let isDBConnected = false;

async function initializeDB() {
  if (!isDBConnected) {
    try {
      await connectDB();  
      isDBConnected = true;
      console.log('Database connected!');
    } catch (err) {
      console.error('Failed to connect to MongoDB:', err);
      throw new Error('MongoDB connection failed');
    }
  }
}

export const handler = async (event, context) => {
  try {
    await initializeDB();
    
    // Use serverless-express to handle the Express app request
    return serverlessExpress({ app })(event, context);
  } catch (err) {
    context.fail('Initialization failed: ' + err.message);
  }
};
