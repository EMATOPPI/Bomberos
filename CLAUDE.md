# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto: Landing Page CBVP K141 Caazapá

Landing page del Cuerpo de Bomberos Voluntarios del Paraguay - Cuartel K141 Caazapá. Sitio institucional para mostrar servicios, impacto y formas de apoyar.

## Tech Stack

- **HTML5** - Semántico, sin frameworks
- **CSS3** - Custom properties, BEM-like naming, mobile-first responsive
- **JavaScript vanilla (ES6+)** - Module pattern con IIFEs, sin bundler
- **EmailJS** - Servicio de correo integrado (publicKey: Or9eKFJRX2Et2VoRF)

No hay package.json ni bundler. El proyecto es estático y portable.

## Commands

```bash
# Ejecutar tests (Playwright)
node test.js

# Abrir el sitio directamente (archivo HTML)
open index.html
```

## Arquitectura JavaScript

El código en `js/main.js` usa un module pattern organizado en módulos separados:

| Módulo | Responsabilidad |
|--------|-----------------|
| `Utils` | Helpers: debounce, smoothScrollTo, isInViewport |
| `UIModule` | Header scroll, menú móvil (toggle, close) |
| `NavigationModule` | Smooth scroll para links internos (`a[href^="#"]`) |
| `AnimationModule` | IntersectionObserver para fade-in on scroll + contadores animados |
| `GalleryModule` | Lightbox (open/close, backdrop click, escape key) |
| `FormModule` | Validación y envío de formularios (contacto + newsletter) via EmailJS |

Todos se inicializan en `App.init()` al cargar el DOM.

## Estructura CSS (`css/styles.css`)

- Variables CSS en `:root` para colores, espaciado (base 8px), tipografía
- Clases con prefijo por componente: `.header__*`, `.hero__*`, `.section__*`, `.btn--*`
- Mobile-first: media queries de `480px` (tablet) y `768px` (desktop)
- Máximo contenedor: 1200px con padding vertical 80px desktop / 48px mobile

## Secciones de la Página

1. Header (sticky con blur backdrop)
2. Hero (full viewport)
3. Nosotros (dos columnas: imagen + contenido)
4. Servicios (grid de cards)
5. Impacto (estadísticas con contadores animados via `data-count`)
6. Cómo Ayudar (3 cards: Donar, Voluntario, Difusión)
7. Galería (grid con lightbox)
8. Testimonios
9. Contacto (info + formulario)
10. Footer

## Notas Importantes

- EmailJS está hardcodeado con un publicKey - no exponer en repos público
- Los contadores se animan al entrar en viewport (`#impacto`)
- Galería usa lightbox simple con `[data-lightbox]`
- Formulario de contacto usa EmailJS para enviar (service: `service_oarbwik`, template: `template_9heno5c`)