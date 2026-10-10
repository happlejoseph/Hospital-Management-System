

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { openPrescription } from "../../utils/prescription";

const MedicineOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const loadOrders = async () => {
        try {
            const response = await api.get("/medicine-orders/my");
            setOrders(response.data.orders || []);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to load your medicine orders."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const cancelOrder = async (orderId) => {
        if (!window.confirm("Cancel this medicine order?")) return;

        setError("");
        setMessage("");

        try {
            const response = await api.put(`/medicine-orders/${orderId}/cancel`);
            setMessage(response.data.message);
            await loadOrders();
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to cancel medicine order."
            );
        }
    };

    const viewPrescription = async (orderId) => {
        setError("");

        try {
            await openPrescription(orderId);
        } catch {
            setError("Unable to open the prescription.");
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-slate-500">Loading your orders...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <section className="mx-auto max-w-6xl px-6 py-16 lg:px-10">
                <div className="mb-10">
                    <p className="text-sm font-semibold uppercase tracking-widest text-[#0f6b78]">
                        Hospital Pharmacy
                    </p>

                    <h1 className="mt-3 text-4xl font-semibold text-slate-900">
                        My Medicine Orders
                    </h1>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-700">
                        {message}
                    </div>
                )}

                {orders.length === 0 ? (
                    <div className="rounded-xl bg-white p-10 text-center shadow-sm">
                        <h2 className="text-xl font-semibold text-slate-800">
                            No medicine orders yet
                        </h2>

                        <Link
                            to="/medicines"
                            className="mt-6 inline-block rounded-lg bg-[#0f6b78] px-6 py-3 font-medium text-white hover:bg-[#09545f]"
                        >
                            Browse Medicines
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div
                                key={order._id}
                                className="rounded-xl bg-white p-6 shadow-sm"
                            >
                                <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">
                                            Order ID
                                        </p>
                                        <p className="font-medium text-slate-900">
                                            {order._id}
                                        </p>
                                    </div>

                                    <span className="w-fit rounded-full bg-slate-100 px-4 py-2 text-sm font-medium capitalize text-slate-700">
                                        {order.status}
                                    </span>
                                </div>

                                <div className="mt-6 space-y-3">
                                    {order.medicines.map((item, index) => (
                                        <div
                                            key={`${order._id}-${index}`}
                                            className="flex justify-between border-b border-slate-100 pb-3"
                                        >
                                            <div>
                                                <p className="font-medium text-slate-800">
                                                    {item.medicine?.name || "Medicine no longer available"}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    ₹{item.price} × {item.quantity}
                                                </p>
                                            </div>

                                            <p className="font-medium text-slate-800">
                                                ₹
                                                {(
                                                    item.price *
                                                    item.quantity
                                                ).toFixed(2)}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 flex justify-between">
                                    <span className="font-semibold text-slate-900">
                                        Total
                                    </span>

                                    <span className="font-semibold text-[#0f6b78]">
                                        ₹{order.totalAmount.toFixed(2)}
                                    </span>
                                </div>

                                <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 text-sm text-slate-500 sm:grid-cols-2">
                                    <div>
                                        <p className="font-medium text-slate-700">
                                            Payment
                                        </p>
                                        <p className="mt-1 capitalize">
                                            {order.paymentMethod === "cod"
                                                ? "Cash on Delivery"
                                                : order.paymentMethod}
                                            {" · "}
                                            {order.paymentStatus}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="font-medium text-slate-700">
                                            Ordered on
                                        </p>
                                        <p className="mt-1">
                                            {new Date(
                                                order.createdAt
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <p className="font-medium text-slate-700">
                                            Delivery Address
                                        </p>
                                        <p className="mt-1">
                                            {order.shippingAddress}
                                        </p>
                                    </div>

                                    {order.prescription?.fileUrl && (
                                        <div className="sm:col-span-2">
                                            <p className="font-medium text-slate-700">
                                                Prescription
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => viewPrescription(order._id)}
                                                className="mt-1 font-medium text-[#0f6b78] hover:text-[#09545f]"
                                            >
                                                {order.prescription.fileName || "View prescription"}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {order.status === "pending" && (
                                    <button
                                        type="button"
                                        onClick={() => cancelOrder(order._id)}
                                        className="mt-6 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                                    >
                                        Cancel Order
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default MedicineOrders;