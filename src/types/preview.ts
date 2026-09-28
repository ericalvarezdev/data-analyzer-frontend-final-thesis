

// el endpoint GET /archivos/{id}/preview devuelve:
// filas: [...], columnas: [...]
// columnas: que columnas tiene el Excel
// filas: que valores hay en cada columna
export interface PreviewArchivo {
    columnas: string[]

    // el primer valor es el nombre de la columna (siempre string),
    // el segundo valor es el valor de esa fila en esa columna (puede ser string o number)
    // Record sirve para definir un objeto indicando qué tipo tienen sus claves y sus valores
    filas: Record<string,string|number>[]
}

