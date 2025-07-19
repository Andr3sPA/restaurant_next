# Sistema de Gestión de Restaurante

### Miembros del Equipo

- Andrés Darío Peña Asprilla
- Sneyder Buitrago Gonzalez
- Wilmer Santiago Soto Vidal

### Enlace de despliegue:

[https://empanadas-restaurante.vercel.app/](https://empanadas-restaurante.vercel.app/)

## Descripcion del proyecto

Este es un proyecto full-stack para la gestión de un restaurante, construido con el stack T3. La aplicación permite a los clientes ver el menú y realizar pedidos, mientras que el personal del restaurante puede gestionar los pedidos, el inventario y otros aspectos del negocio.

## Características Principales

- **Visualización del Menú:** Los usuarios pueden explorar los platos disponibles con descripciones, precios e imágenes.
- **Gestión de Pedidos:** Los clientes pueden crear pedidos y los empleados pueden actualizar su estado (pendiente, en preparación, listo, etc.).
- **Sistema de Autenticación:** Soporte para registro e inicio de sesión de usuarios con diferentes roles.
- **Roles y Permisos:** El sistema define tres roles de usuario (`CLIENTE`, `EMPLEADO`, `ADMINISTRADOR`) con diferentes niveles de acceso.
- **Panel de Administración:** Paneles dedicados para que empleados y administradores gestionen el restaurante.

### Roles y Permisos

- **Cliente:**

  - `Inicio`: Página principal y visualización del menú.
  - Realizar y pagar pedidos.

- **Empleado:**

  - `Inicio`: Vista principal.
  - `Pedidos`: Gestión de los pedidos de los clientes.
  - `Inventario`: Administración de los platos del menú.
  - `Añadir plato`: Formulario para registrar nuevos platos.

- **Administrador:**
  - Todos los permisos de un `Empleado`.
  - `Usuarios`: Gestión de los usuarios del sistema.
  - `Métricas`: Visualización de datos y estadísticas del negocio.

## Stack Tecnológico

Este proyecto está construido con las siguientes tecnologías:

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Cómo Empezar

Para ejecutar este proyecto localmente, sigue estos pasos:

1.  **Clonar el repositorio**

    ```bash
    git clone https://github.com/tu-usuario/tu-repositorio.git
    cd tu-repositorio
    ```

2.  **Instalar dependencias**

    ```bash
    npm install
    ```

3.  **Configurar las variables de entorno**
    Crea un archivo `.env` en la raíz del proyecto y añade las variables necesarias, como la URL de la base de datos.

    ```env
    # Base de datos
    DATABASE_URL="postgresql://..."
    DIRECT_URL="postgresql://..."

    # Autenticación
    NEXTAUTH_SECRET="tu_secreto"
    NEXTAUTH_URL="http://localhost:3000"

    # Cloudinary para almacenamiento de imágenes
    CLOUDINARY_CLOUD_NAME="tu_cloud_name"
    CLOUDINARY_API_KEY="tu_api_key"
    CLOUDINARY_API_SECRET="tu_api_secret"
    CLOUDINARY_URL="cloudinary://..."
    ```

4.  **Aplicar las migraciones de la base de datos**

    ```bash
    npx prisma migrate dev
    ```

5.  **Iniciar el servidor de desarrollo**
    ```bash
    npm run dev
    ```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.
