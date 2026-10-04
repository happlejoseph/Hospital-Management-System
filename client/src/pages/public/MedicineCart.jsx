

import { Link } from "react-router-dom";
import { useMedicineCart } from "../../context/MedicineCartContext";

const MedicineCart = () => {
    const {
        cartItems,
        cartTotal,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart
    } = useMedicineCart();

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[70vh] bg-slate-50 px-6 py-20">
                <div className="mx-auto max-w-3xl rounded-xl bg-white p-12 text-center shadow-sm">
                    <h1 className="text-3xl font-semibold text-slate-900">
                        Your medicine cart is empty
                    </h1>

                    <p className="mt-3 text-slate-500">
                        Add medicines from the hospital pharmacy to continue.
                    </p>

                    <Link
                        to="/medicines"
                        className="mt-8 inline-block rounded-lg bg-[#0f6b78] px-6 py-3 font-medium text-white hover:bg-[#09545f]"
                    >
                        Browse Medicines
                    </Link>
                </div>
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
                        Medicine Cart
                    </h1>
                </div>

                <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
                    <div className="space-y-4">
                        {cartItems.map((medicine) => (
                            <div
                                key={medicine._id}
                                className="rounded-xl bg-white p-6 shadow-sm"
                            >
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900">
                                            {medicine.name}
                                        </h2>

                                        <p className="mt-2 text-sm text-slate-500">
                                            ₹{medicine.sellingPrice} per unit
                                        </p>

                                        {medicine.requiresPrescription && (
                                            <p className="mt-2 text-sm text-amber-700">
                                                Doctor prescription required
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                decreaseQuantity(medicine._id)
                                            }
                                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-lg hover:bg-slate-100"
                                        >
                                            −
                                        </button>

                                        <span className="w-6 text-center font-medium">
                                            {medicine.cartQuantity}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                increaseQuantity(medicine._id)
                                            }
                                            disabled={
                                                medicine.cartQuantity >=
                                                medicine.quantity
                                            }
                                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-lg hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                                    <span className="font-semibold text-slate-900">
                                        ₹
                                        {(
                                            medicine.sellingPrice *
                                            medicine.cartQuantity
                                        ).toFixed(2)}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeFromCart(medicine._id)
                                        }
                                        className="text-sm font-medium text-red-600 hover:text-red-700"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="h-fit rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-slate-900">
                            Order Summary
                        </h2>

                        <div className="mt-6 flex items-center justify-between border-b border-slate-200 pb-4">
                            <span className="text-slate-500">
                                Medicine Total
                            </span>

                            <span className="font-semibold text-slate-900">
                                ₹{cartTotal.toFixed(2)}
                            </span>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-lg font-semibold text-slate-900">
                                Total
                            </span>

                            <span className="text-xl font-semibold text-[#0f6b78]">
                                ₹{cartTotal.toFixed(2)}
                            </span>
                        </div>

                        <Link
                            to="/medicine-checkout"
                            className="mt-6 block w-full rounded-lg bg-[#0f6b78] px-4 py-3 text-center font-medium text-white hover:bg-[#09545f]"
                        >
                            Proceed to Checkout
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default MedicineCart;