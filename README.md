# Yendo - Eventos Culturales Buenos Aires

Una plataforma web moderna para descubrir y gestionar eventos culturales en Buenos Aires. Permite filtrar eventos por fecha, lugar, precio y tipo, agregar eventos a un calendario personal, y descargar el calendario en formatos ICS y PDF.

## 🚀 Características

### Filtros Avanzados
- **Filtro de fechas**: Rango personalizable con inclusión hasta 6 AM del día siguiente
- **Filtro de lugares**: Búsqueda y selección múltiple de espacios culturales
- **Filtro de precios**: Rango de precios con soporte para eventos gratuitos
- **Filtro de tipos**: Categorización por tipo de evento (música, teatro, arte, etc.)
- **Filtro de distancia**: Radio personalizable desde ubicación seleccionada

### Gestión de Calendario
- **Agregar/quitar eventos**: Interfaz intuitiva para gestionar eventos seleccionados
- **Vista previa**: Modal con vista previa del calendario antes de descargar
- **Descarga ICS**: Formato compatible con Google Calendar, Outlook, etc.
- **Descarga PDF**: Múltiples plantillas personalizables (moderna, minimalista, colorida)

### Funcionalidades Adicionales
- **Mapa interactivo**: Visualización de eventos en mapa con filtro de distancia
- **Búsqueda en tiempo real**: Filtrado instantáneo por texto
- **Estadísticas**: Contador de eventos totales y filtrados
- **Reporte de errores**: Sistema para reportar problemas en eventos
- **Diseño responsive**: Optimizado para móviles y escritorio

## 🛠️ Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Framework CSS**: Bootstrap 5.3
- **Iconos**: Bootstrap Icons
- **Mapas**: Leaflet.js
- **PDF**: jsPDF + html2canvas
- **Despliegue**: Netlify

## 📦 Instalación Local

### Prerrequisitos
- Navegador web moderno
- Servidor web local (opcional)

### Pasos de instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/yendo.git
   cd yendo
   ```

2. **Ejecutar localmente**
   
   **Opción A: Servidor Python (recomendado)**
   ```bash
   python3 -m http.server 8000
   ```
   
   **Opción B: Servidor Node.js**
   ```bash
   npx serve .
   ```
   
   **Opción C: Abrir directamente**
   - Abrir `index.html` en el navegador

3. **Acceder a la aplicación**
   - Navegar a `http://localhost:8000` (Python) o `http://localhost:3000` (Node.js)

## 🚀 Despliegue en Netlify

### Opción 1: Despliegue desde GitHub (Recomendado)

1. **Subir a GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/yendo.git
   git push -u origin main
   ```

2. **Conectar con Netlify**
   - Ir a [netlify.com](https://netlify.com)
   - Hacer clic en "New site from Git"
   - Seleccionar GitHub y el repositorio `yendo`
   - Configurar:
     - **Build command**: (dejar vacío)
     - **Publish directory**: `.` (punto)
   - Hacer clic en "Deploy site"

### Opción 2: Despliegue manual

1. **Preparar archivos**
   - Asegurarse de que todos los archivos estén en el directorio raíz
   - Verificar que `index.html` esté en la raíz

2. **Subir a Netlify**
   - Ir a [netlify.com](https://netlify.com)
   - Arrastrar y soltar la carpeta del proyecto en el área de deploy

### Configuración de Netlify

El archivo `netlify.toml` ya está configurado con:
- Redirecciones para SPA
- Headers de seguridad
- Cache optimizado para archivos estáticos
- Configuración de Node.js

## 📁 Estructura del Proyecto

```
yendo/
├── index.html              # Página principal
├── script.js               # Lógica de la aplicación
├── styles.css              # Estilos CSS
├── package.json            # Dependencias (si aplica)
├── README.md               # Documentación
├── VERSION.md              # Historial de versiones
├── .gitignore              # Archivos ignorados por Git
├── netlify.toml            # Configuración de Netlify
├── data/                   # Datos de eventos y lugares
│   ├── events.json         # Eventos culturales
│   ├── places.json         # Lugares/espacios
│   └── icons/              # Iconos de lugares
└── templates/              # Plantillas PDF
    ├── default.json        # Plantilla por defecto
    ├── modern.json         # Plantilla moderna
    ├── minimal.json        # Plantilla minimalista
    └── colorful.json       # Plantilla colorida
```

## 🔧 Configuración

### Variables de Entorno
No se requieren variables de entorno para el despliegue básico.

### Personalización
- **Colores**: Editar variables CSS en `styles.css`
- **Plantillas PDF**: Modificar archivos JSON en `templates/`
- **Datos**: Actualizar `data/events.json` y `data/places.json`

## 📊 Datos

### Formato de Eventos
```json
{
  "title": "Nombre del evento",
  "start_datetime": "2025-01-15T20:00:00",
  "end_datetime": "2025-01-15T22:00:00",
  "placeName": "Nombre del lugar",
  "type": "music",
  "price": 1500,
  "description": "Descripción del evento",
  "url": "https://ejemplo.com/evento"
}
```

### Formato de Lugares
```json
{
  "name": "Nombre del lugar",
  "latitude": -34.6037,
  "longitude": -58.3816,
  "icon": "data/icons/icono.jpg"
}
```

## 🐛 Solución de Problemas

### Problemas Comunes

1. **Los eventos no se cargan**
   - Verificar que `data/events.json` existe y es válido
   - Revisar la consola del navegador para errores

2. **Los iconos no se muestran**
   - Verificar que las rutas en `data/places.json` sean correctas
   - Asegurarse de que los archivos de iconos existan en `data/icons/`

3. **El mapa no carga**
   - Verificar conexión a internet (requerido para Leaflet)
   - Revisar que las coordenadas en `data/places.json` sean válidas

4. **Problemas de despliegue en Netlify**
   - Verificar que `index.html` esté en la raíz del proyecto
   - Revisar los logs de build en Netlify

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo

---

**Yendo** - Descubriendo la cultura de Buenos Aires, un evento a la vez. 🎭✨ 