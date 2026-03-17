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

export default function TasasSimple() {
  const [modo, setModo] = useState("completos");
  const [calcularPara, setCalcularPara] = useState("F");
  const [P, setP] = useState("");
  const [F, setF] = useState("");
  const [tasa, setTasa] = useState("");
  const [esAnual, setEsAnual] = useState(true);
  const [n, setN] = useState("");
  const [frecuencia, setFrecuencia] = useState("mensual");
  const [resultado, setResultado] = useState(null);
  const [formula, setFormula] = useState(""); // ← para mostrar la formula utilizada
  const [error, setError] = useState("");

  // Frecuencia completa
  const getPeriodosPorAnio = () => {
    const mapa = {
      diario: 365,
      semanal: 52,
      mensual: 12,
      trimestral: 4,
      cuatrimestral: 3,
      bimestral: 6,
      semestral: 2,
      anual: 1,
    };
    return mapa[frecuencia] || 12;
  };

  const getCamposHabilitados = () => {
    if (modo === "completos") return ["P", "tasa", "n"];

    switch (calcularPara) {
      case "F":
      case "I": return ["P", "tasa", "n"];
      case "P": return ["F", "tasa", "n"];
      case "periodos": return ["P", "F", "tasa"];
      case "i": return ["P", "F", "n"];
      default: return [];
    }
  };

  const camposHabilitados = getCamposHabilitados();

  const limpiar = () => {
    setP("");
    setF("");
    setTasa("");
    setN("");
    setResultado(null);
    setFormula("");
    setError("");
  };

  const validarEntradas = () => {
    const capital = parseFloat(P);
    const futuro = parseFloat(F);
    const tasaNum = parseFloat(tasa);
    const periodos = parseFloat(n);

    if (modo === "completos") {
      if (!P || !tasa || !n) return "Faltan capital, tasa y períodos";
    } else {
      switch (calcularPara) {
        case "F":
        case "I": if (!P || !tasa || !n) return "Faltan capital, tasa y períodos"; break;
        case "P": if (!F || !tasa || !n) return "Faltan valor futuro, tasa y períodos"; break;
        case "periodos": if (!P || !F || !tasa) return "Faltan capital, valor futuro y tasa"; break;
        case "i": if (!P || !F || !n) return "Faltan capital, valor futuro y períodos"; break;
      }
    }

    if (capital <= 0) return "Capital > 0";
    if (futuro <= 0 && (calcularPara === "P" || calcularPara === "periodos" || calcularPara === "i")) return "Valor futuro > 0";
    if (tasaNum <= 0) return "Tasa > 0";
    if (periodos <= 0 && calcularPara !== "i") return "Períodos > 0";

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

    const periodosAnio = getPeriodosPorAnio();
    const capital = parseFloat(P) || 0;
    const futuro = parseFloat(F) || 0;
    const tasaNum = parseFloat(tasa) / 100;
    let periodos = parseFloat(n) || 0;

    const i = esAnual ? tasaNum / periodosAnio : tasaNum;

    let res = null;
    let formulaText = "";

    if (modo === "completos") {
      res = capital * (1 + i * periodos);
      formulaText = `F = P × (1 + i × n)   donde n = ${periodos}`;
    } else {
      switch (calcularPara) {
        case "F":
          res = capital * (1 + i * periodos);
          formulaText = `F = P × (1 + i × n)   donde n = ${periodos}`;
          break;
        case "P":
          res = futuro / (1 + i * periodos);
          formulaText = `P = F / (1 + i × n)   donde n = ${periodos}`;
          break;
        case "I":
          res = capital * i * periodos;
          formulaText = `I = P × i × n   donde n = ${periodos}`;
          break;
        case "periodos":
          res = (futuro / capital - 1) / i;
          formulaText = `n = (F / P - 1) / i`;
          break;
        case "i":
          res = ((futuro / capital - 1) / periodos) * 100;
          formulaText = `i = (F / P - 1) / n   × 100%`;
          break;
      }
    }

    setResultado(res);
    setFormula(formulaText);
  };

  return (
    <Box sx={{ p: 3, bgcolor: "white", borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Interés Simple
      </Typography>

      <ToggleButtonGroup
        color="primary"
        value={modo}
        exclusive
        onChange={(_, val) => {
          if (val) {
            setModo(val);
            limpiar(); // Limpieza automática al cambiar modo
          }
        }}
        fullWidth
        sx={{ mb: 3 }}
      >
        <ToggleButton value="completos">Valores completos</ToggleButton>
        <ToggleButton value="conocer">Conocer un valor</ToggleButton>
      </ToggleButtonGroup>

      {modo === "conocer" && (
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Calcular</InputLabel>
          <Select value={calcularPara} label="Calcular" onChange={(e) => setCalcularPara(e.target.value)}>
            <MenuItem value="F">Valor futuro (F)</MenuItem>
            <MenuItem value="P">Valor presente (P)</MenuItem>
            <MenuItem value="I">Interés (I)</MenuItem>
            <MenuItem value="periodos">Períodos</MenuItem>
            <MenuItem value="i">Tasa (%)</MenuItem>
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
            label="Años"
            type="number"
            value={n}
            onChange={(e) => setN(e.target.value)}
            disabled={!camposHabilitados.includes("n")}
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
              <MenuItem value="trimestral">Trimestral (4)</MenuItem>
              <MenuItem value="cuatrimestral">Cuatrimestral (3)</MenuItem>
              <MenuItem value="bimestral">Bimestral (6)</MenuItem>
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
        <Box sx={{ mt: 4, p: 3, bgcolor: "#545554", borderRadius: 2, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            {modo === "completos" ? "Valor futuro:" : calcularPara.toUpperCase() + ": "}
            {calcularPara === "i" ? `${resultado.toFixed(4)}%` : calcularPara === "periodos" ? resultado.toFixed(2) : `$${resultado.toLocaleString("es-SV", { minimumFractionDigits: 2 })}`}
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