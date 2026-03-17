import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
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
import CalculateIcon from "@mui/icons-material/Calculate";
import ClearIcon from "@mui/icons-material/Clear";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import PercentIcon from "@mui/icons-material/Percent";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

// ──────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ──────────────────────────────────────────────
export default function Descuentos() {
  // Estados principales
  const [tipoDescuento, setTipoDescuento] = useState("comercial");
  const [valorNominalVN, setValorNominalVN] = useState("");
  const [valorPresenteP, setValorPresenteP] = useState("");
  const [tasaInput, setTasaInput] = useState("");
  const [tiempoInput, setTiempoInput] = useState("");
  const [frecuenciaN, setFrecuenciaN] = useState("mensual");

  // Estados para equivalencia i ↔ d
  const [tasaInteresI, setTasaInteresI] = useState("");
  const [tasaDescuentoD, setTasaDescuentoD] = useState("");
  const [tiempoEquiv, setTiempoEquiv] = useState("");

  // Resultados generales
  const [descuentoResultado, setDescuentoResultado] = useState(null);
  const [valorCalculado, setValorCalculado] = useState(null);
  const [etiquetaCalculado, setEtiquetaCalculado] = useState("");
  const [formulaUsada, setFormulaUsada] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // ──────────────────────────────────────────────
  // FUNCIONES AUXILIARES
  // ──────────────────────────────────────────────
  const getN = () => {
    const mapa = {
      diario: 365, semanal: 52, mensual: 12, trimestral: 4,
      cuatrimestral: 3, bimestral: 6, semestral: 2, anual: 1,
    };
    return mapa[frecuenciaN] || 12;
  };

  const limpiar = () => {
    setValorNominalVN("");
    setValorPresenteP("");
    setTasaInput("");
    setTiempoInput("");
    setTasaInteresI("");
    setTasaDescuentoD("");
    setTiempoEquiv("");
    setDescuentoResultado(null);
    setValorCalculado(null);
    setEtiquetaCalculado("");
    setFormulaUsada("");
    setErrorMsg("");
  };

  const validarEntradas = () => {
    const VN = parseFloat(valorNominalVN);
    const P = parseFloat(valorPresenteP);
    const i = parseFloat(tasaInput);
    const t = parseFloat(tiempoInput);

    if (tipoDescuento === "comercial") {
      if (!valorNominalVN || !tasaInput || !tiempoInput) return "Complete Valor nominal, Tasa (%) y Tiempo";
      if (VN <= 0 || i <= 0 || t <= 0) return "Valores deben ser > 0";
    } else if (tipoDescuento === "real") {
      const tieneVN = valorNominalVN.trim() !== "" && !isNaN(VN);
      const tieneP = valorPresenteP.trim() !== "" && !isNaN(P);
      if (!tieneVN && !tieneP) return "Ingrese al menos P o VN";
      if ((tieneVN && VN <= 0) || (tieneP && P <= 0) || i <= 0 || t <= 0) {
        return "Valores deben ser > 0";
      }
    } else if (tipoDescuento === "compuesto") {
      if ((!valorNominalVN && !valorPresenteP) || !tasaInput || !tiempoInput) {
        return "Complete al menos VN o P, Tasa y Tiempo";
      }
      if ((VN <= 0 && valorNominalVN) || (P <= 0 && valorPresenteP) || i <= 0 || t <= 0) {
        return "Valores deben ser > 0";
      }
    } else if (tipoDescuento === "equivalencia") {
      const tieneI = tasaInteresI.trim() !== "";
      const tieneD = tasaDescuentoD.trim() !== "";
      if (!tieneI && !tieneD) return "Ingrese al menos una tasa (i o d)";
      if (!tiempoEquiv || parseFloat(tiempoEquiv) <= 0) return "Ingrese tiempo válido > 0";
    }
    return "";
  };

  // ──────────────────────────────────────────────
  // CÁLCULO PRINCIPAL
  // ──────────────────────────────────────────────
  const calcular = () => {
    setErrorMsg("");
    setDescuentoResultado(null);
    setValorCalculado(null);
    setEtiquetaCalculado("");
    setFormulaUsada("");

    const error = validarEntradas();
    if (error) {
      setErrorMsg(error);
      return;
    }

    const i_anual = parseFloat(tasaInput) / 100;
    const t = parseFloat(tiempoInput);

    let Dr = null;
    let valorCalc = null;
    let etiqueta = "";
    let formula = "";

    if (tipoDescuento === "real") {
      const tieneVN = valorNominalVN.trim() !== "";
      const tieneP = valorPresenteP.trim() !== "";

      if (tieneP && !tieneVN) {
        const P = parseFloat(valorPresenteP);
        Dr = P * i_anual * t;
        valorCalc = P * (1 + i_anual * t);
        etiqueta = "Valor Nominal / Futuro (VN)";
        formula = "VN = P × (1 + i × t)";
      } else if (tieneVN && !tieneP) {
        const VN = parseFloat(valorNominalVN);
        const denom = 1 + i_anual * t;
        const P = VN / denom;
        Dr = VN - P;
        valorCalc = P;
        etiqueta = "Valor Presente / Actual (P)";
        formula = "P = VN / (1 + i × t)";
      } else if (tieneVN && tieneP) {
        const VN = parseFloat(valorNominalVN);
        const P_ing = parseFloat(valorPresenteP);
        const P_calc = VN / (1 + i_anual * t);
        if (Math.abs(P_calc - P_ing) > 0.01) {
          setErrorMsg("P y VN no son consistentes con i y t");
          return;
        }
        Dr = VN - P_ing;
        valorCalc = P_ing;
        etiqueta = "Valor Presente / Actual (P)";
        formula = "Consistencia verificada";
      }
    } else if (tipoDescuento === "comercial") {
      const VN = parseFloat(valorNominalVN);
      Dr = VN * i_anual * t;
      valorCalc = VN - Dr;
      etiqueta = "Valor recibido (neto)";
      formula = "Dr = VN × i × t";
    } else if (tipoDescuento === "compuesto") {
      const m = getN();
      const i_periodo = i_anual / m;
      const n = t * m;

      if (valorNominalVN.trim() !== "") {
        const VN = parseFloat(valorNominalVN);
        valorCalc = VN / Math.pow(1 + i_periodo, n);
        Dr = VN - valorCalc;
        etiqueta = "Valor Presente (P)";
        formula = "P = VN / (1 + i/m)^(m×t)";
      } else {
        const P = parseFloat(valorPresenteP);
        valorCalc = P * Math.pow(1 + i_periodo, n);
        Dr = valorCalc - P;
        etiqueta = "Valor Futuro (VN)";
        formula = "VN = P × (1 + i/m)^(m×t)";
      }
    } else if (tipoDescuento === "equivalencia") {
      const t_eq = parseFloat(tiempoEquiv);
      let i = parseFloat(tasaInteresI) / 100;
      let d = parseFloat(tasaDescuentoD) / 100;

      if (tasaInteresI.trim() !== "" && tasaDescuentoD.trim() === "") {
        // Calcular d equivalente
        d = i / (1 + i * t_eq);
        setValorCalculado(d * 100);
        setEtiquetaCalculado("Tasa de descuento comercial equivalente d (%)");
        setFormulaUsada(`d = i / (1 + i × t)`);
      } else if (tasaDescuentoD.trim() !== "" && tasaInteresI.trim() === "") {
        // Calcular i equivalente
        if (d * t_eq >= 1) {
          setErrorMsg("d × t ≥ 1 → descuento imposible (tasa no válida)");
          return;
        }
        i = d / (1 - d * t_eq);
        setValorCalculado(i * 100);
        setEtiquetaCalculado("Tasa de interés simple equivalente i (%)");
        setFormulaUsada(`i = d / (1 - d × t)`);
      } else {
        // Verificar consistencia
        const d_calc = i / (1 + i * t_eq);
        if (Math.abs(d_calc - d) > 0.0001) {
          setErrorMsg("Las tasas no son equivalentes con el tiempo ingresado");
          return;
        }
        setValorCalculado(d * 100);
        setEtiquetaCalculado("Tasa de descuento d (%) – consistencia verificada");
        setFormulaUsada("Equivalencia confirmada");
      }
      setDescuentoResultado(null); // No hay "descuento" en este modo
      return;
    }

    setDescuentoResultado(Dr);
    setValorCalculado(valorCalc);
    setEtiquetaCalculado(etiqueta);
    setFormulaUsada(formula);
  };

  // ──────────────────────────────────────────────
  // RENDERIZADO
  // ──────────────────────────────────────────────
  const renderCampo = (label, value, onChange, icon = null) => (
    <TextField
      label={label}
      type="number"
      value={value}
      onChange={onChange}
      fullWidth
      InputProps={{
        startAdornment: icon ? <InputAdornment position="start">{icon}</InputAdornment> : null,
      }}
    />
  );

  const esReal = tipoDescuento === "real";
  const esCompuesto = tipoDescuento === "compuesto";
  const esEquivalencia = tipoDescuento === "equivalencia";

  return (
    <Box sx={{ width: "100%", p: { xs: 2, md: 4 }, bgcolor: "#f9fafb", minHeight: "100vh" }}>
      <Stack spacing={4} maxWidth="1200px" mx="auto">
        <Card sx={{ boxShadow: 4, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h4" gutterBottom color="primary.dark" align="center">
              Calculadora Financiera – Descuentos e Interés Simple
            </Typography>

            <ToggleButtonGroup
              color="primary"
              value={tipoDescuento}
              exclusive
              onChange={(_, newTipo) => {
                if (newTipo) {
                  setTipoDescuento(newTipo);
                  limpiar();
                }
              }}
              fullWidth
              sx={{ mb: 4, borderRadius: 2 }}
            >
              <ToggleButton value="comercial">Desc. Comercial</ToggleButton>
              <ToggleButton value="real">Desc. Real</ToggleButton>
              <ToggleButton value="compuesto">Desc. Compuesto</ToggleButton>
              <ToggleButton value="equivalencia">Equiv. i ↔ d</ToggleButton>
            </ToggleButtonGroup>

            {errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}

            <Grid container spacing={3}>
              {!esEquivalencia && (
                <>
                  <Grid item xs={12} sm={6} md={4}>
                    {renderCampo(
                      esReal ? "Valor Nominal (VN) o dejar vacío" : "Valor Nominal (VN)",
                      valorNominalVN,
                      (e) => setValorNominalVN(e.target.value),
                      <MonetizationOnIcon color="primary" />
                    )}
                  </Grid>

                  {!esCompuesto || true ? (
                    <Grid item xs={12} sm={6} md={4}>
                      {renderCampo(
                        esReal ? "Valor Presente (P) o dejar vacío" : "Valor Presente (P)",
                        valorPresenteP,
                        (e) => setValorPresenteP(e.target.value),
                        <MonetizationOnIcon color="success" />
                      )}
                    </Grid>
                  ) : null}

                  <Grid item xs={12} sm={6} md={4}>
                    {renderCampo("Tasa (%)", tasaInput, (e) => setTasaInput(e.target.value), <PercentIcon color="primary" />)}
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    {renderCampo("Tiempo (años)", tiempoInput, (e) => setTiempoInput(e.target.value), <AccessTimeIcon color="primary" />)}
                  </Grid>

                  {esCompuesto && (
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Frecuencia</InputLabel>
                        <Select value={frecuenciaN} label="Frecuencia" onChange={(e) => setFrecuenciaN(e.target.value)}>
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
                  )}
                </>
              )}

              {esEquivalencia && (
                <>
                  <Grid item xs={12} sm={6} md={4}>
                    {renderCampo(
                      "Tasa interés simple i (%) o dejar vacío",
                      tasaInteresI,
                      (e) => setTasaInteresI(e.target.value),
                      <PercentIcon color="primary" />
                    )}
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    {renderCampo(
                      "Tasa descuento comercial d (%) o dejar vacío",
                      tasaDescuentoD,
                      (e) => setTasaDescuentoD(e.target.value),
                      <PercentIcon color="error" />
                    )}
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    {renderCampo("Tiempo (años)", tiempoEquiv, (e) => setTiempoEquiv(e.target.value), <AccessTimeIcon color="primary" />)}
                  </Grid>
                </>
              )}
            </Grid>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={4}>
              <Button variant="contained" color="primary" startIcon={<CalculateIcon />} onClick={calcular} fullWidth sx={{ py: 1.5 }}>
                Calcular
              </Button>
              <Button variant="outlined" color="error" startIcon={<ClearIcon />} onClick={limpiar} fullWidth sx={{ py: 1.5 }}>
                Limpiar
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* RESULTADO */}
        {(descuentoResultado !== null || valorCalculado !== null) && (
          <Card sx={{ bgcolor: esEquivalencia ? "#e3f2fd" : "#e0e0e0", boxShadow: 6, borderRadius: 3, p: 4, textAlign: "center" }}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {esEquivalencia ? "EQUIVALENCIA TASAS SIMPLE" :
               tipoDescuento === "real" ? "DESCUENTO REAL" :
               tipoDescuento === "comercial" ? "DESCUENTO COMERCIAL" :
               "DESCUENTO COMPUESTO"}
            </Typography>

            {descuentoResultado !== null && (
              <Box sx={{ my: 2 }}>
                <Typography variant="body1">Descuento:</Typography>
                <Typography variant="h5" fontWeight="bold" color="error.main">
                  ${descuentoResultado.toLocaleString("es-SV", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>
            )}

            <Box sx={{ my: 3, p: 2, bgcolor: "white", borderRadius: 2, boxShadow: 1 }}>
              <Typography variant="body1">{etiquetaCalculado}:</Typography>
              <Typography variant="h4" fontWeight="bold" color="success.dark">
                {esEquivalencia
                  ? `${valorCalculado.toFixed(4)} %`
                  : `$${valorCalculado.toLocaleString("es-SV", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </Typography>
            </Box>

            {formulaUsada && (
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                {formulaUsada}
              </Typography>
            )}
          </Card>
        )}

        {descuentoResultado === null && valorCalculado === null && !errorMsg && (
          <Alert severity="info" sx={{ mt: 3 }}>
            {esEquivalencia
              ? "Ingrese una tasa (i o d) y el tiempo para calcular la equivalente"
              : "Complete los campos según el modo seleccionado"}
          </Alert>
        )}
      </Stack>
    </Box>
  );
}