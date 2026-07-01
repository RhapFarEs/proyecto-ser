# DECISIONS

> Registro de las decisiones importantes de producto, diseño y arquitectura de Proyecto SER.
>
> Cada decisión debe responder tres preguntas:
>
> - ¿Qué decidimos?
> - ¿Por qué lo decidimos?
> - ¿Qué impacto tendrá en el proyecto?

---

# 2026-06-29

## D-001 · Nacimiento de Proyecto SER

### Decisión

El proyecto adopta oficialmente el nombre **Proyecto SER**.

SER significa:

- Sentimientos
- Espiritualidad
- Reencontrados

### Motivo

El proyecto dejó de ser una aplicación de productividad y pasó a ser un sistema para acompañar el crecimiento personal.

El nombre debía representar una transformación, no una herramienta.

### Impacto

Toda la identidad visual, filosofía y experiencia de usuario girarán alrededor del concepto de "ser antes que hacer".

---

## D-002 · Filosofía del producto

### Decisión

El principio rector del proyecto será:

> **Ser antes que hacer.**

Lema oficial:

> **Un día a la vez. Una vida con propósito.**

### Motivo

Las acciones, hábitos y resultados son consecuencia de la identidad.

Proyecto SER ayudará primero a recordar quién quiere ser el usuario antes de mostrar qué tiene que hacer.

### Impacto

Todas las futuras funcionalidades deberán reforzar este principio.

---

## D-003 · Pantalla principal

### Decisión

La pantalla principal del producto se llamará **Hoy**.

Internamente podrá seguir llamándose Dashboard durante el desarrollo.

### Motivo

La palabra "Dashboard" describe una interfaz.

La palabra "Hoy" describe una forma de vivir.

### Impacto

La navegación y la experiencia de usuario estarán centradas en el presente.

---

## D-004 · Filosofía de diseño

### Decisión

Proyecto SER adoptará un diseño minimalista inspirado en Apple, Linear y Raycast.

Principios:

- Mucho espacio en blanco.
- Tipografía protagonista.
- Eliminar elementos innecesarios.
- Priorizar la calma sobre la cantidad de información.

### Motivo

La aplicación debe sentirse como un espacio de reflexión, no como un panel de control.

### Impacto

Cada decisión de diseño deberá responder a la pregunta:

> ¿Esto transmite paz?

---

## D-005 · Arquitectura de componentes

### Decisión

Los componentes reutilizables vivirán en:

components/ui

Los componentes específicos de un módulo vivirán dentro de la carpeta de ese módulo.

### Motivo

Separar la lógica compartida de la lógica específica mejora la escalabilidad y el mantenimiento del proyecto.

### Impacto

Todos los módulos futuros seguirán la misma estructura.

---

## D-006 · Design System

### Decisión

Todo estilo repetido tres o más veces deberá convertirse en un componente reutilizable.

Ejemplos:

- Container
- Section
- SectionTitle

### Motivo

Evitar duplicación de código y mantener una única fuente de verdad para el diseño.

### Impacto

El mantenimiento del proyecto será más sencillo y consistente.

---

## D-007 · Filosofía de desarrollo

### Decisión

Los commits se realizarán únicamente cuando una funcionalidad completa esté terminada.

No se harán commits por cambios pequeños.

### Motivo

El historial de Git debe contar la evolución del producto y no una secuencia de modificaciones sin contexto.

### Impacto

Cada commit representará un hito del proyecto.

---

## D-008 · Contexto del día

### Decisión

La pantalla **Hoy** mostrará dos referencias temporales:

- La fecha del calendario.
- El progreso dentro del proceso personal (semana y día).

### Motivo

La fecha responde qué día es.

El progreso responde dónde estoy en mi camino.

Proyecto SER debe recordar ambas cosas.

### Impacto

El usuario siempre tendrá contexto sobre su avance personal antes de comenzar sus actividades.
---

## D-009 · La vida proviene del contenido, no de los efectos

### Decisión

Proyecto SER utilizará animaciones y efectos visuales únicamente para reforzar la experiencia del usuario.

La sensación de "vida" deberá provenir principalmente del contenido dinámico y del progreso personal del usuario.

### Motivo

Los efectos visuales generan impacto momentáneo.

El contenido con significado genera conexión a largo plazo.

Proyecto SER buscará transmitir calma, propósito y progreso mediante la evolución diaria de la aplicación.

### Impacto

La aplicación cobrará vida gracias a elementos como:

- Saludo dinámico.
- Fecha dinámica.
- Día y semana del proceso.
- Reflexión del día.
- Objetivo del día.
- Tareas correspondientes al día.

Las animaciones serán sutiles y solo servirán para acompañar la experiencia, nunca para convertirse en el centro de atención.
---

## D-010 · Proyecto SER se basa en rituales

### Decisión

Proyecto SER utilizará el concepto de **Ritual** para agrupar actividades con una intención común.

### Motivo

Una rutina describe repetición.

Un ritual describe intención.

El objetivo del proyecto no es únicamente ayudar al usuario a completar tareas, sino acompañarlo en prácticas con significado.

### Impacto

En el futuro existirán rituales como:

- Ritual de la Mañana.
- Ritual de la Noche.
- Ritual de Lectura.
- Ritual de Gratitud.
- Ritual de Domingo.

Cada ritual podrá contener varias actividades y tendrá un propósito específico dentro del crecimiento personal.

---

---

## D-011 · Una sola fuente de verdad por pantalla

### Decisión

Cada pantalla será responsable de obtener la información que necesita desde el dominio.

Los componentes de interfaz no consultarán directamente funciones de negocio; recibirán los datos mediante `props`.

### Motivo

Separar la obtención de datos de la presentación permite mantener una arquitectura más limpia, reutilizable y escalable.

La pantalla conoce el contexto completo del día; los componentes únicamente representan una parte de ese contexto.

### Impacto

El flujo de datos seguirá siempre el mismo patrón:

Página → Motor del Día → Componentes

Esto evitará duplicar llamadas a la lógica de negocio y facilitará futuras integraciones con bases de datos, APIs e inteligencia artificial.

---

## D-012 · Los componentes reflejan el dominio

### Decisión

Los componentes principales utilizarán nombres que representen conceptos del dominio de Proyecto SER y no términos genéricos de interfaz.

### Motivo

Los nombres del código deben hablar el mismo idioma que el producto.

Esto facilita la comprensión del proyecto y mantiene coherencia entre la documentación, el dominio y la implementación.

### Impacto

Se adoptan los siguientes nombres:

- QuoteSection → ReflectionSection
- GoalSection → IntentionSection
- TodaySection → RitualSection

Los nombres de los componentes deberán representar conceptos del dominio siempre que sea posible.

---

