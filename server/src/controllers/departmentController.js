

import Department from "../models/Department.js";
import Doctor from "../models/Doctor.js";


const makeSlug = (name) => name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");


export const getDepartments = async(req, res)=> {

    try {

        const departments = await Department.find({status: 'active'}).sort({name: 1});
        res.status(200).json({departments});
    }

    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
}



export const getDepartmentBySlug = async(req, res)=> {

    try {

        const department = await Department.findOne({slug: req.params.slug, status: 'active'})

        if(!department) {
            return res.status(404).json({
                message: 'Department not found'
            });
        }

        res.status(200).json({department});
    }

    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
}




export const getAllDepartmentsAdmin = async(req, res)=> {

    try {

        const departments = await Department.find().sort({name: 1});

        res.status(200).json({departments});
    }

    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
}



export const createDepartment = async(req, res)=> {

    try {

        const {name, description, bannerImage = "", status = 'active'} = req.body;

        if(!name || !description) {
            return res.status(400).json({
                message: 'Name and description are required'
            });
        }

        const slug = makeSlug(name);

        const existing = await Department.findOne({$or: [{name: name.trim()}, {slug}]});

        if(existing) {
            return res.status(400).json({
                message: 'Department already exists'
            });
        }

        const department = await Department.create({
            name: name.trim(),
            slug,
            description: description.trim(),
            bannerImage,
            status
        });

        res.status(201).json({
            message: 'Department created successfully', department
        })
    }

    catch(error) {
        res.status(500).json({
            message: error.message
        })
    }
}




export const updateDepartment = async(req, res)=> {

    try {

        const {name, description, bannerImage, status} = req.body;

        const department = await Department.findById(req.params.id)

        if(!department) {
            return res.status(404).json({
                message: 'Department not found'
            });
        }

        const previousName = department.name;

        department.name = name?.trim() || department.name;
        department.slug = makeSlug(department.name)
        department.description = description?.trim() || department.description;
        department.bannerImage = bannerImage ?? department.bannerImage;
        department.status = status ?? department.status;

        const duplicate = await Department.findOne({
            _id: {$ne: department._id},
            $or: [{name: department.name}, {slug: department.slug}]
        });

        if(duplicate) {
            return res.status(400).json({
                message: 'Department already exists'
            });
        }

        await department.save();

        if(previousName !== department.name) {
            await Doctor.updateMany({department: previousName}, {department: department.name});
        }

        res.status(200).json({
            message: 'Department updated successfully', department
        });
    }

    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
}




export const deleteDepartment = async(req, res) => {

    try {

        const department = await Department.findByIdAndDelete(req.params.id);

        if(!department) {
            return res.status(404).json({
                message: "Department not found"
            });
        }

        res.status(200).json({
            message: "Department deleted successfully"
        });
    }

    catch(error) {
        res.status(500).json({ message: error.message });
    }
};