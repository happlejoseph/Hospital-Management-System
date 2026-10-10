

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useMedicineCart } from "../../context/MedicineCartContext";

const Medicines = () => {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [search, setSearch] = useState("");
    const { isAuthenticated, isPatient } = useAuth();
    const { addToCart, getCartQuantity } = useMedicineCart();
    const navigate = useNavigate();

    const loadMedicines = async() => {
        setError("");
        try {
            const response = await api.get("/medicines/public");
            setMedicines(Array.isArray(response.data.medicines) ? response.data.medicines : []);
        }
        catch(error) {
            setError(error.response?.data?.message || "Unable to load medicines");
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMedicines();
        const refresh = () => loadMedicines();
        window.addEventListener("focus", refresh);
        return () => window.removeEventListener("focus", refresh);
    }, []);

    const handleAddToCart = (medicine) => {
        setNotice("");

        if(!isAuthenticated) {
            navigate("/login");
            return;
        }

        if(!isPatient) {
            setNotice("Only patient accounts can order medicines.");
            return;
        }

        addToCart(medicine);
    };

    const filteredMedicines = medicines.filter((medicine) => {
        const keyword = search.trim().toLowerCase();

        if(!keyword) {
            return true;
        }

        return medicine.name.toLowerCase().includes(keyword) || (medicine.category || "").toLowerCase().includes(keyword);
    });

    if(loading) {
        return <div className="flex min-h-[60vh] items-center justify-center"><p className="text-slate-500">Loading medicines...</p></div>;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
                <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-widest text-[#0f6b78]">Hospital Pharmacy</p>
                        <h1 className="mt-3 text-4xl font-semibold text-slate-900 sm:text-5xl">Medicines</h1>
                        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">Browse medicines available through our hospital pharmacy.</p>
                    </div>

                    <input
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search medicines"
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-700 outline-none focus:border-[#0f6b78] lg:w-80"
                    />
                </div>

                {error && <div className="mb-8 rounded-lg bg-red-50 p-4 text-red-600">{error}</div>}
                {notice && <div className="mb-8 rounded-lg bg-amber-50 p-4 text-amber-700">{notice}</div>}

                {filteredMedicines.length === 0 ? (
                    <div className="rounded-xl bg-white p-10 text-center shadow-sm">
                        <h2 className="text-xl font-semibold text-slate-800">{medicines.length === 0 ? "No medicines available" : "No medicines found"}</h2>
                        <p className="mt-2 text-slate-500">{medicines.length === 0 ? "Please check again later." : "Try a different search."}</p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredMedicines.map((medicine) => {
                            const inCart = getCartQuantity(medicine._id);

                            return (
                                <div key={medicine._id} className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                                    <Link to={`/medicines/${medicine._id}`} className="block">
                                        <div className="relative flex h-52 items-center justify-center bg-slate-100">
                                            {medicine.image ? (
                                                <img src={medicine.image} alt={medicine.name} className="h-full w-full object-contain p-5" />
                                            ) : (
                                                <span className="text-sm text-slate-400">No image available</span>
                                            )}

                                            {medicine.requiresPrescription && (
                                                <span className="absolute left-3 top-3 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Prescription Required</span>
                                            )}
                                        </div>

                                        <div className="px-6 pt-6">
                                            {medicine.category && <p className="text-xs font-semibold uppercase tracking-widest text-[#0f6b78]">{medicine.category}</p>}
                                            <h2 className="mt-1 text-lg font-semibold text-slate-900">{medicine.name}</h2>
                                            <div className="mt-5 flex items-center justify-between gap-4">
                                                <span className="text-xl font-semibold text-[#0f6b78]">₹{medicine.sellingPrice}</span>
                                                <span className={`text-sm font-medium ${medicine.quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                                                    {medicine.quantity > 0 ? "In Stock" : "Out of Stock"}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>

                                    <div className="px-6 pb-6">
                                        <div className="mt-5 grid grid-cols-2 gap-3">
                                            <Link to={`/medicines/${medicine._id}`} className="rounded-lg border border-slate-300 px-4 py-3 text-center font-medium text-slate-700 transition hover:bg-slate-50">
                                                View Details
                                            </Link>

                                            <button type="button" onClick={() => handleAddToCart(medicine)} disabled={medicine.quantity <= 0 || inCart >= medicine.quantity} className="rounded-lg bg-[#0f6b78] px-4 py-3 font-medium text-white transition hover:bg-[#09545f] disabled:cursor-not-allowed disabled:bg-slate-300">
                                                {medicine.quantity <= 0 ? "Out of Stock" : inCart > 0 ? `In Cart (${inCart})` : "Add to Cart"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Medicines;
