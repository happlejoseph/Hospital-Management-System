




const AdminLayout = ()=> {

    return (

        <div>
            <h1>Hospital Management System</h1>

            <nav>
                <Link to= '/admin/dashboard'>Dashboard</Link>
                <Link to= '/admin/users'>Users</Link>
                <Link to= '/admin/doctors'>Doctors</Link>
                <Link to= '/admin/patients'>Patients</Link>
            </nav>

            <main>
                <Outlet/>
            </main>
        </div>
    )
}

export default AdminLayout;