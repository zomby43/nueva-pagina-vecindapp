// app/secretaria/certificados/page.js
"use client";

import { useMemo, useState } from "react";
import { jsPDF } from "jspdf";

// --- Utilidades RUT / Fecha ---
function limpiarRut(rut) {
  return (rut || "").replace(/[.\-]/g, "").toUpperCase();
}
function formatearRut(rut) {
  const v = limpiarRut(rut);
  if (!v) return "";
  const cuerpo = v.slice(0, -1);
  const dv = v.slice(-1);
  const conPuntos = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${conPuntos}-${dv}`;
}
function validarRut(rut) {
  const r = limpiarRut(rut);
  if (!r || r.length < 2) return false;
  const cuerpo = r.slice(0, -1);
  const dv = r.slice(-1);
  let suma = 0;
  let multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }
  const resto = 11 - (suma % 11);
  const dvEsperado = resto === 11 ? "0" : resto === 10 ? "K" : String(resto);
  return dvEsperado === dv.toUpperCase();
}
function hoyCL() {
  return new Intl.DateTimeFormat("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

export default function EmitirCertificadoResidenciaPage() {
  const [form, setForm] = useState({
    nombre: "",
    rut: "",
    direccion: "",
    comuna: "",
    ciudad: "",
    numero: "", // folio asignado automáticamente (readOnly)
  });
  const [errors, setErrors] = useState({});
  const rutFormateado = useMemo(() => formatearRut(form.rut), [form.rut]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validar() {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "Ingresa el nombre completo";
    if (!form.rut.trim()) e.rut = "Ingresa el RUT";
    else if (!validarRut(form.rut)) e.rut = "RUT inválido";
    if (!form.direccion.trim()) e.direccion = "Ingresa la dirección";
    if (!form.comuna.trim()) e.comuna = "Ingresa la comuna";
    if (!form.ciudad.trim()) e.ciudad = "Ingresa la ciudad";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function emitirEnSupabase() {
    const res = await fetch("/api/certificados/emitir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: form.nombre,
        rut: form.rut,
        direccion: form.direccion,
        comuna: form.comuna,
        ciudad: form.ciudad,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Error al generar folio en la base de datos");
      throw new Error("Error al emitir certificado");
    }
    return String(data.folio);
  }

  async function emitirYGenerarPDF() {
    if (!validar()) return;
    const folio = await emitirEnSupabase();
    setForm((prev) => ({ ...prev, numero: folio }));
    generarPDF(folio);
  }

  function generarPDF(folio) {
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const margin = 56; // ~0.78in
    let y = margin;

    const nombreJunta = process.env.NEXT_PUBLIC_JUNTA_NOMBRE || "Junta de Vecinos";
    const rutJunta = process.env.NEXT_PUBLIC_JUNTA_RUT || "";

    // Encabezado
    doc.setFont("Times", "Bold"); doc.setFontSize(18);
    doc.text(nombreJunta, margin, y); y += 18;
    doc.setFont("Times", "Normal"); doc.setFontSize(11);
    if (rutJunta) { doc.text(`RUT: ${rutJunta}`, margin, y); y += 16; }
    if (folio) { doc.text(`Certificado Nº: ${folio}`, margin, y); y += 16; }
    doc.setDrawColor(0); doc.line(margin, y, 612 - margin, y); y += 24;

    // Título
    doc.setFont("Times", "Bold"); doc.setFontSize(16);
    doc.text("CERTIFICADO DE RESIDENCIA", 306, y, { align: "center" }); y += 24;

    // Cuerpo
    doc.setFont("Times", "Normal"); doc.setFontSize(12);
    const texto =
      `Quien suscribe, en representación de ${nombreJunta}, certifica que ${form.nombre} (RUT ${rutFormateado}) ` +
      `reside en ${form.direccion}, comuna de ${form.comuna}, ciudad de ${form.ciudad}.\n\n` +
      `El presente certificado se emite para los fines que la persona estime convenientes, con fecha ${hoyCL()}.`;
    const lines = doc.splitTextToSize(texto, 612 - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 16 + 16;

    // Firma (según tu pedido previo)
    const firmaY = y + 60;
    doc.line(200, firmaY, 412, firmaY);
    doc.text("Junta de Vecinos 2025", 306, firmaY + 16, { align: "center" });

    // Pie
    doc.setFontSize(9);
    doc.text("Este documento ha sido generado digitalmente por la Junta de Vecinos.", 306, 756, { align: "center" });

    const nombreArchivo = `certificado_residencia_${limpiarRut(form.rut)}.pdf`;
    doc.save(nombreArchivo);
  }

  // ---- Estilos en línea, consistentes con tu Dashboard ----
  const palette = {
    primary: "#439fa4",
    primaryDark: "#154765",
    warn: "#fbbf24",
    danger: "#fb7185",
    success: "#34d399",
    bg: "#f4f8f9",
    light: "#bfd3d9",
  };
  const cardStyle = {
    background: "white",
    borderRadius: "16px",
    padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(21, 71, 101, 0.06)",
  };
  const labelStyle = { fontSize: "0.875rem", fontWeight: 600, color: palette.primary, marginBottom: 6 };
  const inputStyle = { border: `1px solid ${palette.light}`, borderRadius: 12, padding: "0.75rem 0.875rem", outline: "none" };
  const errorStyle = { color: "#dc2626", fontSize: "0.8125rem", marginTop: 6 };

  return (
    <div
      className="emitir-page"
      style={{ background: palette.bg, borderRadius: "16px", padding: "2rem", boxShadow: "0 2px 8px rgba(21, 71, 101, 0.06)" }}
    >
      <div className="header" style={{ marginBottom: "2rem", paddingBottom: "1rem", borderBottom: `2px solid ${palette.light}` }}>
        <h1 style={{ color: palette.primaryDark, fontSize: "2rem", fontWeight: 700, margin: 0 }}>
          📄 Emitir Certificado de Residencia
        </h1>
        <p style={{ color: palette.primary, marginTop: 8 }}>
          Completa los datos del vecino y genera el PDF con un clic.
        </p>
      </div>

      <div className="form-card" style={cardStyle}>
        <div
          className="grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}
        >
          <div className="field" style={{ display: "flex", flexDirection: "column" }}>
            <label style={labelStyle}>Nombre completo</label>
            <input name="nombre" value={form.nombre} onChange={onChange} placeholder="Ej: María Pérez Soto" style={inputStyle} />
            {errors.nombre && <span style={errorStyle}>{errors.nombre}</span>}
          </div>

          <div className="field" style={{ display: "flex", flexDirection: "column" }}>
            <label style={labelStyle}>RUT</label>
            <input name="rut" value={form.rut} onChange={onChange} placeholder="12.345.678-9" style={inputStyle} />
            <div style={{ fontSize: "0.75rem", color: palette.primary, marginTop: 6 }}>
              {rutFormateado ? `Formateado: ${rutFormateado}` : ""}
            </div>
            {errors.rut && <span style={errorStyle}>{errors.rut}</span>}
          </div>

          <div className="field" style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column" }}>
            <label style={labelStyle}>Dirección</label>
            <input name="direccion" value={form.direccion} onChange={onChange} placeholder="Calle 123, depto 45" style={inputStyle} />
            {errors.direccion && <span style={errorStyle}>{errors.direccion}</span>}
          </div>

          <div className="field" style={{ display: "flex", flexDirection: "column" }}>
            <label style={labelStyle}>Comuna</label>
            <input name="comuna" value={form.comuna} onChange={onChange} placeholder="Ej: Maipú" style={inputStyle} />
            {errors.comuna && <span style={errorStyle}>{errors.comuna}</span>}
          </div>

          <div className="field" style={{ display: "flex", flexDirection: "column" }}>
            <label style={labelStyle}>Ciudad</label>
            <input name="ciudad" value={form.ciudad} onChange={onChange} placeholder="Ej: Santiago" style={inputStyle} />
            {errors.ciudad && <span style={errorStyle}>{errors.ciudad}</span>}
          </div>

          <div className="field" style={{ display: "flex", flexDirection: "column" }}>
            <label style={labelStyle}>Nº de certificado</label>
            <input
              name="numero"
              value={form.numero}
              placeholder="Se asigna automáticamente"
              style={{ ...inputStyle, backgroundColor: "#f0f0f0" }}
              readOnly
            />
          </div>
        </div>

        <div className="actions" style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
          <button
            onClick={emitirYGenerarPDF}
            style={{ background: palette.primary, color: "white", border: "none", borderRadius: 12, padding: "0.75rem 1rem", fontWeight: 700, cursor: "pointer" }}
          >
            Emitir y generar PDF
          </button>
          <a
            href="/secretaria"
            style={{ background: palette.light, color: palette.primaryDark, textDecoration: "none", borderRadius: 12, padding: "0.75rem 1rem", fontWeight: 700 }}
          >
            ← Volver al Panel
          </a>
        </div>
      </div>

      <div
        className="help"
        style={{ marginTop: "2rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}
      >
        <div className="card" style={{ ...cardStyle, borderLeft: `4px solid ${palette.primary}` }}>
          <h3 style={{ color: palette.primaryDark, marginTop: 0 }}>✅ Recomendaciones</h3>
          <ul style={{ margin: 0, paddingLeft: "1rem", color: palette.primaryDark }}>
            <li>Verifica el RUT y la dirección antes de emitir.</li>
            <li>El Nº de certificado se asigna automáticamente por el sistema.</li>
            <li>Guarda el PDF emitido para adjuntarlo a la solicitud.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
