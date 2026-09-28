import {useState, useEffect} from "react"
import api from "../api/client"
import type { Archivo } from "../types/archivo"
import { Link, useNavigate } from "react-router-dom"


function Archivos() {
    const[archivos, setArchivos] = useState<Archivo[]>([])
    const[cargandoLista, setCargandoLista] = useState(true)
    const[errorLista,setErrorLista] = useState<string | null>(null)

    const[archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null)
    const[subiendo, setSubiendo] = useState(false)
    const[errorSubida, setErrorSubida] = useState<string | null>(null)

    const navigate = useNavigate();



    // Función para poder llamarla también después de subir un archivo,
    // así refresco la lista sin tener que recargar la página
    async function cargar_archivos(){
        setCargandoLista(true)
        try {
            const respuesta = await api.get<Archivo[]>("/archivos/")
            setArchivos(respuesta.data)

        } catch {
            setErrorLista("No se puedieron cargar los archivos")
        } finally {
            setCargandoLista(false)
        }
    }
    // ejecuta cargar_archivos cuando se monta el componente Archivos
    // para cargar automáticamente la lista.
    // el [] hace que se ejecute solo una vez y evita que se ejecute en cada render
    // por ejemplo: cambio de estado -> nuevo render -> el useEffect NO vuelve a ejecutarse.
    useEffect(() => {
        cargar_archivos();
    },[])


    // 1 - cojo el archivo seleccionado
    // 2 - compruebo el formato del archivo sea el correcto
    // 3 - si no lo es muestro error y no lo guardo
    // 4 - si es de formato correcto lo guardo en archivoSeleccionado para poder subirlo después
    function manejarCambioArchivo(e: React.ChangeEvent<HTMLInputElement>) {
        // Coge el primer archivo seleccionado por el usuario.
        // files es una lista de archivos y [0] obtiene el primero
        const archivo = e.target.files?.[0]
        if (!archivo) return;
        // Separa el nombre por "." y coge la última parte con pop(), que es la extensión.
        // El ? evita un error si pop() no encuentra ningún elemento.
        const extension = archivo.name.split(".").pop()?.toLocaleLowerCase()
        if(!extension || !["csv","xlsx"].includes(extension)) {
            setErrorSubida("Formato no permitido (solo .csv o .xlsx)")
            setArchivoSeleccionado(null)
            return;
        }
        setErrorSubida(null) // aunque esté inicializado en null si que hay que volver a ponerlo en null por si he solucionado un error anterior
        setArchivoSeleccionado(archivo)
    }



    // 1 - compruebo que haya un archivo seleccionado
    // 2 - lo preparo en un FormData
    // 3 - lo envío al endpoint /archivos/
    // 4 - si se sube correctamente refresco la lista para mostrar el nuevo archivo
    // 5 - mientras se sube controlo el estado subiendo y los posibles errores
    async function manejarEnvioSubida(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if(!archivoSeleccionado) {
            setErrorSubida("Selecciona un archivo primero")
            return;
        }

        setSubiendo(true)
        setErrorSubida(null)

        try {
            const formData = new FormData();
            formData.append("file",archivoSeleccionado)
            await api.post("/archivos/", formData, {
                headers: {"Content-Type": "multipart/form-data"}
            })
            setArchivoSeleccionado(null)
            await cargar_archivos(); // refresca la lista con el nuevo archivo incluido
        } catch {
            setErrorSubida("Error al subir el archivo")
        } finally {
            setSubiendo(false)
        }
    }

    // se encarga de crear un informe a partir de un archivo
    async function manejarCrearInforme(archivoId: number) {
        try {
            const respuesta = await api.post(`/archivos/${archivoId}/informes/`,{})
            navigate(`/archivos/${archivoId}/informes/${respuesta.data.id}/nuevo-grafico`)
        } catch {
            alert("No se pudo crear el informe")
        }
    }


    // se encarga de borrar un archivo, el on delete cascade hará que se borren sus informes,
    // gráficos y columnas, por lo tanto mejor ponerlo con confirmación para evitar que el
    // usuario borre muchos datos que no quería borrar sin querer
    async function manejarBorrarArchivo(archivoId: number) {
        // confirm muestra un popup con "Aceptar/Cancelar" y bloquea la ejecución hasta que el usuario responde
        const confirmado = window.confirm("¿Seguro que quieres Borrar este archivo? También se borraran sus informes y gráficos")
        // si el usuario le da a cancelar no borro el archivo
        if(!confirmado) return;

        try {
            await api.delete(`/archivos/${archivoId}`)
            // refresco la lista para que el archivo borrado desaparezca de la lista
            await cargar_archivos();
        } catch {
            alert("No se pudo eliminar el archivo")
        }
    }

    return (
        <div>
            <form onSubmit={manejarEnvioSubida}>
                <input type="file" onChange={manejarCambioArchivo} />
                {errorSubida && <p style={{color: "red"}}>{errorSubida}</p>}
                <button type="submit" disabled={subiendo}>
                    {subiendo ? "Subiendo..." : "Subir Archivo"}
                </button>
            </form>

            <hr />

            {cargandoLista && <p>Cargando Archivos...</p>}
            {errorLista && <p style={{color:"red"}}>{errorLista}</p>}

            {/* Si no hay errores y la lista está vacía, mostramos un mensaje */}
            {!errorSubida && !errorLista && archivos.length === 0 && (
                <p> Este usuario no ha subido archivos todavía </p>
            )}

            {archivos.map((archivo) => {
                const listoParaUsar = archivo.estado_procesamiento === "completado"
                return (
                    <div key={archivo.id}>
                        <p>
                            {archivo.nombre_archivo} - {archivo.estado_procesamiento}

                            {archivo.estado_procesamiento === "error" && archivo.mensaje_error && (
                                <span style={{color: "red"}}>{" "}({archivo.mensaje_error})</span>
                            )}
                        </p>

                        {listoParaUsar ? (
                            <Link to={`/archivos/${archivo.id}/preview`}>
                                Ver Previsualizacion 
                            </Link>
                        ) : (
                            <span style={{color: "grey"}}>
                                Previsualización no disponible
                            </span>
                        )}

                        {" | "}

                        <button
                            onClick={() => manejarCrearInforme(archivo.id)}
                            disabled={!listoParaUsar}
                        >
                            Crear informe y gráfico
                        </button>

                        {" | "}

                        <button onClick={() => manejarBorrarArchivo(archivo.id)}>
                            Borrar
                        </button>
                    </div>
                );
            })}
        </div>
    )
}

export default Archivos;