

import { useEffect, useState } from "react";
import api from "../../services/api";

const Orders = () => {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadOrders = async () => {

        try {
            const response = await api.get("/medicine-orders");

            setOrders(response.data.orders || []);
        } 
        catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to load medicine orders"
            );
        } 
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const updateStatus = async (orderId, status) => {

        try {
            
            await api.put(
                `/medicine-orders/${orderId}/status`,
                { status }
            );

            loadOrders();
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to update order status"
            );
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-slate-500">
                    Loading medicine orders...
                </p>
            </div>
        );
    }



    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-[#0f6b78]">
                    Pharmacy
                </p>

                <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                    Medicine Orders
                </h1>

                <p className="mt-2 text-slate-500">
                    Review patient medicine orders and update their status.
                </p>
            </div>

            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

            {orders.length === 0 ? (
                <div className="rounded-xl bg-white p-10 text-center shadow-sm">
                    <h2 className="text-xl font-semibold text-slate-800">
                        No medicine orders
                    </h2>

                    <p className="mt-2 text-slate-500">
                        New patient orders will appear here.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div
                            key={order._id}
                            className="rounded-xl bg-white p-6 shadow-sm"
                        >
                            <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Order ID
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-900">
                                        {order._id}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-slate-500">
                                        Patient
                                    </p>

                                    <p className="mt-1 font-medium text-slate-900">
                                        {order.patient?.name || "Unknown"}
                                    </p>

                                    <p className="text-sm text-slate-500">
                                        {order.patient?.email || ""}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-slate-500">
                                        Order Date
                                    </p>

                                    <p className="mt-1 font-medium text-slate-900">
                                        {new Date(
                                            order.createdAt
                                        ).toLocaleDateString()}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-slate-500">
                                        Total
                                    </p>

                                    <p className="mt-1 font-semibold text-[#0f6b78]">
                                        ₹{order.totalAmount.toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Medicines
                                </h2>

                                <div className="mt-4 overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-200 text-slate-500">
                                                <th className="px-3 py-3">
                                                    Medicine
                                                </th>

                                                <th className="px-3 py-3">
                                                    Price
                                                </th>

                                                <th className="px-3 py-3">
                                                    Quantity
                                                </th>

                                                <th className="px-3 py-3">
                                                    Total
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {order.medicines.map(
                                                (item, index) => (
                                                    <tr
                                                        key={`${order._id}-${index}`}
                                                        className="border-b border-slate-100"
                                                    >
                                                        <td className="px-3 py-3 font-medium text-slate-800">
                                                            {item.medicine
                                                                ?.name ||
                                                                "Medicine"}
                                                        </td>

                                                        <td className="px-3 py-3 text-slate-600">
                                                            ₹
                                                            {item.price.toFixed(
                                                                2
                                                            )}
                                                        </td>

                                                        <td className="px-3 py-3 text-slate-600">
                                                            {item.quantity}
                                                        </td>

                                                        <td className="px-3 py-3 font-medium text-slate-800">
                                                            ₹
                                                            {(
                                                                item.price *
                                                                item.quantity
                                                            ).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                                <div>
                                    <h2 className="text-sm font-semibold text-slate-700">
                                        Delivery Address
                                    </h2>

                                    <p className="mt-2 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                                        {order.shippingAddress}
                                    </p>
                                </div>

                                <div>
                                    <h2 className="text-sm font-semibold text-slate-700">
                                        Prescription
                                    </h2>

                                    {order.prescription?.fileUrl ? (
                                        <a
                                            href={`http://localhost:3001${order.prescription.fileUrl}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-2 inline-block rounded-lg bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 hover:bg-amber-100"
                                        >
                                            View Prescription PDF
                                        </a>
                                    ) : (
                                        <p className="mt-2 text-sm text-slate-500">
                                            No prescription uploaded.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Current Status
                                    </p>

                                    <span className="mt-2 inline-block rounded-full bg-slate-100 px-4 py-2 text-sm font-medium capitalize text-slate-700">
                                        {order.status}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {order.status !== "confirmed" &&
                                        order.status !== "delivered" &&
                                        order.status !== "cancelled" && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateStatus(
                                                        order._id,
                                                        "confirmed"
                                                    )
                                                }
                                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                            >
                                                Confirm
                                            </button>
                                        )}

                                    {order.status !== "processing" &&
                                        order.status !== "delivered" &&
                                        order.status !== "cancelled" && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateStatus(
                                                        order._id,
                                                        "processing"
                                                    )
                                                }
                                                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                                            >
                                                Processing
                                            </button>
                                        )}

                                    {order.status !== "ready" &&
                                        order.status !== "delivered" &&
                                        order.status !== "cancelled" && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateStatus(
                                                        order._id,
                                                        "ready"
                                                    )
                                                }
                                                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                                            >
                                                Ready
                                            </button>
                                        )}

                                    {order.status !== "delivered" &&
                                        order.status !== "cancelled" && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateStatus(
                                                        order._id,
                                                        "delivered"
                                                    )
                                                }
                                                className="rounded-lg bg-[#0f6b78] px-4 py-2 text-sm font-medium text-white hover:bg-[#09545f]"
                                            >
                                                Delivered
                                            </button>
                                        )}

                                    {order.status !== "cancelled" &&
                                        order.status !== "delivered" && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateStatus(
                                                        order._id,
                                                        "cancelled"
                                                    )
                                                }
                                                className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;