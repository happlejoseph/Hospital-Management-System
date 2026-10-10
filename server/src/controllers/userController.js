

import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import bcrypt from "bcryptjs";



export const getProfile = async(req, res)=> {

    try {

        const user = await User.findById(req.user.id).select('-password');

        if(!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.status(200).json({
            message: 'Profile data',
            user
        });
    }

    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
}




export const getAllUsers = async(req, res)=> {

    try {

        const users = await User.find({ role: "patient" }).select('-password').sort({ createdAt: -1 })

        res.status(200).json({
            message: 'Users fetched sucessfully',
            users
        });
    }

    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
}





export const createAdmin = async(req, res) => {

    try {

        const { name, email, password } = req.body;

        if(!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        if(password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail });

        if(existingUser) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const admin = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashPassword,
            role: "admin",
            status: "active"
        });

        res.status(201).json({
            message: "Admin created successfully",
            user: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                status: admin.status
            }
        });
    }

    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};





export const createPharmacist = async(req, res) => {

    try {

        const { name, email, password } = req.body;

        if(!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        if(password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail });

        if(existingUser) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const pharmacist = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashPassword,
            role: "pharmacist",
            status: "active"
        });

        res.status(201).json({
            message: "Pharmacist created successfully",
            user: {
                id: pharmacist._id,
                name: pharmacist.name,
                email: pharmacist.email,
                role: pharmacist.role,
                status: pharmacist.status
            }
        });
    }

    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};





export const getAllPharmacists = async(req, res) => {
    try {
        const users = await User.find({ role: "pharmacist" }).select("-password").sort({ createdAt: -1 });
        res.status(200).json({ users });
    }
    catch(error) {
        res.status(500).json({ message: error.message });
    }
};





export const getAllAdmins = async(req, res) => {
    try {
        const users = await User.find({ role: "admin" }).select("-password").sort({ createdAt: -1 });
        res.status(200).json({ users });
    }
    catch(error) {
        res.status(500).json({ message: error.message });
    }
};






export const getUserById = async(req, res)=> {

    try {

        const {id} = req.params;

        const user = await User.findById(id).select('-password');

        if(!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.status(200).json({
            message: 'User fetch successfully',
            user
        })
    }

    catch(error) {
        res.status(500).json({
            message: error.message
        })
    }
}





export const updateProfile = async(req, res)=> {

    try {

        const {name, email} = req.body;

        if(!name || !email) {
            return res.status(400).json({
                message: 'Name and email required'
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({
            email: normalizedEmail,
            _id: { $ne: req.user.id }
        });

        if(existingUser) {
            return res.status(400).json({
                message: 'Email already registered'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                name: name.trim(), email: normalizedEmail
            },
            {
                new: true,
                runValidators: true
            }
        ).select('-password')

        if(!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        res.status(200).json({
            message: 'Profile updated successfully',
            user
        })
    }

    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
}





export const updateUser = async(req, res)=> {

    try {

        const {id} = req.params;

        const {name, email, role, status} = req.body;

        if(!name || !email) {
            return res.status(400).json({
                message: 'Name and email required'
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({
            email: normalizedEmail,
            _id: { $ne: id }
        });

        if(existingUser) {
            return res.status(400).json({
                message: 'Email already registered'
            });
        }

        if(id === req.user.id.toString() && (role !== 'admin' || status === 'inactive')) {
            return res.status(400).json({
                message: 'You cannot change your own role or deactivate your own account'
            });
        }

        const user = await User.findByIdAndUpdate(
            id,
            {
                name: name.trim(), email: normalizedEmail, role, status,
            },
            {
                new: true,
                runValidators: true
            }
        ).select('-password');

        if(!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.status(200).json({
            message: 'User updated successfully',
            user
        });
    }

    catch(error) {
        res.status(500).json({
            message: error.message
        })
    }
}




export const deleteUser = async(req, res)=> {

    try {

        const {id} = req.params;

        if(id === req.user.id.toString()) {
            return res.status(400).json({
                message: "You cannot delete your own account"
            });
        }

        const user = await User.findByIdAndDelete(id);
        

        if(!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        await Doctor.findOneAndDelete({user: user._id});

        res.status(200).json({
            message: 'User deleted successfully'
        });

    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}