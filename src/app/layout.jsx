import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BotonWhatsappFlotante from "@/components/BotonWhatsappFlotante";
import CarritoDrawer from "@/components/CarritoDrawer";
import PantallaCargaRosa from "@/components/PantallaCargaRosa";
import { CartProvider } from "@/context/CartContext";
import localFont from "next/font/local";

const juliusSansOne = localFont({
  src: [
    { path: "../../public/fonts/google/juliussansone-latin-400.woff2", weight: "400", style: "normal" },
  ],
  variable: "--font-julius-sans-one",
  display: "swap",
});

const poppins = localFont({
  src: [
    { path: "../../public/fonts/google/poppins-latin-300.woff2", weight: "300", style: "normal" },
    { path: "../../public/fonts/google/poppins-latin-400.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/google/poppins-latin-500.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/google/poppins-latin-600.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/google/poppins-latin-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap",
});

const sourceSans = localFont({
  src: [
    { path: "../../public/fonts/google/sourcesans3-latin-300-600.woff2", weight: "300 600", style: "normal" },
  ],
  variable: "--font-poppins-sans",
  display: "swap",
});

const caveat = localFont({
  src: [
    { path: "../../public/fonts/google/caveat-latin-500-700.woff2", weight: "500 700", style: "normal" },
  ],
  variable: "--font-caveat",
  display: "swap",
});

const oliverFont = localFont({
  src: "../../public/fonts/oliver.a.ttf",
  variable: "--font-oliver",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://adetallesbq.com"),
  title: {
    default: "A’Detalles - Desayunos Sorpresa y Regalos Especiales en Barranquilla",
    template: "%s | A’Detalles",
  },
  description: "Desayunos sorpresa artesanales, arreglos florales y cajas de regalo exclusivas con entrega a domicilio en toda Barranquilla.",
  keywords: [
    "Desayunos sorpresa Barranquilla",
    "Regalos sorpresa Barranquilla",
    "Arreglos florales Barranquilla",
    "Peluches gigantes Barranquilla",
    "A'Detalles",
    "Adetallesbq",
  ],
  authors: [{ name: "A'Detalles" }],
  creator: "A'Detalles",
  publisher: "A'Detalles",
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "/",
    siteName: "A’Detalles Tienda de Regalos",
    title: "A’Detalles - Desayunos Sorpresa y Regalos Especiales en Barranquilla",
    description: "Desayunos sorpresa artesanales, arreglos florales y regalos exclusivos con entrega a domicilio en Barranquilla. ¡Haz tu pedido directo a WhatsApp!",
    images: [
      {
        url: "https://res.cloudinary.com/enwlpozz/image/upload/v1789706767/adetallesbq/banners/amarillo.jpg",
        width: 1200,
        height: 630,
        alt: "A'Detalles - Tienda de Regalos en Barranquilla",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "A’Detalles - Desayunos Sorpresa y Regalos Especiales en Barranquilla",
    description: "Desayunos sorpresa artesanales, arreglos florales y regalos exclusivos con entrega a domicilio en Barranquilla.",
    images: ["https://res.cloudinary.com/enwlpozz/image/upload/v1789706767/adetallesbq/banners/amarillo.jpg"],
  },
  icons: {
    icon: [
      { url: "/icon.png?v=2", type: "image/png" },
      { url: "/favicon.ico?v=2", sizes: "any" },
    ],
    shortcut: "https://res.cloudinary.com/enwlpozz/image/upload/v1789701569/samples/logo.png?v=2",
    apple: "https://res.cloudinary.com/enwlpozz/image/upload/v1789701569/samples/logo.png?v=2",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${juliusSansOne.variable} ${poppins.variable} ${sourceSans.variable} ${caveat.variable} ${oliverFont.variable} h-full antialiased`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="referrer" content="no-referrer" />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col organic-bg-pattern text-[#614539] font-poppins selection:bg-zinc-100 selection:text-[#614539] relative overflow-x-hidden">
        {/* ELEMENTOS ORGÁNICOS FLOTANTES DE FONDO CON DESTELLES PASTEL Y BLUR SUAVE */}
        <div className="fixed top-20 -left-20 w-96 h-96 bg-zinc-100/40 rounded-full blur-3xl pointer-events-none -z-10 animate-floatSlow" />
        <div className="fixed top-1/3 -right-24 w-[30rem] h-[30rem] bg-zinc-50/50 rounded-full blur-3xl pointer-events-none -z-10 animate-floatSlow" style={{ animationDelay: '-4s' }} />
        <div className="fixed bottom-20 left-1/4 w-80 h-80 bg-zinc-100/30 rounded-full blur-3xl pointer-events-none -z-10 animate-floatSlow" style={{ animationDelay: '-2s' }} />

        <CartProvider>
          <PantallaCargaRosa />
          <Navbar />
          <main className="flex-1 w-full relative z-10">
            {children}
          </main>
          <Footer />
          <BotonWhatsappFlotante />
          <CarritoDrawer />
        </CartProvider>
      </body>
    </html>
  );
}



