import React from "react";

function Sidebar({ setModulo }) {
  return (
    <div className="sidebar">
      
      <h2>Calculadora Financiera</h2>

      <ul>
        {/* Cada <li> cambia el módulo activo en App.jsx */}
        <li onClick={() => setModulo("tasas")}>
          Tasas de Interés
        </li>

        <li onClick={() => setModulo("descuentos")}>
          Descuentos
        </li>

      </ul>

      <p style={{ fontSize: "0.85rem", color: "#777", marginTop: "2rem", padding: "0 1rem" }}>
        Calculadora Financiera
      </p>
    </div>
  );
}

export default Sidebar;