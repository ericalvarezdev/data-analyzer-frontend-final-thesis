

export interface Columna {
    id : number
    nombre_columna: string
    archivo_id: number
    posicion: number
    tipo_dato: string | null
    contador_valores_nulos: number | null
    valor_minimo: string | null
    valor_maximo: string | null
    media: number | null
}


export interface Archivo {
    id: number
    nombre_archivo: string
    tamaño: number
    formato: string
    estado_procesamiento: string
    fecha_subida: string // las fechas llegan como texto en JSON
    mensaje_error: string | null
    numero_filas: number | null
    numero_columnas: number | null
    columnas: Columna[] // lista de columnas
    hoja_seleccionada: string | null
}