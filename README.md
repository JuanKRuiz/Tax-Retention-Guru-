# Retención Guru 2026 🇨🇴 <!-- Cambio para reiniciar despliegue -->

Herramienta web especializada para el cálculo, comparación y simulación de procedimientos de Retención en la Fuente en Colombia (Año Fiscal 2026). Diseñada específicamente para ayudar a empleados a tomar la mejor decisión entre el Procedimiento 1 (Mensual) y el Procedimiento 2 (Fijo Semestral).

![React](https://img.shields.io/badge/React-19.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)
![Gemini](https://img.shields.io/badge/AI-Gemini%20Flash-orange)

## ✨ Características Principales

### 1. Calculadora Comparativa
- **Cálculo automático** de Retención por Procedimiento 1 y 2 simultáneamente.
- Soporte para **Salario Integral** y Ordinario.
- Depuración completa de la base gravable:
  - Aportes a Salud, Pensión y Fondo de Solidaridad.
  - Deducciones por Dependientes, Intereses de Vivienda y Medicina Prepagada.
  - Rentas exentas (AFC, Pensión Voluntaria, 25% exento).
  - Aplicación automática del límite global del 40%.

### 2. Simulador Anual (Mes a Mes)
- Proyección de ingresos variables (bonos, comisiones, stocks).
- Cálculo de "Estabilidad de Flujo de Caja" para recomendar la opción menos volátil.
- Gráficos interactivos de acumulados anuales.
- Carga de escenarios demo con un solo clic.

### 3. Asesor IA (Gemini)
- Chatbot integrado con contexto legal colombiano (Estatuto Tributario 2026).
- Responde dudas sobre fechas límite, normatividad y reglas específicas (Estatuto Tributario).

## 🚀 Tecnologías

- **Frontend:** React + TypeScript + Vite.
- **Estilos:** Tailwind CSS + Lucide React (Iconos).
- **Gráficos:** Recharts.
- **IA:** Google GenAI SDK (Gemini 1.5 Flash).

## 🛠️ Instalación y Uso Local

Sigue estos pasos para ejecutar el proyecto en tu máquina:

1. **Clonar el repositorio e instalar dependencias:**
   ```bash
   git clone https://github.com/JuanKRuiz/Tax-Retention-Guru-.git
   cd Tax-Retention-Guru-
   npm install
   ```

2. **Configurar API Key (Opcional):**
   - Crea un archivo `.env` en la raíz del proyecto.
   - Agrega tu clave de Google Gemini (si quieres que el Asesor IA funcione por defecto):
     ```env
     GEMINI_API_KEY=tu_api_key_aqui
     ```
   - *Nota:* Si no configuras esto, la app tiene un modo **BYOK (Bring Your Own Key)** que pedirá la clave al usuario en la interfaz.

3. **Ejecutar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🌍 Despliegue Automático (CI/CD)

Este proyecto usa **GitHub Actions** para desplegar automáticamente.

1. **Cómo actualizar el sitio:**
   Simplemente sube tus cambios a la rama `main`:
   ```bash
   git add .
   git commit -m "Descripción de los cambios"
   git push origin main
   ```
   
   Automáticamente se iniciará un proceso que:
   - Instala dependencias.
   - Construye la aplicación (`npm run build`).
   - Sube la carpeta resultante a la rama `gh-pages`.

2. **Verificación:**
   - La actualización tardará unos 1-2 minutos.
   - Puedes ver el progreso en la pestaña **Actions** de tu repositorio.
   - Tu sitio se actualizará solo en: `https://TU_USUARIO.github.io/Tax-Retention-Guru-/`

## ⚖️ Descargo de Responsabilidad

Esta herramienta es un **simulador con fines educativos e informativos**.
- **No soy contador público.**
- Los cálculos están basados en la normativa proyectada para 2026 (UVT $52.374).
- No me hago responsable por decisiones financieras tomadas basadas en estos resultados. Se recomienda consultar con un experto tributario.

## 👤 Autor

**JuanKRuiz**
- 📧 [juank.ruiz@gmail.com](mailto:juank.ruiz@gmail.com)
- 📧 [juankruiz@google.com](mailto:juankruiz@google.com)
- 💼 [LinkedIn](https://www.linkedin.com/in/juankruiz)

---
© 2026 Retención Guru. Todos los derechos reservados.