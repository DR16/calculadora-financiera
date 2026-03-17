import { useState } from "react";
import { Box, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";

import TasasSimple from "./TasasSimple";
import TasasCompuestas from "./TasasCompuestas";

export default function Tasas() {
  const [tipo, setTipo] = useState("simple");

  return (
    <Box sx={{ p: 4, bgcolor: "#ffffff", minHeight: "100vh" }}>
      <Box sx={{ maxWidth: 1000, mx: "auto" }}>
        <Typography variant="h4" 
        align="center" 
        gutterBottom
        sx={{ mb: 4, fontWeight: "bold", color: "#333" }}>
          Tasas de Interés
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
          <ToggleButtonGroup
            color="primary"
            value={tipo}
            exclusive
            onChange={(_, val) => val && setTipo(val)}
          >
            <ToggleButton value="simple">Interés Simple</ToggleButton>
            <ToggleButton value="compuesto">Interés Compuesto</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {tipo === "simple" && <TasasSimple />}
        {tipo === "compuesto" && <TasasCompuestas />}
      </Box>
    </Box>
  );
}