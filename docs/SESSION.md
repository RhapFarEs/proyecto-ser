# CURRENT SPRINT

## Sprint 5 · Contenido Vivo

### Objetivo

Conseguir que toda la pantalla "Hoy" dependa del Motor del Día (`getToday()`), eliminando el contenido hardcodeado y dejando una base sólida para el crecimiento del proyecto.

---

# Estado actual

## Arquitectura

✅ Motor del Día (`getToday`)

✅ Modelos:

- Today
- Day
- Ritual
- Activity

✅ Separación de responsabilidades:

- greeting.ts
- date.ts
- progress.ts
- day.ts
- today.ts

---

## Interfaz

### Completado

- GreetingSection consume `today`.
- ReflectionSection consume `today`.
- IntentionSection consume `today`.
- FooterSection creado.
- Componentes renombrados para reflejar el dominio:
  - ReflectionSection
  - RitualSection
  - IntentionSection
- RitualSection ahora consume `today` y renderiza dinámicamente las actividades mediante `.map()`.


### Pendiente

- Mostrar "Semana X · Día Y" debajo de la fecha.
- Refinar la experiencia visual de la pantalla Hoy.

---

# Criterio para cerrar el Sprint

La pantalla Hoy deberá:

- Obtener toda su información desde `getToday()`.
- No contener contenido hardcodeado en los componentes.
- Tener una jerarquía visual clara y coherente con la filosofía de Proyecto SER.
- Estar lista para realizar el primer commit del proyecto.

---

# Próxima tarea

Convertir `RitualSection` para que renderice dinámicamente las actividades del ritual usando la información proporcionada por `today.day.ritual`.