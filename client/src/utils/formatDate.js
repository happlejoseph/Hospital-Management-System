

export const formatDate = (value) => {
    return new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC"
    });
};

export const isExpired = (value) => {
    return new Date(value) <= new Date();
};

export const formatWeekday = (value) => {
    return new Date(value).toLocaleDateString("en-GB", {
        weekday: "short",
        timeZone: "UTC"
    });
};

export const formatDayMonth = (value) => {
    return new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        timeZone: "UTC"
    });
};

export const formatTime = (value) => {
    if(!value || !/^\d{2}:\d{2}$/.test(value)) {
        return value || "";
    }

    const [hours, minutes] = value.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;

    return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
};

export const formatTimestamp = (value) => {
    return new Date(value).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
};
