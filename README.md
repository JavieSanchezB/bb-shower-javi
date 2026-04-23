# Sistema de Invitaciones - Baby Shower

Este proyecto es un sistema web de invitaciones interactivas para un Baby Shower, con funcionalidades de administración, selección de regalos (mesa de regalos sugeridos) y listado de invitados. 

El proyecto está diseñado con un frontend estático (HTML, CSS, JS) y un backend Serverless en Node.js, configurado para desplegarse fácilmente en **Vercel** usando una base de datos **Turso** (SQLite).

## 🚀 Cómo probarlo localmente

Dado que el proyecto utiliza Serverless Functions (funciones sin servidor) en la carpeta `/api/` bajo la infraestructura de Vercel, la mejor forma de correrlo localmente es utilizando el **Vercel CLI**.

### Prerrequisitos
1. **Node.js** instalado en tu computadora.
2. Una cuenta en [Turso](https://turso.tech/) con una base de datos creada.
3. **Vercel CLI** instalado globalmente. Si no lo tienes, instálalo con:
   ```bash
   npm i -g vercel
   ```

### Pasos para ejecución local
1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar Variables de Entorno:**
   Crea un archivo `.env` en la raíz del proyecto (junto a `package.json`) y agrega tus credenciales de Turso:
   ```env
   TURSO_DATABASE_URL="libsql://tu-base-de-datos.turso.io"
   TURSO_AUTH_TOKEN="tu-token-de-autenticacion"
   ```

3. **Ejecutar el servidor de desarrollo:**
   Para emular el entorno de Vercel localmente, corre:
   ```bash
   vercel dev
   ```
   Esto levantará tu servidor local (usualmente en `http://localhost:3000`).

4. **Inicializar la base de datos:**
   Abre en tu navegador la siguiente ruta para crear las tablas necesarias en tu base de datos Turso:
   `http://localhost:3000/api/db-init`
   *(Solo necesitas hacer esto una vez por cada base de datos nueva).*

5. **¡Listo!** 
   Ya puedes ingresar a `http://localhost:3000` para ver la aplicación web. Usa el acceso administrador (`brika` / `Horus2126`) para cargar tus invitados y regalos.

---

## ☁️ Qué tener en cuenta para que funcione en Vercel

El proyecto ya cuenta con el archivo `vercel.json` que rutea correctamente la carpeta `/public` como frontend estático y la carpeta `/api` como backend Node.js.

Para desplegar y que funcione sin problemas, considera los siguientes puntos clave:

### 1. Variables de Entorno en Vercel
Las funciones de `/api/` no tendrán acceso a la base de datos a menos que configures las variables en Vercel.
- Ve al Dashboard de tu proyecto en Vercel.
- Ve a **Settings (Configuración)** > **Environment Variables**.
- Añade allí las variables `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`.
- Realiza un nuevo despliegue (Redeploy) si las agregaste después de haber publicado la página.

### 2. Inicialización de Tablas en Producción
Si usas una base de datos nueva en producción, no olvides inicializar las tablas luego de que Vercel termine el despliegue.
- Visita: `https://<tu-dominio-vercel>.vercel.app/api/db-init`
- Deberías ver un mensaje de éxito.

### 3. Naturaleza Stateless (Sin estado)
Las funciones Serverless de Vercel se ejecutan bajo demanda y se destruyen al terminar. Por tanto, **el proyecto usa Turso como almacenamiento persistente**. Los archivos `invitados.json` y `regalos.json` que pudieras ver en el repositorio son de respaldo y no deben usarse como base de datos en Vercel, ya que cualquier cambio en ellos en tiempo de ejecución se borraría. El código está preparado para apoyarse 100% en Turso a través de los endpoints correspondientes.

### 4. Permisos de Vercel CLI
Si al ejecutar `vercel dev` localmente Vercel te pide loguearte, asegúrate de seguir los pasos de su consola para enlazar tu proyecto.

---

### 🎨 Diseño y Funcionalidades
- **URL Individual:** Cada invitado recibe un link `?id=X` que muestra su tarjeta personalizada (con su nombre y cupos) e interactúa directamente sin pedir login.
- **Mesa de Regalos:** Los invitados pueden ver y separar regalos sugeridos; el backend guarda esto para evitar regalos duplicados.
- **Impresión:** Se han incluido estilos `@media print` para exportar a PDF o imprimir tarjetas de forma óptima sin UI adicional.
