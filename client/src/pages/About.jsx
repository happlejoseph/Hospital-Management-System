

const aboutImages = {
    main: "https://res.cloudinary.com/eneepkso/image/upload/v1791097163/cr-banner.webp",
    hospital: "https://res.cloudinary.com/eneepkso/image/upload/v1791097454/banner-2.webp"
};

const About = () => {
    return (
        <div className="bg-white text-slate-900">

            <section className="mx-auto max-w-7xl px-6 pb-20 pt-16 lg:px-10 lg:pb-24 lg:pt-20">

                <div className="mb-14">
                    <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                        About Our Hospital
                    </h1>

                    <p className="mt-3 text-2xl font-medium text-[#0f6b78] sm:text-3xl">
                        Our story of care...
                    </p>
                </div>

                <div className="grid items-center lg:grid-cols-[1.55fr_0.85fr]">

                    <div className="overflow-hidden">
                        <img
                            src={aboutImages.main}
                            alt="Hospital"
                            className="h-[420px] w-full object-cover lg:h-[500px]"
                        />
                    </div>

                    <div className="bg-[#0f6b78] p-8 text-white sm:p-10 lg:-ml-10 lg:p-12">
                        <h2 className="text-2xl font-medium leading-tight sm:text-3xl">
                            Quality healthcare with compassion and trust.
                        </h2>

                        <p className="mt-8 text-sm leading-7 text-white/90 sm:text-base">
                            Welcome to our hospital, where experienced medical
                            professionals and modern healthcare services come
                            together to provide reliable and compassionate care.
                        </p>

                        <p className="mt-5 text-sm leading-7 text-white/90 sm:text-base">
                            We are committed to making healthcare accessible,
                            patient-focused and connected. Our goal is to support
                            every patient throughout their healthcare journey.
                        </p>
                    </div>

                </div>
            </section>


            <section className="border-y border-slate-200">
                <div className="mx-auto grid max-w-7xl lg:grid-cols-[1.25fr_2.75fr] lg:px-10">

                    <div className="px-6 py-12 lg:px-0 lg:py-14">
                        <h2 className="max-w-xs text-3xl font-semibold leading-tight text-[#0f6b78] sm:text-4xl">
                            Our hospital
                            <br />
                            in numbers.
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 border-t border-slate-200 sm:grid-cols-4 lg:border-l lg:border-t-0">

                        <div className="border-b border-r border-slate-200 px-6 py-10 sm:border-b-0">
                            <span className="text-3xl font-semibold">
                                10+
                            </span>

                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                Years of Care
                            </p>
                        </div>

                        <div className="border-b border-slate-200 px-6 py-10 sm:border-b-0 sm:border-r">
                            <span className="text-3xl font-semibold">
                                24×7
                            </span>

                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                Healthcare Support
                            </p>
                        </div>

                        <div className="border-r border-slate-200 px-6 py-10">
                            <span className="text-3xl font-semibold">
                                10+
                            </span>

                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                Medical Specialists
                            </p>
                        </div>

                        <div className="px-6 py-10">
                            <span className="text-3xl font-semibold">
                                10+
                            </span>

                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                Departments
                            </p>
                        </div>

                    </div>

                </div>
            </section>


            <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">

                <div className="grid items-start gap-16 lg:grid-cols-[1.45fr_0.75fr] lg:gap-24">

                    <div>

                        <div>
                            <h2 className="text-xl font-semibold">
                                Our Vision
                            </h2>

                            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                                To provide accessible, compassionate and quality
                                healthcare that improves the wellbeing of every patient.
                            </p>
                        </div>


                        <div className="mt-12">
                            <h2 className="text-xl font-semibold">
                                Our Mission
                            </h2>

                            <ul className="mt-5 space-y-2 text-base leading-7 text-slate-600">
                                <li>• To provide patient-focused and compassionate care.</li>
                                <li>• To provide quality healthcare through experienced professionals.</li>
                                <li>• To maintain high standards of safety and service.</li>
                                <li>• To make healthcare accessible and convenient.</li>
                                <li>• To continuously improve our medical services.</li>
                            </ul>
                        </div>


                        <div className="mt-12">
                            <h2 className="text-xl font-semibold">
                                Our Motto
                            </h2>

                            <p className="mt-3 text-base text-slate-600">
                                Care with compassion. Healing with trust.
                            </p>
                        </div>


                        <div className="mt-12">
                            <h2 className="text-xl font-semibold underline underline-offset-4">
                                Our Values
                            </h2>

                            <ul className="mt-5 space-y-2 text-base leading-7 text-slate-600">
                                <li>• Patient-centered care.</li>
                                <li>• Compassion and empathy.</li>
                                <li>• Professional integrity.</li>
                                <li>• Respect and dignity.</li>
                                <li>• Teamwork and collaboration.</li>
                                <li>• Commitment to quality.</li>
                            </ul>
                        </div>

                    </div>


                    <div className="overflow-hidden">
                        <img
                            src={aboutImages.hospital}
                            alt="Hospital building"
                            className="h-[520px] w-full object-cover"
                        />
                    </div>

                </div>

            </section>

        </div>
    );
};

export default About;