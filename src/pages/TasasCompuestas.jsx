import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  InputAdornment,
} from "@mui/material";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import PercentIcon from "@mui/icons-material/Percent";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalculateIcon from "@mui/icons-material/Calculate";
import ClearIcon from "@mui/icons-material/Clear";

export default function TasasCompuestas() {
  const [modo, setModo] = useState("completos");
  const [calcularPara, setCalcularPara] = useState("F");
  const [P, setP] = useState("");
  const [F, setF] = useState("");
  const [tasa, setTasa] = useState("");
  const [esAnual, setEsAnual] = useState(true);
  const [tiempo, setTiempo] = useState("");
  const [frecuencia, setFrecuencia] = useState("mensual");
  const [resultado, setResultado] = useState(null);
  const [formula, setFormula] = useState(""); // ← para ver la formula utilizada
  const [error, setError] = useState("");

  const getPeriodosPorAnio = () => {
    const mapa = {
      diario: 365,
      semanal: 52,
      mensual: 12,
      bimestral: 6,
      trimestral: 4,
      cuatrimestral: 3,
      semestral: 2,
      anual: 1,
    };
    return mapa[frecuencia] || 12;
  };

  const getCamposHabilitados = () => {
    if (modo === "completos") return ["P", "tasa", "tiempo"];

    switch (calcularPara) {
      case "F": return ["P", "tasa", "tiempo"];
      case "P": return ["F", "tasa", "tiempo"];
      case "i": return ["P", "F", "tiempo"];
      case "n": return ["P", "F", "tasa"];
      default: return [];
    }
  };

  const camposHabilitados = getCamposHabilitados();

  // Limpiar al cambiar modo
  const handleModoChange = (_, val) => {
    if (val) {
      setModo(val);
      setP("");
      setF("");
      setTasa("");
      setTiempo("");
      setResultado(null);
      setFormula("");
      setError("");
    }
  };

  const limpiar = () => {
    setP("");
    setF("");
    setTasa("");
    setTiempo("");
    setResultado(null);
    setFormula("");
    setError("");
  };

  const validarEntradas = () => {
    const capital = parseFloat(P);
    const futuro = parseFloat(F);
    const tasaNum = parseFloat(tasa);
    const t = parseFloat(tiempo);

    if (modo === "completos") {
      if (!P || !tasa || !tiempo) return "Faltan capital, tasa y tiempo";
    } else {
      switch (calcularPara) {
        case "F": if (!P || !tasa || !tiempo) return "Faltan capital, tasa y tiempo"; break;
        case "P": if (!F || !tasa || !tiempo) return "Faltan valor futuro, tasa y tiempo"; break;
        case "i": if (!P || !F || !tiempo) return "Faltan capital, valor futuro y tiempo"; break;
        case "n": if (!P || !F || !tasa) return "Faltan capital, valor futuro y tasa"; break;
      }
    }

    if (capital <= 0 && P) return "Capital > 0";
    if (futuro <= 0 && (calcularPara === "P" || calcularPara === "i" || calcularPara === "n") && F) return "Valor futuro > 0";
    if (tasaNum <= 0 && tasa) return "Tasa > 0";
    if (t <= 0 && calcularPara !== "i" && calcularPara !== "n" && tiempo) return "Tiempo > 0";

    return "";
  };

  const calcular = () => {
    setError("");
    setResultado(null);
    setFormula("");

    const errorMsg = validarEntradas();
    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    const m = getPeriodosPorAnio();
    const capital = parseFloat(P) || 0;
    const futuro = parseFloat(F) || 0;
    const tasaNum = parseFloat(tasa) / 100;
    const t = parseFloat(tiempo) || 0;

    const i = esAnual ? tasaNum / m : tasaNum;
    const periodos = esAnual ? t * m : t;

    let res = null;
    let formulaText = "";

    if (modo === "completos") {
      res = capital * Math.pow(1 + i, periodos);
      formulaText = `F = P × (1 + i)^n   donde n = ${periodos.toFixed(2)} períodos`;
    } else {
      switch (calcularPara) {
        case "F":
          res = capital * Math.pow(1 + i, periodos);
          formulaText = `F = P × (1 + i)^n   donde n = ${periodos.toFixed(2)} períodos`;
          break;
        case "P":
          res = futuro / Math.pow(1 + i, periodos);
          formulaText = `P = F / (1 + i)^n   donde n = ${periodos.toFixed(2)} períodos`;
          break;
        case "i":
          res = (Math.pow(futuro / capital, 1 / periodos) - 1) * 100;
          formulaText = `i = (F / P)^(1/n) - 1   × 100%`;
          break;
        case "n":
          res = Math.log(futuro / capital) / Math.log(1 + i);
          formulaText = `n = log(F / P) / log(1 + i)`;
          break;
      }
    }

    setResultado(res);
    setFormula(formulaText);
  };

  return (
    <Box sx={{ p: 3, bgcolor: "white", borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Interés Compuesto
      </Typography>

      <ToggleButtonGroup
        color="primary"
        value={modo}
        exclusive
        onChange={handleModoChange}
        fullWidth
        sx={{ mb: 3 }}
      >
        <ToggleButton value="completos">Valores Completos</ToggleButton>
        <ToggleButton value="conocer">Conocer valor</ToggleButton>
      </ToggleButtonGroup>

      {modo === "conocer" && (
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Calcular</InputLabel>
          <Select value={calcularPara} label="Calcular" onChange={(e) => setCalcularPara(e.target.value)}>
            <MenuItem value="F">Valor futuro (F)</MenuItem>
            <MenuItem value="P">Valor presente (P)</MenuItem>
            <MenuItem value="i">Tasa (%)</MenuItem>
            <MenuItem value="n">Períodos</MenuItem>
          </Select>
        </FormControl>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Capital inicial (P)"
            type="number"
            value={P}
            onChange={(e) => setP(e.target.value)}
            disabled={!camposHabilitados.includes("P")}
            InputProps={{ startAdornment: <InputAdornment position="start"><MonetizationOnIcon /></InputAdornment> }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Valor futuro (F)"
            type="number"
            value={F}
            onChange={(e) => setF(e.target.value)}
            disabled={!camposHabilitados.includes("F")}
            InputProps={{ startAdornment: <InputAdornment position="start"><MonetizationOnIcon color="success" /></InputAdornment> }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={esAnual ? "Tasa nominal anual (%)" : "Tasa por período (%)"}
            type="number"
            value={tasa}
            onChange={(e) => setTasa(e.target.value)}
            disabled={!camposHabilitados.includes("tasa")}
            InputProps={{ startAdornment: <InputAdornment position="start"><PercentIcon /></InputAdornment> }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={esAnual && calcularPara === "i" ? "Tiempo (años)" : "Años"}
            type="number"
            value={tiempo}
            onChange={(e) => setTiempo(e.target.value)}
            disabled={!camposHabilitados.includes("tiempo")}
            InputProps={{ startAdornment: <InputAdornment position="start"><AccessTimeIcon /></InputAdornment> }}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Frecuencia</InputLabel>
            <Select value={frecuencia} label="Frecuencia" onChange={(e) => setFrecuencia(e.target.value)}>
              <MenuItem value="diario">Diario (365)</MenuItem>
              <MenuItem value="semanal">Semanal (52)</MenuItem>
              <MenuItem value="mensual">Mensual (12)</MenuItem>
              <MenuItem value="bimestral">Bimestral (6)</MenuItem>
              <MenuItem value="trimestral">Trimestral (4)</MenuItem>
              <MenuItem value="cuatrimestral">Cuatrimestral (3)</MenuItem>
              <MenuItem value="semestral">Semestral (2)</MenuItem>
              <MenuItem value="anual">Anual (1)</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <ToggleButtonGroup
            size="small"
            value={esAnual ? "anual" : "periodo"}
            exclusive
            onChange={(_, val) => val && setEsAnual(val === "anual")}
            fullWidth
          >
            <ToggleButton value="anual">Nominal anual</ToggleButton>
            <ToggleButton value="periodo">Por período</ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
        <Button variant="contained" startIcon={<CalculateIcon />} onClick={calcular}>Calcular</Button>
        <Button variant="outlined" color="error" startIcon={<ClearIcon />} onClick={limpiar}>Limpiar</Button>
      </Box>

      {resultado !== null && (
        <Box sx={{ mt: 4, p: 3, bgcolor: "#646464", borderRadius: 2, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            {modo === "completos" 
              ? "Valor futuro: " 
              : calcularPara === "i" 
                ? "Tasa (%): " 
                : calcularPara === "n" 
                  ? "Períodos: " 
                  : `${calcularPara.toUpperCase()}: `}
            {calcularPara === "i" 
              ? `${resultado.toFixed(4)}%` 
              : calcularPara === "n" 
                ? resultado.toFixed(2) 
                : `$${resultado.toLocaleString("es-SV", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </Typography>

          {formula && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Fórmula utilizada: {formula}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}