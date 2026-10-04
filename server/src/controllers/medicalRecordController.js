

import MedicalRecord from "../models/MedicalRecord.js";

export const createMedicalRecord = async(req, res) => {

    try {
        
        const {patient, doctor, appointment, diagnosis, symptoms, notes, treatment, prescription} = req.body;

        if(!patient || !doctor || !diagnosis) {
            return res.status(400).json({
                message: "Patient, doctor and diagnosis are required"
            });
        }

        const record = await MedicalRecord.create({
            patient,
            doctor,
            appointment: appointment || undefined,
            diagnosis,
            symptoms,
            notes,
            treatment,
            prescription
        });

        const populatedRecord = await MedicalRecord.findById(record._id)
            .populate("patient", "name email")
            .populate("doctor", "name specialization")
            .populate("appointment", "date time status");

        res.status(201).json({
            message: "Medical record created successfully",
            record: populatedRecord
        });
    }
    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};





export const getMedicalRecords = async(req, res) => {
    try {
        const records = await MedicalRecord.find()
            .populate("patient", "name email")
            .populate("doctor", "name specialization")
            .populate("appointment", "date time status")
            .sort({ createdAt: -1 });

        res.status(200).json({
            records
        });
    }
    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};





export const updateMedicalRecord = async(req, res) => {
    try {
        const {patient, doctor, appointment, diagnosis, symptoms, notes, treatment, prescription} = req.body;

        const record = await MedicalRecord.findByIdAndUpdate(
            req.params.id,
            {
                patient,
                doctor,
                appointment: appointment || undefined,
                diagnosis,
                symptoms,
                notes,
                treatment,
                prescription
            },
            {
                new: true,
                runValidators: true
            }
        )
        .populate("patient", "name email")
        .populate("doctor", "name specialization")
        .populate("appointment", "date time status");

        if(!record) {
            return res.status(404).json({
                message: "Medical record not found"
            });
        }

        res.status(200).json({
            message: "Medical record updated successfully",
            record
        });
    }
    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};




export const deleteMedicalRecord = async(req, res) => {

    try {

        const record = await MedicalRecord.findByIdAndDelete(req.params.id);

        if(!record) {
            return res.status(404).json({
                message: "Medical record not found"
            });
        }

        res.status(200).json({
            message: "Medical record deleted successfully"
        });
    }

    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};
