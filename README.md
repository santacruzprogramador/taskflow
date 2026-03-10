# My Todos – Supabase

Aplicación web de gestión de tareas con autenticación OAuth (GitHub) utilizando Supabase como backend.

## 🌐 Demo

https://taskflow.vercel.app


## 🚀 Tecnologías

- HTML5
- CSS3
- JavaScript (Vanilla)
- Supabase
- GitHub OAuth

## 🔐 Características

- Autenticación con GitHub
- Persistencia automática de sesión
- Rutas protegidas según estado del usuario
- Redirección condicional automática
- Arquitectura modular en frontend
- Consola limpia y manejo estructurado de errores

## 🛡 Seguridad

- Protección de rutas en frontend
- Verificación única de sesión en `DOMContentLoaded`
- No almacenamiento de credenciales sensibles
- Uso de sesiones administradas por Supabase

## 🏗 Arquitectura

Separación de responsabilidades:

- `supabase-config.js` → Configuración única de Supabase
- `auth.js` → Lógica de autenticación
- `tasks.js` → CRUD de tareas
- `utils.js` → Funciones auxiliares

## 🗄 Base de Datos

El proyecto incluye `db.sql` con la estructura necesaria para crear las tablas en Supabase.

## 📦 Instalación

1. Clonar el repositorio
2. Crear proyecto en Supabase
3. Ejecutar `db.sql`
4. Configurar URL y clave pública en `supabase-config.js`
5. Ejecutar con Live Server

## 🎯 Objetivo del Proyecto

Proyecto desarrollado como práctica full stack para consolidar conocimientos en:

- Autenticación OAuth
- Protección de rutas
- Manejo de sesiones
- Organización modular del código
- Integración con backend as a service (Supabase)

## 📂 Estructura del Proyecto


taskflow
│
├── db.sql              # Script SQL para crear las tablas en Supabase
├── index.html          # Punto de entrada principal de la aplicación
├── README.md           # Documentación del proyecto
│
│
├── css
│   ├── auth.css        # Estilos para páginas de autenticación
│   ├── home.css        # Estilos del dashboard principal
│   ├── legal.css       # Estilos para páginas legales (privacy, terms)
│   └── styles.css      # Estilos globales y variables comunes
│
├── js
│   ├── auth.js             # Lógica de autenticación (login, sesión)
│   ├── supabase-config.js  # Configuración e inicialización de Supabase
│   ├── tasks.js            # Lógica principal del CRUD de tareas
│   └── utils.js            # Funciones auxiliares reutilizables
│
└── pages
    ├── auth.html           # Página de login
    ├── home.html           # Dashboard de tareas
    ├── privacy.html        # Política de privacidad
    ├── register.html       # Registro de usuario
    ├── reset-password.html # Restablecer contraseña
    └── terms.html          # Términos y condiciones


## 👨‍💻 Autor

José Alberto Santacruz  
Full Stack Developer (en formación)