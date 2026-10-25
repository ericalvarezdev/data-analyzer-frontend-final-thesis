import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
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

            {/* Antes aquí también pintaba los gráficos de cada informe, pero con varios
            informes grandes la página se quedaba enorme, así que ahora esto es solo la
            lista y cada informe tiene su propia página en DetalleInforme */}
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
                    <p>Creado: {new Date(informe.fecha_creacion).toLocaleString()}</p>
                    <p>{informe.graficos.length} gráfico(s)</p>

                    <Link to={`/informes/${informe.id}`}>
                        Ver informe
                    </Link>
                    {" | "}
                    <button onClick={() => manejarBorrarInforme(informe.id)}>
                        Borrar informe
                    </button>
                </div>
            ))}
        </div>
    );
}


export default Historial;
