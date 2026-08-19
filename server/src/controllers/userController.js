

import User from '../models/User.js';


// GET PROFILE //
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
        })
    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}





// GET ALL USERS (ADMIN) //
export const getAllUsers = async(req, res)=> {

    try {

        const users = await User.find().select('-password');

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





// GET SINGLE USER (ADMIN) //
export const getUserById = async(req, res) => {

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
        });


    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}




// UPDATE PROFILE //
export const updateProfile = async(req, res)=> {

    try {

        const {name, email} = req.body;


        if(!name || !email) {
            return res.status(400).json({
                message: 'Name and email required'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                name, email
            },
            {
                new: true
            }
        ).select('-password');


        if(!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.status(200).json({
            message: 'Profile updated successfully'
        })
    }
    catch(error) {

        res.status(500).json({
            message: error.message
        })
    }
}




// UPDATE USER (ADMIN) //
export const updateUser = async(req, res)=> {

    try {

        const {id} = req.params;

        const {name, email, role, status} = req.body;

        const user = await User.findByIdAndUpdate(
            id,
            {
                name, email, role, status,
            },
            {
                new: true
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
        });
    }
}



// DELETE USER (ADMIN) //
export const deleteUser = async(req, res)=> {

    try {

        const {id} = req.params;

        const user = await User.findByIdAndDelete(id);
        

        if(!user) {
            return res.status(404).json({
                message: 'User not fond'
            });
        }

        res.status(200).json({
            message: 'User deleted succesfully'
        });

    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}