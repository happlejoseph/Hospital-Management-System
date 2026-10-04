

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./src/models/User.js";


dotenv.config();

const createAdmin = async () => {

    try {

        await mongoose.connect(process.env.MONGO_URL);

        const email = "admin@hospital.com";
        const password = "admin123";

        const existingAdmin = await User.findOne({ email });

        if(existingAdmin) {
            console.log("Admin already exists");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await User.create({
            name: "Hospital Admin",
            email,
            password: hashedPassword,
            role: "admin",
            status: "active"
        });

        console.log("Admin created successfully");
        console.log("Email:", admin.email);

        process.exit(0);
    }

    catch(error) {
        console.error("Error creating admin:", error.message);
        process.exit(1);
    }
};



createAdmin();