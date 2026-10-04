

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useMedicineCart } from "../../context/MedicineCartContext";

const MedicineCheckout = () => {
    const { user } = useAuth();

    const {cartItems, cartTotal, clearCart} = useMedicineCart();

    const navigate = useNavigate();

    const [shippingAddress, setShippingAddress] = useState("");
    const [prescriptionFile, setPrescriptionFile] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [placingOrder, setPlacingOrder] = useState(false);

    const prescriptionRequired = cartItems.some(
        (item) => item.requiresPrescription
    );

    useEffect(() => {
        if (cartItems.length === 0) {
            navigate("/medicines");
        }
    }, [cartItems, navigate]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];

        setError("");
        setMessage("");

        if (!file) {
            setPrescriptionFile(null);
            return;
        }

        if (file.type !== "application/pdf") {
            setError("Only PDF prescription files are allowed.");
            event.target.value = "";
            setPrescriptionFile(null);
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Prescription PDF must be smaller than 5 MB.");
            event.target.value = "";
            setPrescriptionFile(null);
            return;
        }

        setPrescriptionFile(file);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setMessage("");

        if (cartItems.length === 0) {
            setError("Your medicine cart is empty.");
            return;
        }

        if (!shippingAddress.trim()) {
            setError("Please enter your delivery address.");
            return;
        }

        if (prescriptionRequired && !prescriptionFile) {
            setError(
                "A doctor prescription PDF is required for the medicines in your cart."
            );
            return;
        }

        setPlacingOrder(true);

        try {
            const formData = new FormData();

            const medicines = cartItems.map((item) => ({
                medicine: item._id,
                quantity: item.cartQuantity
            }));

            formData.append(
                "medicines",
                JSON.stringify(medicines)
            );

            formData.append(
                "shippingAddress",
                shippingAddress.trim()
            );

            formData.append(
                "paymentMethod",
                "cod"
            );

            if (prescriptionFile) {
                formData.append(
                    "prescription",
                    prescriptionFile
                );
            }

            const response = await api.post(
                "/medicine-orders",
                formData
            );

            setMessage(
                response.data.message ||
                "Medicine order placed successfully."
            );

            clearCart();

            setTimeout(() => {
                navigate("/medicines");
            }, 1500);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to place medicine order."
            );
        } finally {
            setPlacingOrder(false);
        }
    };

    if (cartItems.length === 0) {
        return null;
    }



    return (
        <div className="min-h-screen bg-slate-50">
            <section className="mx-auto max-w-6xl px-6 py-16 lg:px-10">

                <div className="mb-10">
                    <p className="text-sm font-semibold uppercase tracking-widest text-[#0f6b78]">
                        Hospital Pharmacy
                    </p>

                    <h1 className="mt-3 text-4xl font-semibold text-slate-900">
                        Medicine Checkout
                    </h1>

                    <p className="mt-4 max-w-2xl text-slate-600">
                        Review your details, upload your prescription if required,
                        and place your medicine order.
                    </p>
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

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">

                        <div className="space-y-6">

                            <div className="rounded-xl bg-white p-6 shadow-sm">
                                <h2 className="text-xl font-semibold text-slate-900">
                                    Patient Information
                                </h2>

                                <div className="mt-6 grid gap-5 sm:grid-cols-2">

                                    <div>
                                        <label className="text-sm font-medium text-slate-700">
                                            Name
                                        </label>

                                        <input
                                            type="text"
                                            value={user?.name || ""}
                                            readOnly
                                            className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-slate-700">
                                            Email
                                        </label>

                                        <input
                                            type="email"
                                            value={user?.email || ""}
                                            readOnly
                                            className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700"
                                        />
                                    </div>

                                </div>
                            </div>

                            <div className="rounded-xl bg-white p-6 shadow-sm">
                                <h2 className="text-xl font-semibold text-slate-900">
                                    Delivery Address
                                </h2>

                                <textarea
                                    value={shippingAddress}
                                    onChange={(event) =>
                                        setShippingAddress(event.target.value)
                                    }
                                    rows="5"
                                    placeholder="Enter your complete delivery address"
                                    className="mt-5 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-700 outline-none focus:border-[#0f6b78]"
                                    required
                                />
                            </div>

                            <div className="rounded-xl bg-white p-6 shadow-sm">

                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900">
                                        Doctor Prescription
                                    </h2>

                                    <p className="mt-2 text-sm text-slate-500">
                                        {prescriptionRequired
                                            ? "A prescription PDF is required for one or more medicines in your cart."
                                            : "Prescription is optional for the medicines in your cart."}
                                    </p>
                                </div>

                                <div className="mt-6">

                                    <label className="block text-sm font-medium text-slate-700">
                                        Prescription PDF
                                    </label>

                                    <input
                                        type="file"
                                        accept="application/pdf,.pdf"
                                        onChange={handleFileChange}
                                        className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-600"
                                    />

                                    <p className="mt-2 text-xs text-slate-500">
                                        PDF only, maximum 5 MB.
                                    </p>

                                    {prescriptionFile && (
                                        <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                                            Selected:{" "}
                                            {prescriptionFile.name}
                                        </div>
                                    )}

                                </div>
                            </div>

                        </div>

                        <div className="h-fit rounded-xl bg-white p-6 shadow-sm">

                            <h2 className="text-xl font-semibold text-slate-900">
                                Order Summary
                            </h2>

                            <div className="mt-6 space-y-4">

                                {cartItems.map((item) => (
                                    <div
                                        key={item._id}
                                        className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4"
                                    >
                                        <div>
                                            <p className="font-medium text-slate-800">
                                                {item.name}
                                            </p>

                                            <p className="mt-1 text-sm text-slate-500">
                                                ₹{item.sellingPrice} ×{" "}
                                                {item.cartQuantity}
                                            </p>
                                        </div>

                                        <span className="font-medium text-slate-800">
                                            ₹
                                            {(
                                                item.sellingPrice *
                                                item.cartQuantity
                                            ).toFixed(2)}
                                        </span>
                                    </div>
                                ))}

                            </div>

                            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">

                                <p className="text-sm font-medium text-slate-700">
                                    Payment Method
                                </p>

                                <p className="mt-1 font-semibold text-slate-900">
                                    Cash on Delivery
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    Pay when your medicine order is delivered.
                                </p>

                            </div>

                            <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-5">

                                <span className="text-lg font-semibold text-slate-900">
                                    Total
                                </span>

                                <span className="text-xl font-semibold text-[#0f6b78]">
                                    ₹{cartTotal.toFixed(2)}
                                </span>

                            </div>

                            <button
                                type="submit"
                                disabled={placingOrder}
                                className="mt-6 w-full rounded-lg bg-[#0f6b78] px-4 py-3 font-medium text-white transition hover:bg-[#09545f] disabled:cursor-not-allowed disabled:bg-slate-400"
                            >
                                {placingOrder
                                    ? "Placing Order..."
                                    : "Place Order - Cash on Delivery"}
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate("/medicine-cart")}
                                className="mt-3 w-full rounded-lg border border-slate-300 px-4 py-3 font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Back to Cart
                            </button>

                        </div>

                    </div>
                </form>

            </section>
        </div>
    );
};



export default MedicineCheckout;