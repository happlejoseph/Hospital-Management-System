

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
