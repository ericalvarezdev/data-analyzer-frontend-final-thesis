import type { GraficoGenerado } from './grafico';

export interface InformeResponse {
    id: number
    archivo_id: number
    usuario_id: number
    nombre: string|null
    fecha_creacion: string
    graficos: GraficoGenerado[] // ya viene con etiquetas y valores calculados, por lo tanto no tengo que recalcular nada

}