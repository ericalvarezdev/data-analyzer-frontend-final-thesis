import { useState } from "react";
import { useNavigate,Link } from "react-router-dom";
import api from "../api/client";
import type { UsuarioCreateRequest, UsuarioResponse } from "../types/auth";

const LONGITUD_MINIMA_CONTRASEÑA = 8


function Registro () {
    const[nombre, setNombre] = useState("")
    const[email, setEmail] = useState("")
    const[contraseña, setContraseña] = useState("")
    const[confirmarContraseña, setConfirmarContraseña] = useState("")
    const[error, setError] = useState<string|null>(null)
    const[cargando, setCargando] = useState(false)

    const navigate = useNavigate();

    // Función que hace la llamada a la api con el registro
    async function manejarEnvio(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null)

        if(contraseña.length < LONGITUD_MINIMA_CONTRASEÑA) {
            setError(`La contraseña debe tener almenos ${LONGITUD_MINIMA_CONTRASEÑA} carcteres`)
            return;
        }

        if(contraseña !== confirmarContraseña) {
            setError("Las contraseñas no coinciden")
            return;
        }

        setCargando(true)

        const datos: UsuarioCreateRequest = {nombre,email,contraseña}
        try {
            await api.post<UsuarioResponse>("/auth/registro", datos)
            // Tras registrarse con éxito voy al loggin para iniciar sesión con el usuario creado
            navigate("/")
        } catch(err) {
            setError("No se pudo completar el registro (El email ya está en uso?)")
        } finally {
            setCargando(false)
        }
    }

    return (
        <form onSubmit={manejarEnvio}>
            <h2>Crear Cuenta</h2>

            <input
                value={nombre}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)}
                placeholder="Nombre"
                required
            />

            <input
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="Email"
                required
            />

            <input
                type="password"
                value={contraseña}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContraseña(e.target.value)}
                placeholder="Contraseña"
                required
            />

            <input
                type="password"
                value={confirmarContraseña}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmarContraseña(e.target.value)}
                placeholder="Confirmar contraseña"
                required
            />

            {error && <p style={{color:"red"}}>{error}</p>}

            <button type="submit" disabled={cargando}>
                {cargando ? "Creando cuenta..." : "Registrarse"}
            </button>

            <p>
                {/* El link crea un enlace Inicia sesión que va a "/" para iniciar sesión */}
                Ya tienes cuenta? <Link to="/">Inicia Sesión</Link>
            </p>
        </form>
    );
}

export default Registro;