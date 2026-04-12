# SPEC.md - Landing Page CBVP K141 Caazapá

## 1. Concept & Vision

Una landing page que evoca la valentía, el sacrificio y el compromisoheroico de los bomberos voluntarios de Caazapá. La experiencia visual debe transmitir la intensidad de las emergencias combinadar con la calidez humana del servicio comunitario. Cada elemento comunica que estos hombres y mujeres son vecinos que arriesgan sus vidas por otros vecinos, creando un llamado emocional a apoyar a quienes nos protegen.

## 2. Design Language

### Aesthetic Direction
Institucional-heroico moderno: la solidez de una institución venerable combinada con la urgencia y dinamismo del trabajo de emergencia. Referencias visuales a señales de alerta, equipos de protección personal, y la iconografía tradicional de bomberos, pero ejecutada con elegancia contemporánea.

### Color Palette
- **Rojo Principal**: #B91C1C (rojo bomberil profundo)
- **Rojo Acento**: #DC2626 (rojo emergencia)
- **Blanco**: #FFFFFF
- **Negro primario**: #111827
- **Gris oscuro**: #1F2937
- **Gris claro**: #F3F4F6
- **Dorado acento**: #D97706 (para elementos de honor y distinción)

### Typography
- **Títulos**: Montserrat (700, 800) - autoridad y modernidad
- **Subtítulos**: Montserrat (600) - claridad jerárquica
- **Cuerpo**: Inter (400, 500) - legibilidad óptima
- **Destacados**: Montserrat (500) - énfasis emocional

### Spatial System
- Base unit: 8px
- Secciones: padding vertical 80px (desktop), 48px (mobile)
- Contenedor máximo: 1200px
- Grid: 12 columnas con gaps de 24px

### Motion Philosophy
- Transiciones suaves (300-400ms ease-out) para estados hover
- Animaciones de entrada con fade-up sutil (opacity + translateY)
- Efectos de parallax suave en hero
- Contadores animados para estadísticas
- Sin animaciones excesivas que distraigan del mensaje

### Visual Assets
- Iconos: Lucide Icons (línea, estilo consistente)
- Imágenes: Placeholders de alta calidad con gradientes en rojo/negro
- Decorativos: Líneas diagonales sutiles (referencia a señales de alerta)
- Texturas: Subtle grain overlay para profundidad

## 3. Layout & Structure

### Arquitectura de Página
1. **Header flotante** - Navegación sticky con blur backdrop
2. **Hero épico** - Full viewport con imagen de impacto y mensaje central
3. **Quiénes Somos** - Dos columnas: historia + valores con iconografía
4. **Qué Hacemos** - Grid de servicios con cards destacados
5. **Impacto** - Estadísticas grandes con contadores animados
6. **Cómo Ayudar** - Tres paths claros de participación
7. **Galería** - Grid masonry con lightbox
8. **Testimonios** - Carousel con voces de la comunidad
9. **Contacto** - Mapa + formulario + información
10. **Footer** - Institucional con links y redes

### Responsive Strategy
- Desktop: Layout completo con múltiples columnas
- Tablet (768px): Grid adaptado, navegación colapsada
- Mobile (480px): Stack vertical, menú hamburguesa, CTAs prominentes

## 4. Features & Interactions

### Hero Section
- Imagen de fondo con overlay gradiente rojo/negro
- Título animado con efecto de typewriter opcional
- Subtítulo con mensaje emocional
- Dos botones CTA: "Donar Ahora" (primario) y "Ser Voluntario" (secundario)
- Scroll indicator animado

### Navegación
- Logo + nombre del cuerpo
- Links: Inicio, Nosotros, Servicios, Impacto, Galería, Contacto
- Botón CTA de donación destacado
- Mobile: Menú hamburger con overlay fullscreen

### Sección Estadísticas
- 4 métricas principales con iconos
- Contadores que se animan al entrar en viewport
- Números grandes y bold
- Labels descriptivos

### Formulario de Contacto
- Campos: Nombre, Email, Teléfono, Mensaje
- Validación en tiempo real
- Feedback visual de envío
- Estados: default, focus, error, success

### Galería
- Grid responsive de imágenes
- Lightbox al hacer click
- Navegación entre imágenes
- Cerrar con X o click fuera

## 5. Component Inventory

### Botón Primario
- Background: #B91C1C
- Texto: blanco, Montserrat 600
- Padding: 16px 32px
- Border-radius: 8px
- Hover: brightness(1.1) + translateY(-2px) + shadow
- Active: brightness(0.95)

### Botón Secundario
- Background: transparent
- Borde: 2px blanco
- Texto: blanco
- Hover: background rgba(255,255,255,0.1)

### Card de Servicio
- Background: blanco
- Border-radius: 16px
- Shadow: 0 4px 20px rgba(0,0,0,0.1)
- Icono centrado arriba
- Título + descripción
- Hover: translateY(-8px) + shadow aumentada

### Card de Testimonio
- Background: gris claro
- Comillas decorativas
- Avatar + nombre + rol
- Quote del testimonio

### Input de Formulario
- Border: 1px gris claro
- Border-radius: 8px
- Padding: 16px
- Focus: border rojo + shadow

## 6. Technical Approach

### Stack
- HTML5 semántico
- CSS3 con variables custom properties
- JavaScript vanilla (ES6+)
- Sin frameworks externos (portabilidad máxima)

### Arquitectura CSS
- Variables para colores, espaciado, tipografía
- Mobile-first responsive
- BEM-like naming convention
- Animaciones con @keyframes

### JavaScript Features
- Intersection Observer para animaciones on-scroll
- Smooth scroll para navegación
- Contador animado para estadísticas
- Lightbox para galería
- Mobile menu toggle
- Form validation

### Performance
- CSS crítico inline
- Lazy loading para imágenes
- Fonts preloaded
- Sin dependencias pesadas
