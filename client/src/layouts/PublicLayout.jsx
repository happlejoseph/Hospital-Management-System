

import Navbar from "../components/common/Navbar";

const PublicLayout = ({ children }) => {

    return (
        <div className="app-shell">
            <Navbar />
            <main>{children}</main>
            <footer className="footer">
                <div>
                    <strong>CarePoint Hospital</strong>
                    <p>Quality healthcare with trusted medical professionals.</p>
                </div>
                <p>© 2026 CarePoint Hospital. All rights reserved.</p>
            </footer>
        </div>
    );
};



export default PublicLayout;
