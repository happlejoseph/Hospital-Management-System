

const Dashboard = () => {

    return (
        <div>

            {/* Page Heading */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800">
                    Admin Dashboard
                </h2>

                <p className="text-gray-500 mt-2">
                    Welcome to the Hospital Management System
                </p>
            </div>


            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Users */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">
                        Total Users
                    </h3>

                    <p className="text-3xl font-bold text-gray-800 mt-2">
                        125
                    </p>
                </div>


                {/* Doctors */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">
                        Total Doctors
                    </h3>

                    <p className="text-3xl font-bold text-gray-800 mt-2">
                        24
                    </p>
                </div>


                {/* Patients */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">
                        Total Patients
                    </h3>

                    <p className="text-3xl font-bold text-gray-800 mt-2">
                        850
                    </p>
                </div>


                {/* Appointments */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">
                        Appointments
                    </h3>

                    <p className="text-3xl font-bold text-gray-800 mt-2">
                        42
                    </p>
                </div>

            </div>

        </div>
    );
};


export default Dashboard;