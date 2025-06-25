# Plantillas de Calendario Personalizadas

Este directorio contiene las plantillas JSON para los calendarios PDF. Puedes agregar tus propias plantillas siguiendo el formato especificado.

## Formato de Plantilla

Cada plantilla debe ser un archivo JSON con la siguiente estructura:

```json
{
  "name": "Nombre de la Plantilla",
  "description": "Descripción de la plantilla",
  "preview": "ruta/a/imagen-preview.png",
  "styles": {
    "headerStyle": "estilos CSS para el encabezado del mes",
    "tableStyle": "estilos CSS para la tabla del calendario",
    "thStyle": "estilos CSS para los encabezados de días (Dom, Lun, etc.)",
    "tdStyle": "estilos CSS para las celdas de días",
    "eventStyle": "estilos CSS para los eventos dentro de las celdas",
    "dayNumberStyle": "estilos CSS para el número del día"
  }
}
```

## Propiedades de Estilos

### headerStyle
- Estilos para el título del mes (ej: "Enero 2024")
- Incluye: color, fuente, tamaño, alineación, márgenes

### tableStyle
- Estilos para la tabla principal del calendario
- Incluye: ancho, bordes, fuente, tamaño de texto

### thStyle
- Estilos para los encabezados de días de la semana
- Incluye: bordes, padding, color de fondo, alineación

### tdStyle
- Estilos para las celdas individuales de días
- Incluye: bordes, padding, altura fija (100px), alineación vertical

### eventStyle
- Estilos para los eventos dentro de cada celda
- Incluye: tamaño de fuente, márgenes, padding, color de fondo
- **Importante**: Incluir `word-wrap: break-word; overflow-wrap: break-word;` para que el texto se ajuste

### dayNumberStyle
- Estilos para el número del día en cada celda
- Incluye: peso de fuente, márgenes, tamaño, color

## Ejemplos de Plantillas

### Plantilla Clásica
- Diseño tradicional con bordes y colores suaves
- Fondo azul claro para eventos
- Bordes grises para la tabla

### Plantilla Moderna
- Diseño contemporáneo con gradientes
- Encabezados con gradiente azul
- Eventos con gradiente rojo

### Plantilla Minimalista
- Diseño limpio y simple
- Líneas sutiles
- Eventos con borde izquierdo de color

### Plantilla Colorida
- Diseño vibrante con colores llamativos
- Gradientes en encabezados y eventos
- Sombras de texto para efectos visuales

## Cómo Agregar una Nueva Plantilla

1. Crea un nuevo archivo JSON en este directorio
2. Usa el formato especificado arriba
3. Agrega una imagen de preview (opcional)
4. La plantilla aparecerá automáticamente en el selector

## Consejos para Diseñar Plantillas

### Para Texto de Eventos
- Usa `font-size: 8px` o `9px` para eventos
- Incluye `line-height: 1.1` o `1.2` para espaciado
- Agrega `word-wrap: break-word; overflow-wrap: break-word;` para que el texto se ajuste
- Usa `padding: 2px` o `3px` para espacio interno

### Para Celdas de Días
- Mantén `height: 100px` para consistencia
- Usa `vertical-align: top` para alinear contenido arriba
- Agrega `padding: 6px` o `8px` para espacio interno

### Para Encabezados
- Usa `text-align: center` para centrar
- Agrega `font-weight: bold` para destacar
- Considera usar gradientes para efectos visuales

## Compatibilidad

Las plantillas funcionan con:
- jsPDF para generación de PDF
- html2canvas para renderizado
- Navegadores modernos (Chrome, Firefox, Safari, Edge)

## Limitaciones

- Los gradientes CSS pueden no renderizarse igual en PDF
- Algunas fuentes web pueden no estar disponibles
- Los efectos de sombra pueden variar entre navegadores 