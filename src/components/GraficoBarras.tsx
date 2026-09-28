

interface GraficoBarrasProps {
    etiquetas: string[]
    valores: number[]
}


function GraficoBarras({etiquetas,valores} : GraficoBarrasProps) {

    // Para esta iteración dibujaré las barras de manera sencilla sin librería
    // calcularé el valor máximo y daré una barra con un ancho proporcional a ese máximo
    // Si hay resultado, busco el valor máximo de la lista
    // con ... separo los valores del array
    // Si no hay resultado, devuelvo 0
    const valorMaximo = valores.length > 0 ? Math.max(...valores) : 0

    return (
        <div>
            {etiquetas.map((etiqueta,i) => (
                <div key={etiqueta} style={{marginBottom: "4px"}}>
                    <span>{etiqueta}: {valores[i]}</span>
                    <div
                        style={{
                            height: "16px",
                            width: `${(valores[i]/valorMaximo*100)}%`,
                            backgroundColor: "steelblue",
                        }}
                    />
                </div>
            ))}
        </div>
    );
}

export default GraficoBarras;