
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";

import type { FiltroRequest } from "../types/grafico";
import type { Columna, Archivo } from "../types/archivo";
import type { GraficoCreadoRequest, GraficoGenerado } from "../types/grafico";
import GraficoPlotly from "../components/GraficoPlotly";
import EditorFiltros from "../components/EditorFiltros";

// la tarta solo tiene sentido si las porciones suman un total (recuento o suma),
// y caja/histograma muestran cómo se reparten los valores, así que solo tienen
// sentido con una operación de distribución. Esto tiene que ir a la par de
// OPERACIONES_PERMITEN_TARTA/OPERACIONES_PERMITEN_DISTRIBUCION en graficos.py del backend
const OPERACIONES_PERMITEN_TARTA = ["recuento", "suma"]
const OPERACIONES_PERMITEN_DISTRIBUCION = ["media", "mediana", "desviacion_estandar", "varianza"]

// 1 - Obtengo archivoId y informeId con useParams
// 2 - Creo estados para guardar columnas (para desplegable de columnas), selecciones, errores, generación y resultado
// 3 - Cargo las columnas del archivo desde la API cuando entro a la página
// 4 - Decido si necesito columna Y (recuento no lo necesita, el resto si)
// 5 - Al enviar el formulario compruebo que se hayan seleccionado columnas válidas
// 6 - Construyo datos con la configuración del gráfico y lo guardo en la variable datos
// 7 - Envío datos al backend mediante POST para generar el gráfico
// 8 - Guardo el resultado que devuelve el backend en resultado
// 9 - Muestro los selectores de X y Y, operación y tipo de gráfico
// 10 - Si hay resultado lo pinto con Plotly
function NuevoGrafico(){

    // 1 y 2
    const {archivoId, informeId} = useParams<{archivoId: string; informeId: string}>();

    const [columnas, setColumnas] = useState<Columna[]>([])
    const [cargandoColumnas, setCargandoColumnas] = useState(true)

    const [columnaX, setColumnaX] = useState<string>("")
    const [columnaY, setColumnaY] = useState<string>("")
    const [operacion, setOperacion] = useState<string>("recuento")
    const [tipoGrafico, setTipoGrafico] = useState<string>("barras")
    const [nombre, setNombre] = useState<string>("")
    const [filtros, setFiltros] = useState<FiltroRequest[]>([])

    const [generando, setGenerando] = useState(false)
    const [error, setError] = useState<string|null>(null)
    const [resultado, setResultado] = useState<GraficoGenerado|null>(null)

    // 3
    // cada vez que cambie de archivoId la función volverá a ejecutarse
    // función para mostrar en el desplegable todas las columnas
    useEffect(() => {
        async function cargarColumnas() {
            try {
                const respuesta = await api.get<Archivo>(`/archivos/${archivoId}`)
                setColumnas(respuesta.data.columnas)
            } catch {
                setError("No se pudieron cargar las columnas del archivo")
            } finally {
                setCargandoColumnas(false)
            }
        }

        if(archivoId) {
            cargarColumnas();
        }
    },[archivoId])

    // 4
    const necesitaColumnaY = operacion !== "recuento"

    // si cambio de operación y el tipo de gráfico que tenía elegido ya no es compatible
    // (por ejemplo tenía tarta y paso a media), vuelvo a barras para no dejar
    // seleccionada una combinación que el backend me rechazaría
    useEffect(() => {
        if(tipoGrafico === "tarta" && !OPERACIONES_PERMITEN_TARTA.includes(operacion)) {
            setTipoGrafico("barras")
        }
        if((tipoGrafico === "caja" || tipoGrafico === "histograma") && !OPERACIONES_PERMITEN_DISTRIBUCION.includes(operacion)) {
            setTipoGrafico("barras")
        }
    },[operacion, tipoGrafico])


    async function manejarSubmit(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        setError(null)

        // 5
        if(!columnaX) {
            setError("Selecciona la columna para el eje X")
            return;
        }
        if (necesitaColumnaY && !columnaY) {
            setError("Selecciona la columna para el eje Y")
            return;
        }

        // 6
        const datos: GraficoCreadoRequest = {
            columna_x_id: Number(columnaX),
            columna_y_id: necesitaColumnaY ? Number(columnaY) : null,
            operacion_agregacion: operacion,
            tipo_grafico: tipoGrafico,
            nombre_grafico: nombre || null,
            filtros: filtros
        }

        // 7
        setGenerando(true);

        try {
            // hace el post del gráfico con datos y lo guarda en respuesta
            const respuesta = await api.post<GraficoGenerado>(`/informes/${informeId}/graficos/`, datos)
            // 8
            setResultado(respuesta.data)
        } catch {
            setError("No se pudo generar el gráfico. Revisa la configuración elegida")
        } finally {
            setGenerando(false)
        }
    }

    if(cargandoColumnas) return <p>Cargando columnas...</p>


    return(
        <div>
            <h2>Configurar gráfico</h2>

            <form onSubmit={manejarSubmit}>
                <label>
                    Columna eje X:
                    <select value={columnaX} onChange={(e) => setColumnaX(e.target.value)}>
                        <option value="">Selecciona...</option>
                        {columnas.map((columna) => (
                            <option key={columna.id} value={columna.id}>
                                {columna.nombre_columna}
                            </option>
                        ))}
                    </select>
                </label>


                <label>
                    Operación
                    <select value={operacion} onChange={(e) => setOperacion(e.target.value)}>
                        <option value="recuento">Recuento</option>
                        <option value="suma">Suma</option>
                        <option value="media">Media</option>
                        <option value="mediana">Mediana</option>
                        <option value="minimo">Mínimo</option>
                        <option value="maximo">Máximo</option>
                        <option value="desviacion_estandar">Desviación estándar</option>
                        <option value="varianza">Varianza</option>
                        <option value="recuento_distintos">Recuento de valores distintos</option>
                    </select>
                </label>


                {/* Solo muestro la selección de la columnaY si la operación lo necesita */}
                {necesitaColumnaY && (
                    <label>
                        Columna eje Y:
                        <select value={columnaY} onChange={(e) => setColumnaY(e.target.value)}>
                            <option value="">Selecciona...</option>
                            {/* recuento_distintos solo cuenta valores diferentes, así que vale
                            cualquier columna, no solo las numéricas */}
                            {columnas
                                .filter((c) => operacion === "recuento_distintos" || c.tipo_dato === "numerico")
                                .map((columna) => (
                                <option key={columna.id} value={columna.id}>
                                    {columna.nombre_columna}
                                </option>
                            ))}
                        </select>
                    </label>
                )}

                <EditorFiltros columnas={columnas} filtros={filtros} onCambioFiltros={setFiltros} />

                <label>
                    Tipo de gráfico:
                    <select value={tipoGrafico} onChange={(e) => setTipoGrafico(e.target.value)}>
                        <option value="barras">Barras</option>
                        <option value="lineas">Líneas</option>
                        {OPERACIONES_PERMITEN_TARTA.includes(operacion) && (
                            <option value="tarta">Tarta</option>
                        )}
                        {OPERACIONES_PERMITEN_DISTRIBUCION.includes(operacion) && (
                            <>
                                <option value="caja">Caja</option>
                                <option value="histograma">Histograma</option>
                            </>
                        )}
                    </select>
                </label>

                <label>
                    Nombre (opcional):
                    <input value={nombre} onChange={(e) => setNombre(e.target.value)}/>
                </label>

                {error && <p style={{color:"red"}}>{error}</p>}

                <button type="submit" disabled={generando}>
                    {generando ? "Generando gráfico" : "Generar gráfico"}
                </button>
            </form>

            {resultado && (
                <div>
                    <h3>{resultado.nombre ?? "resultado"}</h3>
                    <GraficoPlotly especificacion={resultado.especificacion}/>
                </div>
            )}
        </div>
    );
}

export default NuevoGrafico;
