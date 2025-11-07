# Tipos de Nodos Disponibles para Grafos

## Lista de Tipos de Nodos

### 🧑 person (Persona)
- **Emoji**: 🧑 (persona neutral - representa hombres y mujeres)
- **Color**: Azul (#2563eb)
- **Uso**: Identidades de personas, usuarios, clientes

### 📱 phone (Teléfono)
- **Emoji**: 📱
- **Color**: Verde (#059669)
- **Uso**: Números de teléfono, líneas móviles

### 📧 email (Correo)
- **Emoji**: 📧
- **Color**: Rojo (#dc2626)
- **Uso**: Direcciones de correo electrónico

### 🆔 id (Documento)
- **Emoji**: 🆔
- **Color**: Morado (#7c3aed)
- **Uso**: Documentos de identidad, cédulas, pasaportes

### 💻 device (Dispositivo)
- **Emoji**: 💻
- **Color**: Rosa (#db2777)
- **Uso**: Dispositivos electrónicos, computadores, tablets

### 📍 location (Ubicación)
- **Emoji**: 📍
- **Color**: Cian (#0891b2)
- **Uso**: Ubicaciones geográficas, coordenadas GPS

### 🏠 address (Dirección)
- **Emoji**: 🏠
- **Color**: Naranja (#ea580c)
- **Uso**: Direcciones físicas, domicilios

### 🏢 company (Empresa)
- **Emoji**: 🏢
- **Color**: Índigo (#4f46e5)
- **Uso**: Empresas, organizaciones, compañías

### 🏦 bank (Banco)
- **Emoji**: 🏦
- **Color**: Verde (#059669)
- **Uso**: Entidades bancarias, cuentas bancarias

### 💳 card (Tarjeta)
- **Emoji**: 💳
- **Color**: Azul cielo (#0284c7)
- **Uso**: Tarjetas de crédito/débito

### 💰 transaction (Transacción)
- **Emoji**: 💰
- **Color**: Amarillo (#ca8a04)
- **Uso**: Transacciones financieras, pagos

### 🌐 ip (Dirección IP)
- **Emoji**: 🌐
- **Color**: Cian (#0891b2)
- **Uso**: Direcciones IP, conexiones de red

## Estructura JSON Ejemplo

```json
{
  "nodes": [
    {
      "id": "p1",
      "label": "María González",
      "type": "person"
    },
    {
      "id": "tel1",
      "label": "+57 300-1234567",
      "type": "phone"
    },
    {
      "id": "email1",
      "label": "maria@example.com",
      "type": "email"
    },
    {
      "id": "doc1",
      "label": "CC-1234567",
      "type": "id"
    }
  ],
  "links": [
    {
      "source": "p1",
      "target": "tel1",
      "strength": 0.95
    },
    {
      "source": "p1",
      "target": "email1",
      "strength": 0.90
    },
    {
      "source": "p1",
      "target": "doc1",
      "strength": 1.0
    }
  ]
}
```

## Notas sobre `strength` (Fuerza de Conexión)

- Valor entre 0 y 1
- Se muestra como porcentaje en el grafo (ej: 0.95 = 95%)
- Afecta el grosor de la línea de conexión
- **0.9 - 1.0**: Conexión muy fuerte (línea más gruesa)
- **0.7 - 0.89**: Conexión fuerte
- **0.5 - 0.69**: Conexión moderada
- **0.3 - 0.49**: Conexión débil
- **0 - 0.29**: Conexión muy débil (línea más delgada)

## Estilo Visual

- **Fondo**: Oscuro (mejor contraste y aspecto profesional)
- **Nodos**: Círculos grandes con emojis y etiquetas blancas
- **Conexiones**: Líneas moradas con porcentajes
- **Texto**: Blanco para etiquetas principales, gris para tipos
- **Efectos**: Sombras suaves para profundidad

