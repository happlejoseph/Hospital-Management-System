




const AdminLayout = ()=> {

    return (

        <div>
            <h1>Hospital Management System</h1>

            <nav>
                <p>Admin Dashboard</p>
                <p>Users</p>
                <p>Doctors</p>
                <p>Patients</p>
            </nav>

            <main>
                <Outlet/>
            </main>
        </div>
    )
}

export default AdminLayout;