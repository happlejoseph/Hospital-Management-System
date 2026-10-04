

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { MedicineCartProvider } from "./context/MedicineCartContext";
import ProtectedRoute from "./components/common/ProtectedRoutes";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import PharmacistLayout from "./layouts/PharmacistLayout";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Departments from "./pages/public/Departments";
import DepartmentDetail from "./pages/public/DepartmentDetail";
import Doctors from "./pages/public/Doctors";
import DoctorDetail from "./pages/public/DoctorDetail";
import Appointments from "./pages/patient/Appointments";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminDepartments from "./pages/admin/Departments";
import AdminDoctors from "./pages/admin/Doctors";
import AdminUsers from "./pages/admin/Users";
import AdminAppointments from "./pages/admin/Appointments";
import AdminPharmacy from "./pages/admin/Pharmacy";
import AdminMedicalRecords from "./pages/admin/MedicalRecords";
import PharmacistDashboard from "./pages/pharmacist/Dashboard";
import PublicMedicines from "./pages/public/Medicines";
import PharmacistMedicines from "./pages/pharmacist/Medicines";
import Purchase from "./pages/pharmacist/Purchase";
import Dispense from "./pages/pharmacist/Dispense";
import InventoryReports from "./pages/pharmacist/InventoryReports";
import About from "./pages/About";
import MedicineCart from "./pages/public/MedicineCart";
import MedicineCheckout from "./pages/public/MedicineCheckout";
import PharmacistOrders from "./pages/pharmacist/Orders";
import MedicineOrders from "./pages/patient/MedicineOrders";



const App = () => (
    <BrowserRouter>
        <AuthProvider>
            <MedicineCartProvider>
            <Routes>
                <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
                <Route path="/doctors" element={<PublicLayout><Doctors /></PublicLayout>} />
                <Route path="/doctors/:id" element={<PublicLayout><DoctorDetail /></PublicLayout>} />
                <Route path="/departments" element={<PublicLayout><Departments /></PublicLayout>} />
                <Route path="/departments/:slug" element={<PublicLayout><DepartmentDetail /></PublicLayout>} />
                <Route path="/about"element={<PublicLayout><About /></PublicLayout>}/>
                <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
                <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />

                <Route path="/medicines"element={<PublicLayout><PublicMedicines /></PublicLayout>}/>
                <Route path="/medicine-cart"element={<ProtectedRoute allowedRoles={["patient"]}><PublicLayout><MedicineCart /></PublicLayout></ProtectedRoute>}/>
                <Route path="/medicine-checkout"element={<ProtectedRoute allowedRoles={["patient"]}><PublicLayout><MedicineCheckout /></PublicLayout></ProtectedRoute>}/>

                <Route path="/appointments" element={<ProtectedRoute><PublicLayout><Appointments /></PublicLayout></ProtectedRoute>} />

                <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/departments" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout><AdminDepartments /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/doctors" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout><AdminDoctors /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout><AdminUsers /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/appointments" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout><AdminAppointments /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/pharmacy" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout><AdminPharmacy /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/medical-records" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout><AdminMedicalRecords /></AdminLayout></ProtectedRoute>} />

                <Route path="/pharmacist" element={<ProtectedRoute allowedRoles={["pharmacist"]}><PharmacistLayout><PharmacistDashboard /></PharmacistLayout></ProtectedRoute>} />
                
                <Route path="/pharmacist/orders"element={<ProtectedRoute allowedRoles={["pharmacist"]}><PharmacistLayout><PharmacistOrders /></PharmacistLayout></ProtectedRoute>}/>
                <Route path="/medicine-orders"element={<ProtectedRoute allowedRoles={["patient"]}><PublicLayout><MedicineOrders /></PublicLayout></ProtectedRoute>}/>
                
                <Route path="/pharmacist/medicines" element={<ProtectedRoute allowedRoles={["pharmacist"]}><PharmacistLayout><PharmacistMedicines /></PharmacistLayout></ProtectedRoute>} />
                <Route path="/pharmacist/purchase" element={<ProtectedRoute allowedRoles={["pharmacist"]}><PharmacistLayout><Purchase /></PharmacistLayout></ProtectedRoute>} />
                <Route path="/pharmacist/dispense" element={<ProtectedRoute allowedRoles={["pharmacist"]}><PharmacistLayout><Dispense /></PharmacistLayout></ProtectedRoute>} />
                <Route path="/pharmacist/reports" element={<ProtectedRoute allowedRoles={["pharmacist"]}><PharmacistLayout><InventoryReports /></PharmacistLayout></ProtectedRoute>} />
            </Routes>
            </MedicineCartProvider>
        </AuthProvider>
    </BrowserRouter>
);


export default App;
