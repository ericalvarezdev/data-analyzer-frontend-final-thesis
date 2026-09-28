import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login"
import Archivos from "./pages/Archivos";
import PreviewArchivoPage from "./pages/PreviewArchivo";
import NuevoGrafico from "./pages/NuevoGrafico";
import Historial from "./pages/Historial";
import Layout from "./components/Layout";
import RutaPrivada from "./components/RutaPrivada";
import NoEncontrado from "./pages/NoEncontrado";
import Registro from "./pages/Registro";
import Perfil from "./pages/Perfil";

function App() {

  return (
    <BrowserRouter>
      <Routes>
      {/* Rutas las cuales no necesito estar logeado con token para acceder */}
        <Route path="/" element={<Login/>} />
        <Route path="/registro" element={<Registro/>} />


        {/*Primero pasa por RutaPrivada donde se comprueba si hay token,
        y si hay token se renderiza todo dentro del Layout*/}
        <Route element={<RutaPrivada/>}>
          {/* Layout es el padre de las rutas que están dentro de el,
            el <Outlet /> crea el hueco donde aparece la ruta hija. */}
          <Route element={<Layout/>}>
            <Route path="/archivos" element={<Archivos/>} />
            <Route path="/archivos/:archivoId/preview" element={<PreviewArchivoPage/>} />
            <Route path="/archivos/:archivoId/informes/:informeId/nuevo-grafico" element={<NuevoGrafico/>} />
            <Route path="/historial" element={<Historial/>} />
            <Route path="/auth/me" element={<Perfil/>} />
          </Route>
        </Route>
        <Route path="*" element={<NoEncontrado/>} />
      </Routes>
    </BrowserRouter>

  );
}

export default App