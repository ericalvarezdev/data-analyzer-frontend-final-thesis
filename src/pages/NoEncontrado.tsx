import { Link } from "react-router-dom";

function NoEncontrado() {
    return(
        <div>
            <h2>Página no encontrada</h2>
            <Link to="/archivos">Volver al inicio</Link>
        </div>
    );
}

export default NoEncontrado;
