# app-movil-centro.educativo
# 📱 EduCore Systems - App Móvil

**Plataforma Móvil de Gestión Institucional**

> **Sobre este repositorio:** Este es el código fuente de la aplicación móvil de EduCore Systems. Complementa a la plataforma web ([web-centro-educativo](https://github.com/EduCore-Systems/web-centro-educativo)) y está diseñada como una aplicación móvil nativa, utilizando un enfoque declarativo y basado en componentes, optimizado para un desarrollo ágil y escalable.

## 🎯 Objetivo del Proyecto

EduCore Systems busca modernizar y centralizar la gestión del centro educativo. A través de esta aplicación móvil, los distintos actores de la institución (Directivos, Docentes y Alumnos) podrán acceder a sus paneles correspondientes de forma rápida, segura y desde cualquier lugar.

## 🛠️ Stack Tecnológico

Seleccionamos tecnologías modernas que nos permiten iterar rápido y mantener un código limpio:

- **Core Framework:** React Native
- **Entorno & Build:** Expo (compatible con Expo Go)
- **Lenguaje:** JavaScript (ES6+) / JSX
- **Base de Datos & Auth:** Firebase SDK
- **Enrutamiento:** React Navigation (Próximamente)

## 🚀 Instalación

Sigue estos pasos para ejecutar el proyecto localmente:

1. Clona este repositorio:

   ```bash
   git clone https://github.com/EduCore-Systems/app-movil-centro.educativo.git
   cd app-movil-centro.educativo
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Inicia la aplicación con Expo:

   ```bash
   npm start
   ```

4. Abre la app en tu dispositivo o emulador:
   - Escanea el código QR con Expo Go
   - O presiona `a` para Android / `i` para iOS en la terminal

> Asegúrate de tener instalado Node.js y npm.

## 🏗️ Arquitectura del Frontend

El proyecto sigue una estructura modular para mantener la escalabilidad. Todo el código de desarrollo vivirá dentro del directorio `src/`:

```
app-movil-centro.educativo/
├── src/
│   ├── components/  # Botones, inputs, tarjetas y UI reutilizable
│   ├── screens/     # Vistas principales (Login, Dashboard, Perfil)
│   ├── navigation/  # Configuración de rutas y menús
│   ├── theme/       # Paleta de colores institucional y tipografías
│   └── services/    # Lógica de conexión con Firebase
├── App.js           # Punto de entrada de la aplicación
└── app.json         # Configuración global de Expo
```

## 🤝 Flujo de Trabajo (Git Flow)

Para mantener el código estable y evitar conflictos, nos manejamos con estas reglas:

- **`main`:** Solo código estable y de producción. No se programa acá.
- **`develop`:** Rama principal de desarrollo. Todo nuestro código se une acá.
- **Ramas de trabajo:** Cada cambio se hace en una rama propia creada desde `develop` (por ejemplo `feature/login`).
- **Pull Requests:** Todo cambio entra a `develop` (y de `develop` a `main`) mediante un Pull Request que debe ser aprobado por el otro desarrollador.

### Commits Convencionales

- `feat:` Para agregar una nueva pantalla o funcionalidad.
- `ui:` Para avances de maquetación y diseño.
- `fix:` Para solucionar errores o bugs.
- `docs:` Para actualizar este README o documentación.

## 👥 Integrantes

- Damián Ramírez.
- Fabricio Alegre.