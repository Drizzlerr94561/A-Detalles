import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BotonWhatsappFlotante from "@/components/BotonWhatsappFlotante";
import CarritoDrawer from "@/components/CarritoDrawer";
import PantallaCargaRosa from "@/components/PantallaCargaRosa";
import { CartProvider } from "@/context/CartContext";
import { Julius_Sans_One, Poppins, Source_Sans_3, Caveat } from "next/font/google";

const juliusSansOne = Julius_Sans_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-julius-sans-one",
  display: "swap",
});

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  weight: ["300", "400", "600"],
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

const caveat = Caveat({
  weight: ["500", "700"],
  subsets: ["latin"],
  variable: "--font-caveat",
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
        url: "/images/Amarillo.png",
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
    images: ["/images/Amarillo.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
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
      className={`${juliusSansOne.variable} ${poppins.variable} ${sourceSans.variable} ${caveat.variable} h-full antialiased`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="referrer" content="no-referrer" />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col organic-bg-pattern text-[#5c4a42] font-poppins selection:bg-[#f5dcd5] selection:text-[#5c4a42] relative overflow-x-hidden">
        {/* ELEMENTOS ORGÁNICOS FLOTANTES DE FONDO CON DESTELLES PASTEL Y BLUR SUAVE */}
        <div className="fixed top-20 -left-20 w-96 h-96 bg-[#f5dcd5]/40 rounded-full blur-3xl pointer-events-none -z-10 animate-floatSlow" />
        <div className="fixed top-1/3 -right-24 w-[30rem] h-[30rem] bg-[#f8ece8]/50 rounded-full blur-3xl pointer-events-none -z-10 animate-floatSlow" style={{ animationDelay: '-4s' }} />
        <div className="fixed bottom-20 left-1/4 w-80 h-80 bg-[#e8d9cf]/30 rounded-full blur-3xl pointer-events-none -z-10 animate-floatSlow" style={{ animationDelay: '-2s' }} />

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



