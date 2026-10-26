

import Appointment from "../models/Appointment.js";

export const weekDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export const bookingWindowDays = 14;

const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export const formatLocalDate = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${date.getFullYear()}-${month}-${day}`;
};

export const parseLocalDate = (value) => {

    if(typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return null;
    }

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    if(formatLocalDate(date) !== value) {
        return null;
    }

    return date;
};

export const getScheduleForDate = (doctor, dateValue) => {

    const date = parseLocalDate(dateValue);

    if(!date) {
        return null;
    }

    return doctor.schedule.find((item) => item.day === dayNames[date.getDay()]) || null;
};

export const isConsultationOver = (dateValue, endTime) => {

    const now = new Date();

    if(dateValue !== formatLocalDate(now)) {
        return false;
    }

    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    return currentTime >= endTime;
};

export const isInsideBookingWindow = (dateValue) => {

    const date = parseLocalDate(dateValue);

    if(!date) {
        return false;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + bookingWindowDays - 1);

    return date >= today && date <= lastDay;
};

export const countBookedAppointments = async(doctorId, dates) => {

    if(dates.length === 0) {
        return {};
    }

    const counts = await Appointment.aggregate([
        {
            $match: {
                doctor: doctorId,
                date: { $in: dates },
                status: { $ne: "cancelled" }
            }
        },
        {
            $group: {
                _id: "$date",
                total: { $sum: 1 }
            }
        }
    ]);

    return counts.reduce((result, item) => {
        result[item._id] = item.total;
        return result;
    }, {});
};

export const getUpcomingAvailability = async(doctor) => {

    const now = new Date();
    const upcomingDays = [];

    for(let index = 0; index < bookingWindowDays; index++) {

        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + index);
        const dateValue = formatLocalDate(date);
        const scheduleDay = doctor.schedule.find((item) => item.day === dayNames[date.getDay()]);

        if(!scheduleDay || isConsultationOver(dateValue, scheduleDay.endTime)) {
            continue;
        }

        upcomingDays.push({
            date: dateValue,
            day: scheduleDay.day,
            startTime: scheduleDay.startTime,
            endTime: scheduleDay.endTime,
            limit: scheduleDay.limit
        });
    }

    const bookedCounts = await countBookedAppointments(doctor._id, upcomingDays.map((item) => item.date));

    return upcomingDays.map((item) => {

        const booked = bookedCounts[item.date] || 0;

        return {
            ...item,
            booked,
            remaining: Math.max(item.limit - booked, 0)
        };
    });
};
