

import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';



// REGISTER //
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // Hash password
        const hashPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashPassword
        });

        // Send response
        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};



// LOGIN //
export const loginUser = async(req, res)=> {

    try {
console.log(req.body);

        const {email, password} = req.body;


        if(!email || !password) {
            return res.status(400).json({
                message: 'Email and password required'
            });
        }

        const user = await User.findOne({email});

        console.log("EMAIL:", email);
console.log("USER FOUND:", user);
console.log("PASSWORD FROM DB:", user?.password);

        if(!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        if(user.status === 'inactive') {
            return res.status(403).json({
                message: 'Your account has been deactivated'
            });
        }

        const isPasswordMatch = await bcrypt.compare(
            password, user.password
        );

console.log("PASSWORD MATCH:", isPasswordMatch);

        if(!isPasswordMatch) {
            return res.status(401).json({
                message: 'Invalied password'
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '16d'
            }
        )

        res.status(200).json({
            message: 'Login successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

        
    }
    catch(error) {
         
        res.status(500).json({

            message: error.message
        });
    }
}