import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/client";
import type { InformeResponse } from "../types/informes";
import GraficoPlotly from "../components/GraficoPlotly";


// 1 - Leo el informeId de la URL
// 2 - Cargo el informe (ya viene con los gráficos calculados) al entrar a la página
// 3 - Pinto cada gráfico con GraficoPlotly, con sus filtros debajo del título
// 4 - Botón para añadir más gráficos al informe, descargar el informe entero en PDF
//     y generar (o regenerar) el resumen en lenguaje natural con IA
// 5 - Botón para borrar cada gráfico, por si alguno se ha creado mal
function DetalleInforme(){

    const {informeId} = useParams<{informeId: string}>()
    const navigate = useNavigate();

    const[informe, setInforme] = useState<InformeResponse|null>(null)
    const[cargando, setCargando] = useState(true)
    const[error, setError] = useState<string|null>(null)
    const[generandoResumen, setGenerandoResumen] = useState(false)

    useEffect(() => {
        async function cargarInforme(){
            try {
                const respuesta = await api.get<InformeResponse>(`/informes/${informeId}`)
                setInforme(respuesta.data)
            } catch {
                setError("No se pudo cargar el informe")
            } finally {
                setCargando(false)
            }
        }

        if(informeId) {
            cargarInforme();
        }
    },[informeId])

    async function manejarDescargarPdf() {
        try {
            // responseType blob porque la respuesta no es JSON, es el PDF en bruto
            const respuesta = await api.get(`/informes/${informeId}/pdf`, {responseType: "blob"})

            // creo una url temporal para el blob del pdf y simulo un click en un
            // link para que el navegador lo descargue como archivo, sin esto
            // el navegador no sabe que tiene que guardar la respuesta como fichero
            const url = window.URL.createObjectURL(new Blob([respuesta.data]))
            const link = document.createElement("a")
            link.href = url
            link.download = `${informe?.nombre ?? "informe"}.pdf`
            link.click()
            window.URL.revokeObjectURL(url)
        } catch {
            alert("No se pudo descargar el PDF")
        }
    }

    // el backend genera el resumen, lo guarda y devuelve el informe entero ya
    // actualizado, así que solo tengo que reemplazar el informe que tenía por este
    async function manejarGenerarResumen() {
        setGenerandoResumen(true)

        try {
            const respuesta = await api.post<InformeResponse>(`/informes/${informeId}/resumen`)
            setInforme(respuesta.data)
        } catch {
            alert("No se pudo generar el resumen con IA")
        } finally {
            setGenerandoResumen(false)
        }
    }

    // borra un gráfico del informe. Pido confirmación porque no se puede deshacer, y si el
    // backend lo borra bien lo quito también de los gráficos que ya tengo cargados, así no
    // hace falta volver a pedir el informe entero
    async function manejarBorrarGrafico(graficoId: number) {
        const confirmado = window.confirm("¿Seguro que quieres borrar este gráfico?")

        if(!confirmado) return;

        try {
            await api.delete(`/informes/${informeId}/graficos/${graficoId}`)
            setInforme((actual) => actual && {
                ...actual,
                graficos: actual.graficos.filter((g) => g.id !== graficoId)
            })
        } catch {
            alert("No se pudo borrar el gráfico")
        }
    }

    if(cargando) return <p>Cargando informe...</p>
    if(error) return <p style={{color:"red"}}>{error}</p>
    if(!informe) return null

    return(
        <div>
            <h2>{informe.nombre ?? `Informe #${informe.id}`}</h2>
            <p>Creado: {new Date(informe.fecha_creacion).toLocaleString()}</p>

            <Link to={`/archivos/${informe.archivo_id}/informes/${informe.id}/nuevo-grafico`}>
                Añadir más gráficos al informe
            </Link>
            {" | "}
            <button onClick={manejarDescargarPdf} disabled={informe.graficos.length === 0}>
                Descargar PDF
            </button>
            {" | "}
            <button onClick={manejarGenerarResumen} disabled={informe.graficos.length === 0 || generandoResumen}>
                {generandoResumen ? "Generando..." : informe.resumen_ia ? "Regenerar resumen con IA" : "Generar resumen con IA"}
            </button>

            {informe.resumen_ia && (
                <p style={{border:"1px solid #999", padding:"8px", marginTop:"8px"}}>
                    {informe.resumen_ia}
                </p>
            )}

            {informe.graficos.length === 0 ? (
                <p>Este informe todavía no tiene gráficos</p>
            ):(
                informe.graficos.map((grafico) => (
                    <div key={grafico.id} style={{marginTop: "8px"}}>
                        <h4>{grafico.nombre ?? `Grafico #${grafico.id}`}</h4>
                        {/* los filtros que se aplicaron, con el mismo texto que sale en el PDF */}
                        {grafico.filtros_texto && (
                            <p style={{color:"#666", fontSize:"14px", margin:"4px 0"}}>
                                Filtros: {grafico.filtros_texto}
                            </p>
                        )}
                        <button onClick={() => manejarBorrarGrafico(grafico.id)}>Borrar gráfico</button>
                        <GraficoPlotly especificacion={grafico.especificacion}/>
                    </div>
                ))
            )}

            <button onClick={() => navigate("/historial")}>Volver</button>
        </div>
    );
}

export default DetalleInforme;