'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const verificarAccesoAdmin = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.autenticado && data.usuario?.role === "ADMIN") {
          if (typeof window !== "undefined") {
            localStorage.setItem("admin_view_mode", "admin");
            localStorage.setItem("admin_session_active", "true");
            window.dispatchEvent(new Event("adminModeChanged"));
          }
          router.replace("/productos");
        } else {
          router.replace("/login");
        }
      } catch {
        router.replace("/login");
      }
    };
    verificarAccesoAdmin();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#faf6f4] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#c29486] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
