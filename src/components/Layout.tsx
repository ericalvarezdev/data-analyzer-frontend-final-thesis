import {Link, Outlet, useNavigate} from "react-router-dom"


function Layout() {
    const navigate = useNavigate();

    // función para cuando el usuario quiera cerrar sessión
    function manejarLogout() {
        localStorage.removeItem("token")
        navigate("/")
    }

    return (
        <div>
            <nav style={{borderBottom: "1px solid #ccc", padding: "8px", marginBottom: "16px"}}>
                <Link to="/archivos">Archivos</Link>
                {" | "}
                <Link to="/historial">Historial</Link>
                {" | "}
                <Link to="/auth/me">Mi perfil</Link>
                {" | "}
                <button onClick={manejarLogout}>Cerrar Sesión</button>
            </nav>
            <Outlet />
        </div>
    );
}

export default Layout;