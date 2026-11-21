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

    // para el filtro de trimestre: el año y el trimestre (1 = de enero a marzo, 2 = de abril
    // a junio...). El trimestre empieza en 1 porque es un desplegable y así ya tiene un valor
    const[valorAño, setValorAño] = useState("")
    const[valorTrimestre, setValorTrimestre] = useState("1")

    // con que se combina este filtro con el resultado de los filtros anteriores,
    // en el primer filtro de la lista no se usa para nada pero lo mando igual
    const[conector, setConector] = useState("AND")

    // NOT: si está marcado me quedo con las filas que NO cumplen el filtro
    const[negado, setNegado] = useState(false)

    // los filtros de fecha solo tienen sentido en columnas de fechas, así que para esos
    // filtros solo enseño esas columnas (el backend también lo comprueba)
    const esFiltroDeFecha = tipoFiltro.startsWith("fecha_")
    const columnasDisponibles = esFiltroDeFecha ? columnas.filter((c) => c.tipo_dato === "fecha") : columnas

    // al cambiar el tipo de filtro vacío los valores, porque cada tipo usa un input distinto
    // y si no un "2025-03-01" de "Fecha antes de" se quedaría escondido en el input de "Mes"
    // y el backend lo rechazaría. Y si la columna elegida no es de fechas y paso a un filtro
    // de fecha, también la quito: ya no sale en el desplegable pero seguiría elegida
    function manejarCambioTipoFiltro(nuevoTipo: string) {
        setTipoFiltro(nuevoTipo)
        setValorTexto("")
        setValorMin("")
        setValorMax("")
        setValorAño("")
        setValorTrimestre("1")

        const columnaElegida = columnas.find((c) => String(c.id) === columnaId)
        if(nuevoTipo.startsWith("fecha_") && columnaElegida && columnaElegida.tipo_dato !== "fecha") {
            setColumnaId("")
        }
    }

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
        } else if(tipoFiltro === "fecha_antes_de" || tipoFiltro === "fecha_despues_de" || tipoFiltro === "fecha_dia") {
            if(!valorTexto) return;
            // el input type="date" ya devuelve el texto en formato aaaa-mm-dd, que es
            // justo el formato que espera el backend, así que lo mando tal cual
            valores = [valorTexto]
        } else if(tipoFiltro === "fecha_entre") {
            if(!valorMin || !valorMax) return;
            valores = [valorMin, valorMax]
        } else if(tipoFiltro === "fecha_mes") {
            if(!valorTexto) return;
            // el input type="month" devuelve el mes en formato aaaa-mm
            valores = [valorTexto]
        } else if(tipoFiltro === "fecha_trimestre") {
            if(!valorAño) return;
            valores = [Number(valorAño), Number(valorTrimestre)]
        } else if(tipoFiltro === "fecha_ultimos_dias") {
            if(!valorTexto) return;
            valores = [Number(valorTexto)]
        }

        const nuevoFiltro: FiltroRequest = {
            columna_id: Number(columnaId),
            tipo_filtro: tipoFiltro,
            valores: valores,
            conector: conector,
            negado: negado
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
        setValorAño("")
        setValorTrimestre("1")
        setConector("AND")
        setNegado(false)
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

    // tipo del input cuando el filtro solo tiene un valor, así el navegador ya enseña un
    // calendario (date), un selector de mes (month) o solo deja escribir números (number)
    function tipoInputValor(): string | undefined {
        if(tipoFiltro === "fecha_antes_de" || tipoFiltro === "fecha_despues_de" || tipoFiltro === "fecha_dia") return "date"
        if(tipoFiltro === "fecha_mes") return "month"
        if(tipoFiltro === "fecha_ultimos_dias") return "number"
        return undefined
    }

    function placeholderValor(): string {
        if(tipoFiltro === "lista_valores") return "valor 1, valor 2, ..."
        // en Firefox y Safari de ordenador no hay selector de mes y sale un input de texto
        // normal, así que pongo el formato que hay que escribir
        if(tipoFiltro === "fecha_mes") return "aaaa-mm"
        if(tipoFiltro === "fecha_ultimos_dias") return "Número de días"
        return "Valor"
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
                        {filtro.negado && "NO "}
                        {nombreColumna(filtro.columna_id)} - {filtro.tipo_filtro} - [{filtro.valores.join(", ")}]
                    </span>
                    <button type="button" onClick={() => manejarQuitarFiltro(indice)}>
                        Quitar
                    </button>
                </div>
            ))}

            {/* Formulario para añadir un filtro nuevo */}
            <div style={{marginTop:"8px"}}>
                {/* NOT: le da la vuelta a este filtro (por ejemplo NO Ciudad = Barcelona) */}
                <label>
                    <input type="checkbox" checked={negado} onChange={(e) => setNegado(e.target.checked)} />
                    NO
                </label>

                <select value={columnaId} onChange={(e) => setColumnaId(e.target.value)}>
                    <option value="">Columna...</option>
                    {columnasDisponibles.map((columna) => (
                        <option key={columna.id} value={columna.id}>
                            {columna.nombre_columna}
                        </option>
                    ))}
                </select>

                <select value={tipoFiltro} onChange={(e) => manejarCambioTipoFiltro(e.target.value)}>
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
                    <option value="fecha_dia">Día concreto</option>
                    <option value="fecha_mes">Mes</option>
                    <option value="fecha_trimestre">Trimestre</option>
                    <option value="fecha_ultimos_dias">Últimos X días</option>
                </select>

                {/* Muestro inputs distintos según el tipo de filtro elegido.
                    fecha_entre es como el rango pero con dos fechas en vez de dos números,
                    y el trimestre necesita el año y cuál de los 4 trimestres */}
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
                ) : tipoFiltro === "fecha_trimestre" ? (
                    <>
                        <input
                            type="number"
                            placeholder="Año"
                            value={valorAño}
                            onChange={(e) => setValorAño(e.target.value)}
                        />
                        <select value={valorTrimestre} onChange={(e) => setValorTrimestre(e.target.value)}>
                            <option value="1">T1 (enero - marzo)</option>
                            <option value="2">T2 (abril - junio)</option>
                            <option value="3">T3 (julio - septiembre)</option>
                            <option value="4">T4 (octubre - diciembre)</option>
                        </select>
                    </>
                ) : (
                    <input
                        type={tipoInputValor()}
                        placeholder={placeholderValor()}
                        value={valorTexto}
                        onChange={(e) => setValorTexto(e.target.value)}
                    />
                )}

                {/* los últimos días se cuentan desde la última fecha del archivo, no desde hoy */}
                {tipoFiltro === "fecha_ultimos_dias" && <span> (desde la última fecha del archivo)</span>}

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