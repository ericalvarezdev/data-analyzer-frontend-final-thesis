import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/client";
import type{ TokenResponse } from "../types/auth";


function Login(){
    const[email, setEmail] = useState("")
    const[contraseña, setContraseña] = useState("")
    const[error, setError] = useState<String|null>(null)
    const[cargando, setCargando] = useState(false)


    const navigate = useNavigate();


    async function manejarEnvio(e: React.FormEvent<HTMLFormElement>){

        e.preventDefault();
        setCargando(true)
        setError(null)

        // Creo un formulario para enviar los datos en formato URL-encoded,
        // porque OAuth2PasswordRequestForm de FastAPI no espera JSON.
        const datos = new URLSearchParams();

        // FastAPI espera el campo "username", pero le paso el email del usuario.
        datos.append("username", email);
        datos.append("password", contraseña);



        try {

            // la respuesta será del tipo TokenResponse y le envío datos para hacer el login
            const respuesta = await api.post<TokenResponse>("/auth/login", datos,
                                            {
                                                // Indico que los datos se envían como formulario URL-encoded
                                                // para que OAuth2PasswordRequestForm pueda leerlos correctamente
                                                headers: {
                                                    "Content-Type": "application/x-www-form-urlencoded"
                                                }
                                            }
            )
            
            // guardo el token para poder usarlo en las siguientes peticiones
            // lo guardo en localStorage para que sobreviva a un refresco de página
            localStorage.setItem("token", respuesta.data.access_token)

            // redirige tras el login correcto
            navigate("/archivos")
        } catch(err: any) {
            console.log("Status:", err.response?.status);
            console.log(JSON.stringify(err.response?.data, null, 2));            
            setError("Ha ocurrido un error");

            // Capturo excepción lanzado por el backend
            setError("Email o contraseña incorrectos")
        } finally {
            setCargando(false)
        }
    }

    return (
        <form onSubmit={manejarEnvio}>
            <h2>Iniciar Sesión</h2>
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

            {/* Si error tiene algún valor, muestra este */}
            {error && <p style={{color: "red"}}>{error}</p>}


            <button type="submit" disabled={cargando}>
                {cargando ? "Entrando...": "Entrar"}
            </button>

            <p>
                No tienes cuenta? <Link to="/registro">Registrarse</Link>
            </p>
        </form>
    );
}

export default Login
