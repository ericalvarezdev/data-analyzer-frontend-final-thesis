
export interface FiltroRequest {
    columna_id: number
    tipo_filtro: string
    valores: (string|number)[]
    conector: string // AND u OR, en el primer filtro de la lista no se usa para nada
}

// lo que mando al backend para que cree el gráfico
export interface GraficoCreadoRequest{
    columna_x_id: number
    columna_y_id: number | null
    operacion_agregacion: string
    tipo_grafico: string
    nombre_grafico: string | null
    filtros: FiltroRequest[]
}

// esto es tal cual lo que Plotly necesita para dibujar (data + layout), el backend ya lo
// calcula entero en services/graficos.py así que aquí no tiparé cada propiedad por separado
export interface EspecificacionGrafico {
    data: any[]
    layout: any
}

// lo que el backend me devuelve al crear el gráfico
export interface GraficoGenerado {
    id: number
    informe_id: number
    nombre: string
    tipo_grafico: string
    operacion_agregacion: string
    especificacion: EspecificacionGrafico
}
