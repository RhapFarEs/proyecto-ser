import Link from "next/link";

import LegalPage from "@/components/ui/LegalPage";
import { Caption } from "@/components/ui/Typography";

export const metadata = {
  title: "Términos del servicio · Proyecto SER",
};

/*
  Describes the product as it exists, including the parts that are
  inconvenient to admit: it is one person's project, it is in beta, it can
  fail, and it is not a substitute for care from a professional.
*/
export default function TermsPage() {
  return (
    <LegalPage
      title="Términos del servicio"
      subtitle="Qué es SER, qué no es, y qué puedes esperar de él."
      updatedAt="6 de agosto de 2026"
    >
      <p>
        Estos términos rigen el uso de Proyecto SER durante su beta cerrada. Están escritos en
        lenguaje sencillo y describen el producto tal como funciona hoy.
      </p>

      <h2>Qué es SER</h2>
      <p>
        Un lugar personal para escribir cada día y volver a leer lo que escribiste. Es un
        proyecto personal, hecho y operado por una sola persona, sin empresa detrás.
      </p>

      <h2>Qué no es</h2>
      <ul>
        <li>
          <strong>No es un servicio de salud.</strong> SER no es terapia, no sustituye atención
          psicológica o médica, y no tiene forma de detectar una urgencia ni de responder a
          ella. Si estás pasando por algo grave, busca a una persona o a un profesional. SER no
          va a leer lo que escribas.
        </li>
        <li>
          <strong>No es un servicio de respaldo.</strong> No lo uses como la única copia de
          algo que no puedas perder.
        </li>
        <li>
          <strong>No es una red social.</strong> No hay forma de compartir, publicar ni ver lo
          que escriben otras personas, porque esa función no existe.
        </li>
      </ul>

      <h2>Tu cuenta</h2>
      <p>
        Necesitas una cuenta de Google para entrar; es el único método disponible. Cada cuenta
        es para una sola persona y para uso personal. Eres responsable de mantener el acceso a
        tu cuenta de Google: si la pierdes, no hay otra forma de entrar a SER ni de recuperar
        lo que escribiste.
      </p>

      <h2>Lo que escribes es tuyo</h2>
      <p>
        Conservas todos los derechos sobre tu contenido. SER no reclama ninguno, no lo usa para
        entrenar nada y no lo muestra a nadie. Puedes llevártelo entero cuando quieras desde
        Más → <em>Descargar mi archivo</em>, sin pedir permiso y sin conexión.
      </p>

      <h2>Está en beta</h2>
      <p>
        SER puede tener fallas, puede cambiar sin aviso y puede quedar temporalmente fuera de
        servicio. Se ofrece <strong>tal como está</strong>, sin garantías de funcionamiento
        continuo, y en la medida en que la ley lo permita no se asume responsabilidad por
        pérdida de datos ni por daños derivados de su uso. Por eso existen la descarga del
        archivo y el guardado local: para que ninguna falla dependa de que alguien reaccione.
      </p>

      <h2>Uso aceptable</h2>
      <p>
        No intentes acceder a datos de otras personas, ni sobrecargar o vulnerar el servicio.
        No hay mucho más que decir aquí: SER no tiene contenido público ni interacción entre
        personas, así que casi todo lo que podría prohibirse no es posible.
      </p>

      <h2>Terminar</h2>
      <ul>
        <li>
          <strong>Puedes irte cuando quieras.</strong> Más → <em>Eliminar mi cuenta</em> borra
          tu cuenta y todo lo que escribiste, de inmediato y sin posibilidad de recuperación.
          Descarga tu archivo antes si quieres conservarlo.
        </li>
        <li>
          <strong>La beta puede terminar.</strong> Si SER deja de operar, se avisará por correo
          con antelación suficiente para que descargues tu archivo.
        </li>
        <li>
          Se puede suspender una cuenta que intente vulnerar el servicio o los datos de otra
          persona.
        </li>
      </ul>

      <h2>Costo</h2>
      <p>
        Durante la beta cerrada, SER no tiene costo. Si eso cambiara, se avisaría antes y nunca
        se cobraría por recuperar o descargar lo que ya escribiste.
      </p>

      <h2>Cambios a estos términos</h2>
      <p>
        Si cambian, se actualizará esta página y se avisará por correo a quienes tengan una
        cuenta activa antes de que el cambio tenga efecto.
      </p>

      <h2>Ley aplicable</h2>
      <p>
        Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Para cualquier
        controversia, escribe primero al correo de contacto que aparece en el aviso de
        privacidad: es un proyecto de una persona y casi todo se resuelve hablando.
      </p>

      <Caption>
        <Link href="/privacidad" className="underline underline-offset-4 hover:text-ink-soft">
          Aviso de privacidad
        </Link>
      </Caption>
    </LegalPage>
  );
}
