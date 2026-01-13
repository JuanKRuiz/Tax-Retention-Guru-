# Changelog

Todas las modificaciones notables a este proyecto serán documentadas en este archivo.

## [v0.1.0] - 2026-01-13 (Configuración Inicial y Limpieza)

### ✨ Nuevas Características
- **Despliegue GitHub Pages**: Configuración de `vite.config.ts` (base path) y scripts de despliegue (`npm run deploy`) para publicar en `gh-pages`.
- **Modo BYOK (Bring Your Own Key)**: El Asesor IA ahora permite ingresar una API Key propia si no se detecta configuración de entorno.
- **Simulación Mejorada**: Nueva tarjeta de "Opción Más Económica" en la pestaña de Simulación para equilibrar el análisis visual frente a la "Opción Más Estable".

### 🔧 Ajustes y Mejoras
- **Anonimización**: Se eliminaron datos personales y referencias a salarios reales en el modo Demo.
- **Privacidad**: Eliminación completa de referencias internas corporativas ("LATAM Payroll", "Reglas Internas"). La IA ahora se basa estrictamente en el **Estatuto Tributario Colombiano** general.
- **Seguridad**: Actualización de `.gitignore` para excluir archivos de entorno sensibles.

### 🐛 Correcciones
- Solucionado error de parseo HTML en Vite causado por etiquetas `<style>` duplicadas en `index.html`.
