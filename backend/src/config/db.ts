import mongoose from "mongoose";

// Promise<void> It means the function is asynchronous and doesn't return a useful value when it succeeds.
const connectDB = async (): Promise<void> => {
    try{
        const mongoURI = 'mongodb://localhost:27017/chatOnly'

        await mongoose.connect(mongoURI);

        console.log('Database connected');
    } catch(error) {
        console.log("Database Connection Error", error);

    }
}

export default connectDB;