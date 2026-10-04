

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useMedicineCart } from "../../context/MedicineCartContext";


const Medicines = () => {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { isAuthenticated } = useAuth();
    const { addToCart } = useMedicineCart();
    const navigate = useNavigate();

    useEffect(() => {
        const loadMedicines = async () => {
            try {
                const response = await api.get("/medicines");
                setMedicines(response.data.medicines || []);
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Unable to load medicines"
                );
            } finally {
                setLoading(false);
            }
        };

        loadMedicines();
    }, []);

    const handleAddToCart = (medicine) => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        addToCart(medicine);
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-slate-500">Loading medicines...</p>
            </div>
        );
    }




    return (
        <div className="min-h-screen bg-slate-50">
            <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">

                <div className="mb-12">
                    <p className="text-sm font-semibold uppercase tracking-widest text-[#0f6b78]">
                        Hospital Pharmacy
                    </p>

                    <h1 className="mt-3 text-4xl font-semibold text-slate-900 sm:text-5xl">
                        Medicines
                    </h1>

                    <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                        Browse medicines available through our hospital pharmacy.
                    </p>
                </div>

                {error && (
                    <div className="mb-8 rounded-lg bg-red-50 p-4 text-red-600">
                        {error}
                    </div>
                )}

                {medicines.length === 0 ? (
                    <div className="rounded-xl bg-white p-10 text-center shadow-sm">
                        <h2 className="text-xl font-semibold text-slate-800">
                            No medicines available
                        </h2>

                        <p className="mt-2 text-slate-500">
                            Please check again later.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {medicines.map((medicine) => (
                            <div
                                key={medicine._id}
                                className="rounded-xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                            >
                                <h2 className="text-lg font-semibold text-slate-900">
                                    {medicine.name}
                                </h2>

                                <div className="mt-5 flex items-center justify-between">
                                    <span className="text-xl font-semibold text-[#0f6b78]">
                                        ₹{medicine.sellingPrice}
                                    </span>

                                    <span
                                        className={`text-sm font-medium ${
                                            medicine.quantity > 0
                                                ? "text-green-600"
                                                : "text-red-600"
                                        }`}
                                    >
                                        {medicine.quantity > 0
                                            ? "In Stock"
                                            : "Out of Stock"}
                                    </span>
                                </div>

                                {medicine.requiresPrescription && (
                                    <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
                                        Doctor prescription required
                                    </p>
                                )}

                                <button
                                    type="button"
                                    onClick={() => handleAddToCart(medicine)}
                                    disabled={medicine.quantity <= 0}
                                    className="mt-5 w-full rounded-lg bg-[#0f6b78] px-4 py-3 font-medium text-white transition hover:bg-[#09545f] disabled:cursor-not-allowed disabled:bg-slate-300"
                                >
                                    {medicine.quantity > 0
                                        ? "Add to Cart"
                                        : "Out of Stock"}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Medicines;