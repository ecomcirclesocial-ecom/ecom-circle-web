"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFDownloadLink),
  { ssr: false, loading: () => <span className="text-white/40 text-sm">Preparando PDF...</span> }
);

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const S = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    padding: 48,
  },
  // Encabezado del documento
  docTitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#0A0A0A",
    marginBottom: 4,
  },
  docMeta: {
    fontSize: 9,
    color: "#999999",
    marginBottom: 32,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginBottom: 28,
  },
  // Sección
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#0A0A0A",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  sectionContent: {
    fontSize: 10,
    color: "#333333",
    lineHeight: 1.7,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginTop: 20,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: "#CCCCCC",
  },
});

interface Seccion { titulo: string; contenido: string }

function PDFDoc({ nombre, secciones, fecha }: { nombre: string; secciones: Seccion[]; fecha: string }) {
  return (
    <Document title={`Investigación — ${nombre}`}>
      <Page size="A4" style={S.page}>
        <Text style={S.docTitle}>{nombre}</Text>
        <Text style={S.docMeta}>Investigación de producto · {fecha}</Text>
        <View style={S.divider} />

        {secciones.map((s, i) => (
          <View key={i} style={S.section} wrap={false}>
            <Text style={S.sectionTitle}>{s.titulo.replace(/^\d+\.\s*/, "")}</Text>
            <Text style={S.sectionContent}>{s.contenido}</Text>
            {i < secciones.length - 1 && <View style={S.sectionDivider} />}
          </View>
        ))}

        <View style={S.footer} fixed>
          <Text style={S.footerText}>{nombre}</Text>
          <Text style={S.footerText}>{fecha}</Text>
        </View>
      </Page>
    </Document>
  );
}

export function DescargaPDF({ nombre, secciones }: { nombre: string; secciones: Seccion[] }) {
  const fecha = useMemo(() => new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" }), []);
  const nombreArchivo = `investigacion-${nombre.toLowerCase().replace(/\s+/g, "-")}.pdf`;

  return (
    <PDFDownloadLink
      document={<PDFDoc nombre={nombre} secciones={secciones} fecha={fecha} />}
      fileName={nombreArchivo}
      className="flex items-center justify-center gap-2 w-full bg-[#FF5911] text-white font-semibold text-sm py-3.5 rounded-xl hover:bg-[#FF5911]/85 transition active:scale-95"
    >
      {({ loading, error }) => {
        if (error) return "Error al generar — intenta de nuevo";
        return loading ? "Preparando PDF..." : "Descargar investigación en PDF";
      }}
    </PDFDownloadLink>
  );
}
