import Link from "next/link";

import LegalPage from "@/components/ui/LegalPage";
import { Caption } from "@/components/ui/Typography";

export const metadata = {
  title: "Aviso de privacidad · Proyecto SER",
};

/*
  Every statement here describes what the code actually does today. Where SER
  does not do something — cifrado de extremo a extremo, analítica, respaldos,
  periodo de gracia al eliminar — this says so plainly instead of leaving it
  unmentioned. Anything that changes in the product has to change here first.
*/
export default function PrivacyPage() {
  return (
    <LegalPage
      title="Aviso de privacidad"
      subtitle="Qué guarda SER, dónde vive y qué puedes hacer con ello."
      updatedAt="6 de agosto de 2026"
    >
      <p>
        Este aviso se emite conforme a la Ley Federal de Protección de Datos Personales en
        Posesión de los Particulares. Está escrito en lenguaje sencillo a propósito: describe
        cómo funciona SER hoy, no cómo nos gustaría que funcionara.
      </p>

      <h2>Quién es responsable</h2>
      <p>
        Proyecto SER es un proyecto personal, operado por una sola persona.
      </p>
      <ul>
        <li>
          <strong>Responsable:</strong> Jacobo Rivera Fares.
        </li>
        <li>
          <strong>Contacto:</strong>{" "}
          <a
            href="mailto:jacobo.rivera.fares97@gmail.com"
            className="underline underline-offset-4 hover:text-ink"
          >
            jacobo.rivera.fares97@gmail.com
          </a>
          .
        </li>
        <li>
          <strong>Domicilio:</strong> disponible a solicitud, escribiendo al correo anterior.
        </li>
      </ul>

      <h2>Qué datos se guardan</h2>
      <ul>
        <li>
          <strong>De tu cuenta de Google:</strong> tu correo electrónico, tu nombre y la foto
          de perfil que Google publica. SER no recibe ni guarda tu contraseña de Google.
        </li>
        <li>
          <strong>Lo que escribes:</strong> tus notas del diario, la intención de cada día, tus
          reflexiones semanales, tu dirección personal, tus prácticas y tus áreas de vida.
        </li>
        <li>
          <strong>Tu perfil dentro de SER:</strong> el nombre con el que quieres que te
          llamemos, tu cumpleaños si decides ponerlo, la fecha en que empezaste y la zona
          horaria de tu dispositivo.
        </li>
        <li>
          <strong>Si envías un comentario:</strong> tu mensaje, la pantalla desde la que
          escribiste, la versión de la aplicación, y si usabas un teléfono o una computadora,
          con su sistema operativo y navegador.
        </li>
      </ul>

      <h2>Para qué se usan</h2>
      <p>
        Para una sola cosa: que puedas escribir y volver a leer lo tuyo, en cualquiera de tus
        dispositivos. El correo se usa para identificar tu cuenta al iniciar sesión. Los
        comentarios se usan para arreglar lo que esté fallando.
      </p>

      <h2>Qué no se hace</h2>
      <p>Esto importa tanto como lo anterior, así que va explícito:</p>
      <ul>
        <li>
          <strong>Nadie lee lo que escribes.</strong> Ni el responsable, ni ningún modelo de
          inteligencia artificial. SER no tiene ninguna función que analice, resuma o
          interprete tu archivo.
        </li>
        <li>
          <strong>No hay analítica ni rastreo.</strong> SER no tiene herramientas de medición
          de ningún tipo: no registra cuántas veces abres la aplicación, cuánto tiempo pasas en
          ella ni qué buscas.
        </li>
        <li>
          <strong>No hay publicidad</strong> y tus datos no se venden ni se comparten con nadie
          con fines comerciales.
        </li>
        <li>
          <strong>No hay cookies de rastreo.</strong> Tu sesión se guarda en tu propio
          navegador para no pedirte iniciar sesión cada vez.
        </li>
      </ul>

      <h2>Dónde viven tus datos</h2>
      <ul>
        <li>
          <strong>En tu dispositivo, primero.</strong> Todo lo que escribes se guarda en el
          almacenamiento local de tu navegador antes que en ningún otro lugar. Por eso SER
          funciona sin conexión.
        </li>
        <li>
          <strong>En Supabase.</strong> La copia sincronizada vive en una base de datos de
          Supabase, protegida por reglas que hacen que cada cuenta solo pueda leer y escribir
          sus propias filas.
        </li>
        <li>
          <strong>Tu foto de perfil es pública.</strong> Se guarda en un almacenamiento
          abierto, en una dirección derivada del identificador de tu cuenta. Cualquiera que
          conozca ese identificador puede verla sin iniciar sesión. Solo tú puedes cambiarla o
          borrarla. Si prefieres que no exista, no subas ninguna: SER usará la letra inicial de
          tu nombre.
        </li>
      </ul>

      <h2>Quién más interviene</h2>
      <p>
        SER se apoya en dos servicios para funcionar. No reciben tus datos para usarlos por su
        cuenta; los procesan para prestar el servicio:
      </p>
      <ul>
        <li>
          <strong>Google:</strong> verifica quién eres al iniciar sesión.
        </li>
        <li>
          <strong>Supabase:</strong> guarda la base de datos y la foto de perfil.
        </li>
      </ul>
      <p>
        Ambos operan servidores fuera de México, por lo que tus datos se almacenan en el
        extranjero. Al usar SER aceptas esa transferencia, que existe únicamente para prestarte
        el servicio.
      </p>

      <h2>Cifrado</h2>
      <p>
        La conexión entre tu dispositivo y los servidores va cifrada, y Supabase cifra los
        datos almacenados. <strong>SER no tiene cifrado de extremo a extremo.</strong> Eso
        significa que, técnicamente, quien administra la base de datos podría abrir lo que
        escribiste. La promesa de que nadie lo lee es una decisión y una política, no un
        impedimento técnico. Si eso no te parece suficiente para lo que quieres escribir, es
        razonable que no lo escribas aquí.
      </p>

      <h2>Tus derechos</h2>
      <p>
        Puedes acceder, rectificar, cancelar u oponerte al uso de tus datos. Tres de esas
        cuatro cosas no requieren pedir permiso a nadie: están dentro de la aplicación.
      </p>
      <ul>
        <li>
          <strong>Acceso:</strong> Más → <em>Descargar mi archivo</em>. Obtienes todo lo que
          has escrito, en un archivo legible sin SER, al instante y sin conexión.
        </li>
        <li>
          <strong>Rectificación:</strong> puedes editar cualquier nota de cualquier día, tu
          intención, tus reflexiones y tu perfil, directamente en la aplicación.
        </li>
        <li>
          <strong>Cancelación:</strong> Más → <em>Eliminar mi cuenta</em>. Borra tu cuenta,
          todo lo que escribiste y tu foto. Es inmediato, no hay periodo de gracia y no hay
          copia de respaldo: nadie puede recuperarlo después, tampoco el responsable.
        </li>
        <li>
          <strong>Oposición:</strong> escribe al correo de contacto.
        </li>
      </ul>
      <p>
        Si prefieres ejercer cualquiera de estos derechos por correo, escribe a la dirección de
        contacto. Se te responderá en un plazo máximo de veinte días hábiles.
      </p>

      <h2>Cuánto tiempo se conservan</h2>
      <p>
        Hasta que elimines tu cuenta. No hay borrado automático por inactividad: si dejas de
        usar SER durante años, lo que escribiste sigue ahí esperándote.
      </p>

      <h2>Menores de edad</h2>
      <p>
        SER no está dirigido a menores de edad y no se recaban datos de menores de forma
        intencional.
      </p>

      <h2>Cambios a este aviso</h2>
      <p>
        Si algo de esto cambia, se actualizará esta página y se avisará por correo a quienes
        tengan una cuenta activa antes de que el cambio tenga efecto.
      </p>

      <h2>Sobre la fase de pruebas</h2>
      <p>
        SER está en beta cerrada. Puede fallar. No lo uses como tu única copia de nada
        importante: descarga tu archivo de vez en cuando.
      </p>

      <Caption>
        <Link href="/terminos" className="underline underline-offset-4 hover:text-ink-soft">
          Términos del servicio
        </Link>
      </Caption>
    </LegalPage>
  );
}
