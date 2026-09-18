'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MiCuentaPage() {
  const router = useRouter();

  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.autenticado && data.usuario?.role === "ADMIN") {
          router.replace("/admin/pedidos");
        } else {
          router.replace("/");
        }
      } catch {
        router.replace("/");
      }
    };
    checkRedirect();
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#c29486] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
