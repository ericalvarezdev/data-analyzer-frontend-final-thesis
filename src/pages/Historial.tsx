import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import GraficoBarras from "../components/GraficoBarras";
import type { InformeResponse } from "../types/informes";


function Historial() {
    const[informes, setInformes] = useState<InformeResponse[]>([])
    const[cargando, setCargando] = useState(true)
    const[error, setError] = useState<string | null>(null)
    const[informeEditandoId, setInformeEditandoId] = useState<number|null>(null)
    const[nombreEditado, setNombreEditado] = useState("")


    function empezarAEditar(informe: InformeResponse) {
        setInformeEditandoId(informe.id)
        setNombreEditado(informe.nombre ?? "")
    }

    async function guardarNombre(informeId: number) {
        try {
            await api.patch(`/informes/${informeId}`, {nombre: nombreEditado})
            setInformes((actuales) =>
                actuales.map((i) => (i.id === informeId ? {...i, nombre: nombreEditado} : i))
            )
            setInformeEditandoId(null)
        } catch {
            alert("No se pudo renombrar el informe")
        }
    }
    useEffect(() => {
        async function cargarInfomes(){
            try {
                // Endpoint que devuelve todos los informes del usuario loggeado
                const respuesta = await api.get("/informes/")
                setInformes(respuesta.data)
            } catch {
                setError("No se pudo cargar el historial")
            } finally {
                setCargando(false)
            }
        }
        cargarInfomes();
    },[]);
    

    async function manejarBorrarInforme(informeId: number) {
        const confirmado = window.confirm("¿Seguro que quieres borrar este informe? Se borrarán también todos sus gráficos. El archivo original no se verá afectado")

        if(!confirmado) return;

        try {
            await api.delete(`/informes/${informeId}`)
            // recargo la lista de informes excluyendo el informe borrado
            setInformes((actuales) => actuales.filter((i) => i.id !== informeId))
        } catch {
            alert("No se pudo borrar el informe")
        }
    }




    if(cargando) return <p>Cargando historial...</p>
    if(error) return <p style={{color: "red"}}>{error}</p>
    if(informes.length === 0) return <p>Todavía no has generado ningún informe</p>

    return(
        <div>
            <h2>Historial de informes</h2>

            {informes.map((informe) => (
                <div key={informe.id} style={{border: "1px solid #ccc", padding: "12px", marginBottom: "16px"}}>
                   {informeEditandoId === informe.id ? (
                        <div>
                            <input value={nombreEditado} onChange={(e) => setNombreEditado(e.target.value)} />
                            <button onClick={() => guardarNombre(informe.id)}>Guardar</button>
                            <button onClick={() => setInformeEditandoId(null)}>Cancelar</button>
                        </div>
                    ):(
                        <h3>
                            {informe.nombre ?? `Informe #${informe.id}`}
                            {" "}
                            <button onClick={() => empezarAEditar(informe)}>Renombrar</button>
                        </h3>
                    )}
                    <Link to={`/archivos/${informe.archivo_id}/informes/${informe.id}/nuevo-grafico`}>
                        Añadir más gráficos al informe
                    </Link>
                    {" | "}
                    <button onClick={() => manejarBorrarInforme(informe.id)}>
                        Borrar informe
                    </button>
                    <p>Creado: {new Date(informe.fecha_creacion).toLocaleString()}</p>

                    {informe.graficos.length === 0 ? (<p>Este informe todavía no tiene gráficos</p>):
                    (
                        informe.graficos.map((grafico) =>(
                            <div key={grafico.id} style={{marginTop: "8px"}}>
                                <h4>{grafico.nombre ?? `Grafico #${grafico.id}`}</h4>
                                <GraficoBarras etiquetas={grafico.etiquetas} valores={grafico.valores}/>
                            </div>
                        ))
                    )}
                </div>
            ))}
        </div>
    );
}


export default Historial;