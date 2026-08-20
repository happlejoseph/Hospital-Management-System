

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Users from "./pages/admin/Users";
import Dashboard from "./pages/admin/Dashboard";
import Doctor from "../../server/src/models/Doctor";


const App = () => {

    return (

        <BrowserRouter>

            <Routes>

                <Route path= "/admin/users" element={<Users />}/>
                <Route path= 'dashboard' element={<Dashboard/>}/>
                <Route path= 'users' element={<Users/>}/>
                <Route path= 'doctors' element={<Doctors/>}/>

            </Routes>

        </BrowserRouter>

    );
};

export default App;