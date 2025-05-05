import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const db= ()=>{
    mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB connected!"))
    .catch((err) => console.log("MongoDB connection error:", err));
}

export default db;