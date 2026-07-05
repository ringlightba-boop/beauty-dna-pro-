import type { Metadata } from "next";
import "./globals.css";

// Fonts are loaded via a standard <link> stylesheet instead of next/font/google
// on purpose: next/font fetches font files at *build time*, which breaks in
// sandboxed/offline CI environments (no access to fonts.googleapis.com). A
// <link> tag defers the fetch to the visitor's browser at runtime, which is
// the same tradeoff most Next.js sites made before next/font existed and
// works everywhere. If your deploy target has open network access during
// build, feel free to switch back to next/font/google for slightly better
// loading performance (no extra request round trip).
export const metadata: Metadata = {
  title: "Beauty DNA Pro AI — Descubra o DNA da beleza",
  description:
    "Plataforma inteligente para maquiadoras analisarem foto, preferências, colorimetria, visagismo e ocasião antes do atendimento.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
