import type { GraficoGenerado } from './grafico';

export interface InformeResponse {
    id: number
    archivo_id: number
    usuario_id: number
    nombre: string|null
    fecha_creacion: string
    graficos: GraficoGenerado[] // ya viene con la especificacion de plotly calculada, por lo tanto no tengo que recalcular nada
    resumen_ia: string | null // todavia no se habra generado en los informes nuevos
}