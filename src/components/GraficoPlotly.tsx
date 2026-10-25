import Plot from "react-plotly.js";
import type { EspecificacionGrafico } from "../types/grafico";


interface GraficoPlotlyProps {
    especificacion: EspecificacionGrafico
}

// El backend ya me manda el gráfico calculado entero (data + layout de Plotly),
// este componente solo se lo pasa a la librería tal cual para que lo dibuje.
// Antes tenía GraficoBarras que las dibujaba a mano, pero con tarta/caja/histograma
// ya no me vale, necesito una librería de gráficos de verdad
function GraficoPlotly({especificacion} : GraficoPlotlyProps) {

    return (
        <Plot
            data={especificacion.data}
            layout={{...especificacion.layout, autosize: true}}
            style={{width: "100%", height: "400px"}}
            useResizeHandler
        />
    );
}

export default GraficoPlotly;
