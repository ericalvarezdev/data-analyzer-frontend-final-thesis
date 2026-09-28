import {useState, useEffect} from "react"
import { useParams, useNavigate } from "react-router-dom"

import api from "../api/client"
import type { PreviewArchivo } from "../types/preview"


function PreviewArchivoPage(){

    // lo guardo como string porque los parámetros de la URL llegan como texto
    // la URL es /archivos/:{archivoId}/preview, leo la id de ahí con useParams
    const {archivoId} = useParams<{archivoId: string}>()
    const navigate = useNavigate();

    const[preview, setPreview] = useState<PreviewArchivo|null>(null)
    const[cargando, setCargando] = useState<boolean>(true)
    const[error, setError] = useState<string|null>(null)

    useEffect(() => {
        // función que se encarga de cargar los datos de la previsualización
        async function cargarPreview(){
            setCargando(true)
            setError(null)

            try {
                const respuesta = await api.get<PreviewArchivo>(`/archivos/${archivoId}/preview`)
                setPreview(respuesta.data)
            } catch {
                setError("No se pudo cargar la previsualización")
            } finally {
                setCargando(false)
            }
        }
        // dentro de useEffect, fuera de la función llamo a la función solo si existe archivoId
        if(archivoId) {
            cargarPreview();
        }
    }, [archivoId]) // si cambia el id de la URL vuelve a cargar


    if(cargando) return <p>Cargando previsualización</p>
    if(error) return <p style={{color:"red"}}>{error}</p>
    // si una vez termina de cargar y no hay preview no muestra nada (por protección)
    if(!preview) return null

    return(
        <div>
            <h2>Previsualización del Archivo</h2>

            <table border={1}>
                <thead>
                    <tr>
                        {preview.columnas.map((nombreColumna) => (
                        <th key={nombreColumna}>{nombreColumna}</th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {/*hago bucle anidado para encontrar el valor de cada fila[columna]*/}
                    {preview.filas.map((fila, indiceFila) => (
                        <tr key={indiceFila}>
                            {preview.columnas.map((nombreColumna) => (
                                <td key={nombreColumna}>{fila[nombreColumna]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={() => navigate("/archivos")}>Volver</button>
        </div>
    )
}

export default PreviewArchivoPage