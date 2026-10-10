

import api from "../services/api";

export const openPrescription = async(orderId) => {
    const response = await api.get(`/medicine-orders/${orderId}/prescription`, {
        responseType: "blob"
    });

    const fileUrl = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));

    window.open(fileUrl, "_blank", "noopener");

    setTimeout(() => URL.revokeObjectURL(fileUrl), 60000);
};
