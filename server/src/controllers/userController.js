

import User from '../models/User.js';


// GET SINGLE USER //
export const getUserById = async(req, res)=> {

    try {

        const {id} = req.params;
    }
}



// GET ALL USERS //
export const getAllUsers = (req, res)=> {

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