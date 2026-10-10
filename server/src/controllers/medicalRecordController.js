

export const getDoctorMedicalRecords = async(req, res) => {

    try {

        const doctor = await Doctor.findOne({ user: req.user.id });

        if(!doctor) {
            return res.status(404).json({ message: "Doctor profile not found" });
        }

        const records = await MedicalRecord.find({ doctor: doctor._id })
            .populate("patient", "name email")
            .populate("appointment", "date time status")
            .sort({ createdAt: -1 });

        res.status(200).json({ records });
    }

    catch(error) {
        res.status(500).json({ message: error.message });
    }
};





export const createDoctorMedicalRecord = async(req, res) => {

    try {

        const doctor = await Doctor.findOne({ user: req.user.id });

        if(!doctor) {
            return res.status(404).json({ message: "Doctor profile not found" });
        }

        const { patient, appointment, diagnosis, symptoms, notes, treatment, prescription } = req.body;

        if(!patient || !diagnosis) {
            return res.status(400).json({ message: "Patient and diagnosis are required" });
        }

        if(appointment) {
            const appointmentRecord = await Appointment.findOne({ _id: appointment, doctor: doctor._id, patient });
            if(!appointmentRecord) {
                return res.status(400).json({ message: "Invalid appointment for this patient" });
            }
        }

        const record = await MedicalRecord.create({
            patient,
            doctor: doctor._id,
            appointment: appointment || undefined,
            diagnosis,
            symptoms,
            notes,
            treatment,
            prescription
        });

        const populatedRecord = await MedicalRecord.findById(record._id)
            .populate("patient", "name email")
            .populate("appointment", "date time status");

        res.status(201).json({ message: "Medical record created successfully", record: populatedRecord });
    }

    catch(error) {
        res.status(500).json({ message: error.message });
    }
};





export const updateDoctorMedicalRecord = async(req, res) => {

    try {

        const doctor = await Doctor.findOne({ user: req.user.id });

        if(!doctor) {
            return res.status(404).json({ message: "Doctor profile not found" });
        }

        const record = await MedicalRecord.findOneAndUpdate(
            { _id: req.params.id, doctor: doctor._id },
            req.body,
            { new: true, runValidators: true }
        )
            .populate("patient", "name email")
            .populate("appointment", "date time status");

        if(!record) {
            return res.status(404).json({ message: "Medical record not found" });
        }

        res.status(200).json({ message: "Medical record updated successfully", record });
    }

    catch(error) {
        res.status(500).json({ message: error.message });
    }
};





export const deleteDoctorMedicalRecord = async(req, res) => {

    try {
        
        const doctor = await Doctor.findOne({ user: req.user.id });

        if(!doctor) {
            return res.status(404).json({ message: "Doctor profile not found" });
        }

        const record = await MedicalRecord.findOneAndDelete({ _id: req.params.id, doctor: doctor._id });

        if(!record) {
            return res.status(404).json({ message: "Medical record not found" });
        }

        res.status(200).json({ message: "Medical record deleted successfully" });
    }

    catch(error) {
        res.status(500).json({ message: error.message });
    }
};
