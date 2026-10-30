import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { StoreProvider } from "@/store/StoreContext";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Oraculo from "@/pages/Oraculo";
import Timeline from "@/pages/Timeline";
import Galeria from "@/pages/Galeria";
import Cartas from "@/pages/Cartas";
import Libro from "@/pages/Libro";
import Legal from "@/pages/Legal";

function LegacyRedirect() {
  const { id, "*": rest } = useParams();
  return <Navigate to={`/espacio/${id}${rest ? `/${rest}` : ""}`} replace />;
}

function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/espacio/:id" element={<Dashboard />} />
            <Route path="/espacio/:id/oraculo" element={<Oraculo />} />
            <Route path="/espacio/:id/linea" element={<Timeline />} />
            <Route path="/espacio/:id/galeria" element={<Galeria />} />
            <Route path="/espacio/:id/cartas" element={<Cartas />} />
            <Route path="/espacio/:id/libro" element={<Libro />} />
            <Route path="/avatar/:id/*" element={<LegacyRedirect />} />
            <Route path="/terminos" element={<Legal kind="terminos" />} />
            <Route path="/privacidad" element={<Legal kind="privacidad" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}

export default App;
