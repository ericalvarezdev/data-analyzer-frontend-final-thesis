import { Navigate, Outlet } from "react-router-dom";


function RutaPrivada() {
    const token = localStorage.getItem("token")

    // si NO hay token redirige inmediatamente a "/" página de login
    // si SI hay token Outlet deja pasar a la ruta hija que corresponda
    // replace evita que la página anterior quede guardada en el historial
    // así si vuelvo atrás irá a la página de inicio igualmente y no a la ruta protegida
    return token ? <Outlet /> : <Navigate to="/" replace/>
}

export default RutaPrivada;