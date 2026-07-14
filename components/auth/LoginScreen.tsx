"use client";

import Button from "@/components/ui/Button";
import { Display, Caption } from "@/components/ui/Typography";
import { useAuth } from "@/lib/auth/AuthContext";

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-6">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-3">
          <Display>Proyecto SER</Display>
          <Caption>Un lugar tranquilo para volver cada día.</Caption>
        </div>

        <Button
          type="button"
          variant="primary"
          className="w-full"
          onClick={() => void signInWithGoogle()}
        >
          Continuar con Google
        </Button>
      </div>
    </div>
  );
}
