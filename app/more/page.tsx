"use client";

import Link from "next/link";

import Page from "@/components/ui/Page";
import SectionTitle from "@/components/ui/SectionTitle";
import { Body } from "@/components/ui/Typography";
import { useAuth } from "@/lib/auth/AuthContext";

const rowClassName =
  "block w-full rounded-[1.75rem] border border-zinc-800/80 bg-zinc-950/60 p-5 text-left backdrop-blur-sm transition-colors hover:bg-zinc-900/60 sm:p-6";

export default function MorePage() {
  const { changeAccount, signOut } = useAuth();

  return (
    <Page title="Más" subtitle="Otras cosas que puedes revisar.">
      <div className="space-y-6">
        <Link href="/feedback" className={rowClassName}>
          <Body className="text-zinc-100">Ayudar a mejorar Proyecto SER</Body>
        </Link>

        <div className="space-y-3">
          <SectionTitle>Cuenta</SectionTitle>

          <div className="space-y-3">
            <Link href="/profile" className={rowClassName}>
              <Body className="text-zinc-100">Perfil</Body>
            </Link>

            <button type="button" className={rowClassName} onClick={() => void changeAccount()}>
              <Body className="text-zinc-100">Cambiar de cuenta</Body>
            </button>

            <button type="button" className={rowClassName} onClick={() => void signOut()}>
              <Body className="text-zinc-100">Cerrar sesión</Body>
            </button>
          </div>
        </div>
      </div>
    </Page>
  );
}
