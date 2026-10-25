import { useState } from "react";
import type { Columna } from "../types/archivo";
import type { FiltroRequest } from "../types/grafico";


interface EditorFiltroProps{
    columnas: Columna[]
    filtros: FiltroRequest[]

    // El hijo (EditorFiltros) calcula la nueva lista de filtros y se la pasa
    // al padre (NuevoGrafico), que es quien guarda y actualiza ese estado
    onCambioFiltros: (nuevosFiltros: FiltroRequest[]) => void;
}


// 1 - Recibo del padre las columnas, los filtros actuales y una función para modificarlos
// 2 - Guardo en estados propios lo que el usuario esta escribiendo en el formulario
// 3 - Al pulsar añadir filtro, recojo esos datos y creo un nuevo filtro
// 4 - Añado el nuevo elemento filtro a la lista y se lo devuelvo al padre con onCambioFiltros
// 5 - Al pulsar "Quitar", elimino ese filtro y también devuelvo la lista al padre
// 6 - Muestro los filtros actuales y el formulario para añadir nuevos
// 7 - Limpio el formulario después de añadir un filtro
function EditorFiltros({columnas, filtros, onCambioFiltros} : EditorFiltroProps) {

    // Estos 3 estados son solo para el formulario de "añadir un filtro nuevo"
    // no para la lista final con todos los filtros, (esa vive en el padre via props)
    const[columnaId, setColumnaId] = useState("")
    const[tipoFiltro, setTipoFiltro] = useState("valor_exacto") // pongo un valor porque es un select desplegable con opciones fijas, queda mejor que desde el principio ya tenga un valor
    const[valorTexto, setValorTexto] = useState("")

    const[valorMin, setValorMin] = useState("")
    const[valorMax, setValorMax] = useState("")

    // con que se combina este filtro con el resultado de los filtros anteriores,
    // en el primer filtro de la lista no se usa para nada pero lo mando igual
    const[conector, setConector] = useState("AND")

    function manejarAñadirFiltro() {
        if(!columnaId) return;

        // array vacío que puede contener string o number
        let valores: (string|number)[] = []

        if(tipoFiltro === "valor_exacto" || tipoFiltro === "diferente_de" || tipoFiltro === "contiene_texto") {
            if(!valorTexto) return;
            // solo es un valor
            valores = [valorTexto]
        } else if(tipoFiltro === "mayor_que" || tipoFiltro === "menor_que") {
            if(!valorTexto) return;
            // igual que en rango, mayor que/menor que siempre comparan con un número
            valores = [Number(valorTexto)]
        } else if(tipoFiltro === "rango") {
            if(!valorMin || !valorMax) return;
            // convierto los valores del rango a números antes de
            // enviarlos al backend (rango siempre usa números)
            valores = [Number(valorMin), Number(valorMax)]
        } else if(tipoFiltro === "lista_valores") {
            if(!valorTexto) return;
            // split(",") separa el texto usando las comas.
            // map(trim) quita los espacios sobrantes de cada valor.
            // filter() elimina los valores que estén vacíos.
            valores = valorTexto.split(",").map((v) => v.trim()).filter((v) => v !== "")
        } else if(tipoFiltro === "fecha_antes_de" || tipoFiltro === "fecha_despues_de") {
            if(!valorTexto) return;
            // el input type="date" ya devuelve el texto en formato aaaa-mm-dd, y eso
            // ya lo entiende el pd.to_datetime del backend, así que lo mando tal cual
            valores = [valorTexto]
        } else if(tipoFiltro === "fecha_entre") {
            if(!valorMin || !valorMax) return;
            valores = [valorMin, valorMax]
        }

        const nuevoFiltro: FiltroRequest = {
            columna_id: Number(columnaId),
            tipo_filtro: tipoFiltro,
            valores: valores,
            conector: conector
        }

        // con ...filtros copio los filtros que ya estaban creados anteriormente
        // y agrego nuevoFiltro y luego se lo envio al padre (nuevoGrafico) para
        // que tenga la lista completa de filtros
        onCambioFiltros([...filtros, nuevoFiltro])

        // Limpio el mini formulario para el siguiente filtro
        setColumnaId("")
        setValorTexto("")
        setValorMax("")
        setValorMin("")
        setConector("AND")
    }

    function manejarQuitarFiltro(indice: number) {
        // cojo todos los filtros excepto el filtro que está en la posición
        // índice y se los paso al padre, de esta manera elimino el filtro
        // de la posición indice
        onCambioFiltros(filtros.filter((_, i) => i !== indice))
    }

    // función que devuelve el nombre de la columna por la id
    function nombreColumna(id: number): string {
        // si la columna tiene nombre devuelve el nombre
        // si la columna no tiene nombre devuelve Columna y su id
        return columnas.find((c) => c.id === id)?.nombre_columna ?? `Columna ${id}`;
    }

    return (
        <div style={{border:"1px dashed #999", padding:"8px", marginTop:"8px"}}>
            <h4>Filtros</h4>

            {/* Lista de filtros ya añadidos y el botón de quitar un filtro*/}
            {filtros.length === 0 && <p>Sin filtros (se usarán todos los datos)</p>}
            {filtros.map((filtro, indice) => (
                <div key={indice}>
                    <span>
                        {/* el conector del primer filtro no se usa para nada, así que no lo muestro */}
                        {indice > 0 && (filtro.conector === "OR" ? "O " : "Y ")}
                        {nombreColumna(filtro.columna_id)} - {filtro.tipo_filtro} - [{filtro.valores.join(", ")}]
                    </span>
                    <button type="button" onClick={() => manejarQuitarFiltro(indice)}>
                        Quitar
                    </button>
                </div>
            ))}

            {/* Formulario para añadir un filtro nuevo */}
            <div style={{marginTop:"8px"}}>
                <select value={columnaId} onChange={(e) => setColumnaId(e.target.value)}>
                    <option value="">Columna...</option>
                    {columnas.map((columna) => (
                        <option key={columna.id} value={columna.id}>
                            {columna.nombre_columna}
                        </option>
                    ))}
                </select>

                <select value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)}>
                    <option value="valor_exacto">Valor exacto</option>
                    <option value="diferente_de">Diferente de</option>
                    <option value="rango">Rango</option>
                    <option value="mayor_que">Mayor que</option>
                    <option value="menor_que">Menor que</option>
                    <option value="lista_valores">lista_valores</option>
                    <option value="contiene_texto">Contiene texto</option>
                    <option value="fecha_antes_de">Fecha antes de</option>
                    <option value="fecha_despues_de">Fecha después de</option>
                    <option value="fecha_entre">Fecha entre</option>
                </select>

                {/* Muestro inputs distintos según el tipo de filtro elegido.
                    fecha_entre es como el rango pero con dos fechas en vez de dos números */}
                {tipoFiltro === "rango" || tipoFiltro === "fecha_entre" ? (
                    <>
                        <input
                            type={tipoFiltro === "fecha_entre" ? "date" : undefined}
                            placeholder="Mínimo"
                            value={valorMin}
                            onChange={(e) => setValorMin(e.target.value)}
                        />
                        <input
                            type={tipoFiltro === "fecha_entre" ? "date" : undefined}
                            placeholder="Máximo"
                            value={valorMax}
                            onChange={(e) => setValorMax(e.target.value)}
                        />
                    </>
                ) : (
                    <input
                        type={(tipoFiltro === "fecha_antes_de" || tipoFiltro === "fecha_despues_de") ? "date" : undefined}
                        placeholder={tipoFiltro === "lista_valores" ? "valor 1, valor 2, ..." : "Valor"}
                        value={valorTexto}
                        onChange={(e) => setValorTexto(e.target.value)}
                    />
                )}

                {/* con qué se junta este filtro con los filtros anteriores, en el primero da igual */}
                <select value={conector} onChange={(e) => setConector(e.target.value)}>
                    <option value="AND">Y</option>
                    <option value="OR">O</option>
                </select>

                <button type="button" onClick={manejarAñadirFiltro}>
                    Añadir Filtro
                </button>
            </div>
        </div>
    );
}

export default EditorFiltros;