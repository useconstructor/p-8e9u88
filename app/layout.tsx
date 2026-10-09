import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Temporizador Cocina",
  description: "Aplicacion web para cronometrar tiempos de cocina con controles de inicio, pausa y reinicio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
