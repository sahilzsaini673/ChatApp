import mongoose from "mongoose";
import "dotenv/config";

// Promise<void> It means the function is asynchronous and doesn't return a useful value when it succeeds.
const connectDB = async (): Promise<void> => {
    try{
        const mongoURI = process.env.MONGODB_URI || "";

        await mongoose.connect(mongoURI);

        console.log('Database connected');
    } catch(error) {
        console.log("Database Connection Error", error);

    }
}

export default connectDB;