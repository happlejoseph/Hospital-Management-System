

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { formatDate } from "../../utils/formatDate";
import { useAuth } from "../../context/AuthContext";
import { useMedicineCart } from "../../context/MedicineCartContext";

const MedicineDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, isPatient } = useAuth();
    const { addToCart, getCartQuantity } = useMedicineCart();
    const [medicine, setMedicine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [amount, setAmount] = useState(1);

    useEffect(() => {
        const loadMedicine = async() => {
            setLoading(true);
            setError("");

            try {
                const response = await api.get(`/medicines/public/${id}`);
                setMedicine(response.data.medicine);
                setAmount(1);
            }
            catch(error) {
                setMedicine(null);
                setError(error.response?.data?.message || "Unable to load medicine");
            }
            finally {
                setLoading(false);
            }
        };

        loadMedicine();
    }, [id]);

    const inCart = medicine ? getCartQuantity(medicine._id) : 0;
    const available = medicine ? Math.max(medicine.quantity - inCart, 0) : 0;

    const changeAmount = (value) => {
        setAmount(Math.min(Math.max(value, 1), Math.max(available, 1)));
    };

    const handleAddToCart = () => {
        setNotice("");

        if(!isAuthenticated) {
            navigate("/login");
            return;
        }

        if(!isPatient) {
            setNotice("Only patient accounts can order medicines.");
            return;
        }

        addToCart(medicine, amount);
        setAmount(1);
        setNotice("Added to your medicine cart.");
    };

    const handleBuyNow = () => {
        if(!isAuthenticated) {
            navigate("/login");
            return;
        }

        if(!isPatient) {
            setNotice("Only patient accounts can order medicines.");
            return;
        }

        if(available > 0) {
            addToCart(medicine, amount);
        }

        navigate("/medicine-cart");
    };

    if(loading) {
        return <div className="flex min-h-[60vh] items-center justify-center"><p className="text-slate-500">Loading medicine...</p></div>;
    }

    if(error || !medicine) {
        return (
            <div className="min-h-[70vh] bg-slate-50 px-6 py-20">
                <div className="mx-auto max-w-3xl rounded-xl bg-white p-12 text-center shadow-sm">
                    <h1 className="text-3xl font-semibold text-slate-900">Medicine not found</h1>
                    <p className="mt-3 text-slate-500">{error || "This medicine is no longer available."}</p>
                    <Link to="/medicines" className="mt-8 inline-block rounded-lg bg-[#0f6b78] px-6 py-3 font-medium text-white hover:bg-[#09545f]">
                        Browse Medicines
                    </Link>
                </div>
            </div>
        );
    }

    const inStock = medicine.quantity > 0;

    return (
        <div className="min-h-screen bg-slate-50">
            <section className="mx-auto max-w-6xl px-6 py-16 lg:px-10">
                <Link to="/medicines" className="text-sm font-medium text-[#0f6b78] hover:text-[#09545f]">← Back to Medicines</Link>

                <div className="mt-6 grid gap-8 lg:grid-cols-2">
                    <div className="relative flex min-h-[360px] items-center justify-center rounded-xl bg-white p-8 shadow-sm">
                        {medicine.image ? (
                            <img src={medicine.image} alt={medicine.name} className="max-h-[420px] w-full object-contain" />
                        ) : (
                            <span className="text-sm text-slate-400">No image available</span>
                        )}

                        {medicine.requiresPrescription && (
                            <span className="absolute left-4 top-4 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Prescription Required</span>
                        )}
                    </div>

                    <div className="rounded-xl bg-white p-8 shadow-sm">
                        {medicine.category && <p className="text-sm font-semibold uppercase tracking-widest text-[#0f6b78]">{medicine.category}</p>}

                        <h1 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">{medicine.name}</h1>

                        <div className="mt-5 flex items-center gap-4">
                            <span className="text-3xl font-semibold text-[#0f6b78]">₹{medicine.sellingPrice}</span>
                            <span className={`rounded-full px-3 py-1 text-sm font-medium ${inStock ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                                {inStock ? "In Stock" : "Out of Stock"}
                            </span>
                        </div>

                        <p className="mt-6 leading-7 text-slate-600">
                            {medicine.description || "No additional description is available for this medicine."}
                        </p>

                        <div className="mt-6 grid gap-4 border-t border-slate-100 pt-6 text-sm sm:grid-cols-2">
                            <div>
                                <p className="text-slate-500">Available Stock</p>
                                <p className="mt-1 font-medium text-slate-900">{medicine.quantity} units</p>
                            </div>

                            <div>
                                <p className="text-slate-500">Expiry Date</p>
                                <p className="mt-1 font-medium text-slate-900">{formatDate(medicine.expiryDate)}</p>
                            </div>

                            <div className="sm:col-span-2">
                                <p className="text-slate-500">Prescription</p>
                                <p className="mt-1 font-medium text-slate-900">
                                    {medicine.requiresPrescription ? "A valid doctor prescription PDF is required at checkout." : "No prescription required."}
                                </p>
                            </div>
                        </div>

                        {notice && <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">{notice}</div>}

                        {inCart > 0 && (
                            <p className="mt-6 text-sm text-slate-500">You already have {inCart} in your cart.</p>
                        )}

                        <div className="mt-6 flex items-center gap-4">
                            <span className="text-sm font-medium text-slate-700">Quantity</span>

                            <button type="button" onClick={() => changeAmount(amount - 1)} disabled={amount <= 1 || available <= 0} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-lg hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40">−</button>
                            <span className="w-6 text-center font-medium">{available > 0 ? amount : 0}</span>
                            <button type="button" onClick={() => changeAmount(amount + 1)} disabled={amount >= available} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-lg hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40">+</button>
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            <button type="button" onClick={handleAddToCart} disabled={!inStock || available <= 0} className="rounded-lg bg-[#0f6b78] px-4 py-3 font-medium text-white transition hover:bg-[#09545f] disabled:cursor-not-allowed disabled:bg-slate-300">
                                {!inStock ? "Out of Stock" : available <= 0 ? "Maximum Quantity in Cart" : "Add to Cart"}
                            </button>

                            <button type="button" onClick={handleBuyNow} disabled={!inStock} className="rounded-lg border border-[#0f6b78] px-4 py-3 font-medium text-[#0f6b78] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400">
                                {inCart > 0 ? "Go to Cart" : "Buy Now"}
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default MedicineDetail;
