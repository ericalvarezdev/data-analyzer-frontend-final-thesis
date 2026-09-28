
export interface FiltroRequest {
    columna_id: number
    tipo_filtro: string
    valores: (string|number)[]
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

// lo que el backend me devuelve al crear el gráfico
export interface GraficoGenerado {
    id: number
    informe_id: number
    nombre: string
    tipo_grafico: string
    operacion_agregacion: string
    etiquetas: string[]
    valores: number[]
}