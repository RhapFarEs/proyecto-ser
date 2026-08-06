"use client";

import "./globals.css";

/**
 * The last resort: something failed in the root layout itself, so the normal
 * error screen — which renders inside that layout — cannot be shown.
 *
 * This one replaces the whole document, which is why it carries its own
 * `html` and `body` and cannot use any of the app's layout components. The
 * stylesheet is imported directly so the ground and ink still come from the
 * atmosphere tokens rather than from a browser default; no atmosphere will
 * have been applied to the document at this point, so it renders in Tinta,
 * which is the CSS default.
 *
 * The message is the same as the ordinary error screen, for the same reason:
 * the only thing worth saying first is that the writing is still there.
 */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-ground font-sans text-ink">
        <div className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-8 sm:py-16">
          <div className="space-y-6">
            <h1 className="ser-voice text-4xl leading-[1.1] text-ink-strong sm:text-5xl">
              Algo no se pudo mostrar
            </h1>

            <p className="ser-reading text-[1.0625rem] text-ink-soft">
              Lo que escribiste sigue guardado. Esto fue un problema al abrir la aplicación, no
              con tu archivo.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={reset}
                className="ser-card inline-flex items-center justify-center border border-transparent bg-ink-strong px-4 py-3 text-sm font-medium text-ground transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-faint"
              >
                Intentar de nuevo
              </button>

              {/*
                A plain anchor, not a Link: the router lives in the layout
                that just failed, so a full navigation is the only one that
                can be relied on here.
              */}
              <p>
                <a
                  href="/feedback"
                  className="text-sm leading-6 text-ink-faint underline underline-offset-4 hover:text-ink-soft"
                >
                  Contar qué pasó
                </a>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
