

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Users from "./pages/admin/Users";


const App = () => {

    return (

        <BrowserRouter>

            <Routes>

                <Route
                    path="/admin/users"
                    element={<Users />}
                />

            </Routes>

        </BrowserRouter>

    );
};

export default App;