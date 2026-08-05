"use client";

import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { Body, Display } from "@/components/ui/Typography";

/**
 * What a person sees when a screen fails to render.
 *
 * Without this the app showed nothing at all — a blank page. In a product
 * whose archive lives on the person's own device, a blank page does not read
 * as "a screen broke". It reads as "everything I wrote is gone", which is
 * the worst sentence this product can put in someone's head, and it was
 * being said by an empty screen rather than by anyone deciding to say it.
 *
 * So the first job here is not recovery, it is the fact: the writing is
 * safe. The retry comes second.
 *
 * The error itself is deliberately not shown and deliberately not sent
 * anywhere. A stack trace tells the person nothing they can act on, and
 * anything carrying their words must never leave the device.
 */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen bg-ground text-ink-strong">
      <Container>
        <div className="space-y-6">
          <Display>Algo no se pudo mostrar</Display>

          <Body>
            Lo que escribiste sigue guardado. Esto fue un problema al dibujar esta pantalla, no
            con tu archivo.
          </Body>

          <Button type="button" variant="primary" onClick={reset}>
            Intentar de nuevo
          </Button>
        </div>
      </Container>
    </main>
  );
}
