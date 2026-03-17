import { useState } from "react";

import Sidebar from "./components/Sidebar";
import Tasas from "./pages/Tasas";
import Descuentos from "./pages/Descuentos";

import "./styles/App.css";

function App() {
  const [modulo, setModulo] = useState("tasas");

  return (
    <div className="app">
      <Sidebar setModulo={setModulo} />

      <div className="contenido">
        {modulo === "tasas" && <Tasas />}
        {modulo === "descuentos" && <Descuentos />}

      </div>
    </div>
  );
}

export default App;