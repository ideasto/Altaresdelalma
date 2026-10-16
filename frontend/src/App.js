import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StoreProvider } from "@/store/StoreContext";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Oraculo from "@/pages/Oraculo";
import Timeline from "@/pages/Timeline";
import Galeria from "@/pages/Galeria";
import Cartas from "@/pages/Cartas";
import Libro from "@/pages/Libro";

function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/avatar/:id" element={<Dashboard />} />
            <Route path="/avatar/:id/oraculo" element={<Oraculo />} />
            <Route path="/avatar/:id/linea" element={<Timeline />} />
            <Route path="/avatar/:id/galeria" element={<Galeria />} />
            <Route path="/avatar/:id/cartas" element={<Cartas />} />
            <Route path="/avatar/:id/libro" element={<Libro />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}

export default App;
