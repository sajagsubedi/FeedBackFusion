import mongoose from "mongoose";

type connectionObject = {
  isConnected?: number;
};

const connection: connectionObject = {};

const connectDb = async () :Promise<void>=> {
  if (connection.isConnected) {
    return;
  }
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI environment variable is not defined.");
    }
    const db = await mongoose.connect(uri);
    connection.isConnected = db.connections[0].readyState;
  } catch (error) {
    process.exit(1);
  }
};

export default connectDb;
