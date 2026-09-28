import { useState, useEffect } from "react"
import api from "../api/client"
import type { UsuarioResponse } from "../types/auth"

function Perfil () {
    const[usuario, setUsuario] = useState<UsuarioResponse|null>(null)
    const[error, setError] = useState<string|null>(null)

    useEffect(() => {
        async function cargarUsuario(){
            setError(null)

            try{
                const respuesta = await api.get("/auth/me")
                setUsuario(respuesta.data)
            } catch {
                setError("No se pudo cargar tu perfil")
            }
        }
        cargarUsuario();
    },[])

    if(error) return <p style={{color:"red"}}>{error}</p>
    // Mientras el usuario no se haya cargado muestro Cargando...
    if(!usuario) return <p>Cargando...</p>

    return(
        <div>
            <h2>Mi perfil</h2>
            <p>Nombre: {usuario.nombre}</p>
            <p>Email: {usuario.email}</p>
            <p>Registrado el: {new Date(usuario.fecha_registro).toLocaleDateString()}</p>
        </div>
    );
}

export default Perfil;