# SINMAM API Backend

API backend para el sistema de monitoreo de ritmo cardíaco SINMAM.

## 🚀 Inicio Rápido

### Requisitos
- Node.js 16+ 
- npm o yarn

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd UM-SINMAM-Backend
   ```

2. **Instalar dependencias**
   ```bash
**Para obtener estadísticas:**

```javascript
const fetchHeartRateStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/heart-rate/stats`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching heart rate stats:', error);
    throw error;
  }
};

// Obtener estadísticas cada 15 segundos
setInterval(fetchHeartRateStats, 15000);
``` ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```

4. **Ejecutar el servidor**
   ```bash
   # Desarrollo
   npm run dev
   
   # Producción
   npm start
   ```

El servidor estará disponible en `http://localhost:3001`

## 📋 Endpoints de la API

### Envío de Datos de Ritmo Cardíaco
**POST** `/api/heart-rate/reading`

Recibe una nueva lectura de ritmo cardíaco y la procesa automáticamente.

**Cuerpo de la petición:**
```json
{
  "pulse": 85
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Heart rate reading processed successfully",
  "reading": {
    "id": 1,
    "hour": "14:30",
    "pulse": 85,
    "isRisky": false,
    "timestamp": "2025-07-06T14:30:00Z"
  },
  "stats": {
    "last5Minutes": 85,
    "last15Minutes": 85,
    "last30Minutes": 85,
    "current": 85,
    "lastUpdated": "14:30:25",
    "totalReadings": 1,
    "hasData": true
  }
}
```

**Respuesta de error (400):**
```json
{
  "error": "Invalid heart rate data",
  "message": "Heart rate must be a number between 30 and 250"
}
```

### Estadísticas de Ritmo Cardíaco
**GET** `/api/heart-rate/stats`

Retorna estadísticas de ritmo cardíaco incluyendo promedios para diferentes períodos de tiempo.

**Respuesta:**
```json
{
  "last5Minutes": 95,
  "last15Minutes": 92,
  "last30Minutes": 88,
  "current": 98,
  "lastUpdated": "14:30:25",
  "totalReadings": 25,
  "hasData": true
}
```

**Nota:** Los valores pueden ser `null` si no hay datos suficientes para el período solicitado.

### Estadísticas Detalladas
**GET** `/api/heart-rate/statistics`

Retorna estadísticas detalladas incluyendo conteos de lecturas normales y riesgosas.

**Respuesta:**
```json
{
  "last5Minutes": 95,
  "last15Minutes": 92,
  "last30Minutes": 88,
  "current": 98,
  "lastUpdated": "14:30:25",
  "totalReadings": 25,
  "hasData": true,
  "readingCount": {
    "total": 25,
    "risky": 8,
    "normal": 17,
    "riskyPercentage": 32
  },
  "dataAvailable": true
}
```

### Historial de Lecturas
**GET** `/api/heart-rate/readings`

Retorna las lecturas recientes de ritmo cardíaco.

**Parámetros de consulta:**
- `limit` (opcional): Número máximo de lecturas a retornar (1-100, default: 20)
- `since` (opcional): Timestamp ISO 8601 para filtrar lecturas desde una fecha específica

**Respuesta:**
```json
[
  {
    "id": 1,
    "hour": "14:30",
    "pulse": 110,
    "isRisky": false,
    "timestamp": "2025-01-11T14:30:00Z"
  },
  {
    "id": 2,
    "hour": "14:15",
    "pulse": 125,
    "isRisky": true,
    "timestamp": "2025-01-11T14:15:00Z"
  }
]
```

### Lectura Actual
**GET** `/api/heart-rate/current`

Retorna la lectura actual de ritmo cardíaco.

**Respuesta:**
```json
{
  "current": 98,
  "lastUpdated": "14:30:25",
  "timestamp": "2025-01-11T14:30:00Z"
}
```

### Estado de Salud
**GET** `/health`

Endpoint para verificar el estado de la API.

**Respuesta:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-11T14:30:00Z",
  "version": "1.0.0"
}
```

## 🏗️ Estructura del Proyecto

```
UM-SINMAM-Backend/
├── server.js                 # Punto de entrada de la aplicación
├── routes/
│   └── heartRate.js          # Rutas de la API de ritmo cardíaco
├── services/
│   ├── heartRateService.js   # Lógica de negocio para ritmo cardíaco
│   └── dataService.js        # Servicio de generación de datos
├── utils/
│   ├── heartRateUtils.js     # Utilidades para ritmo cardíaco
│   ├── logger.js             # Sistema de logging
│   └── validators.js         # Validadores de entrada
├── package.json
├── .env.example
└── README.md
```

## ⚙️ Configuración

### Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `PORT` | Puerto del servidor | 3001 |
| `NODE_ENV` | Entorno de ejecución | development |
| `MAX_READINGS_HISTORY` | Máximo de lecturas históricas | 50 |
| `NORMAL_HR_MIN` | Ritmo cardíaco mínimo normal | 60 |
| `NORMAL_HR_MAX` | Ritmo cardíaco máximo normal | 100 |
| `RISKY_HR_THRESHOLD` | Umbral de riesgo | 100 |
| `PRODUCTION_API_ENDPOINT` | Endpoint de producción | https://um-sinmam-api.iroak.cl/ |

### Lógica de Clasificación de Riesgo

- **Normal**: 60-100 BPM
- **Riesgo Bajo**: < 60 BPM (Bradicardia)
- **Riesgo Alto**: > 100 BPM (Taquicardia)

El campo `isRisky` se establece en `true` cuando:
- El pulso es > 100 BPM
- El pulso es < 60 BPM

## 🔧 Desarrollo

### Scripts Disponibles

- `npm start` - Ejecutar en producción
- `npm run dev` - Ejecutar en desarrollo con recarga automática
- `npm run mock` - Ejecutar servidor mock para pruebas
- `npm run setup` - Configurar el proyecto inicial

### Logging

La aplicación incluye un sistema de logging con diferentes niveles:
- **INFO**: Información general
- **ERROR**: Errores de aplicación
- **WARN**: Advertencias
- **DEBUG**: Información de depuración (solo en desarrollo)

### Generación de Datos

**⚠️ IMPORTANTE:** La API ya NO genera datos automáticamente. 

**Modo de operación actual:**
- ✅ Recibe datos reales vía POST `/api/heart-rate/reading`
- ✅ Procesa y almacena las lecturas en memoria
- ✅ Calcula estadísticas en tiempo real
- ✅ Clasifica automáticamente el riesgo
- ❌ No genera datos falsos automáticamente

**Para enviar datos:**
```bash
curl -X POST http://localhost:3001/api/heart-rate/reading \
  -H "Content-Type: application/json" \
  -d '{"pulse": 85}'
```

## 📊 Características

### Funcionalidades Principales

- ✅ Recepción de datos reales vía POST
- ✅ Procesamiento automático de lecturas
- ✅ Cálculo de promedios por períodos de tiempo
- ✅ Clasificación automática de riesgo
- ✅ API REST completa
- ✅ Validación de entrada
- ✅ Logging estructurado
- ✅ Configuración flexible
- ✅ Manejo de errores
- ✅ CORS habilitado
- ✅ Estadísticas detalladas
- ❌ Generación automática de datos (removida)

### Seguridad

- Helmet.js para headers de seguridad
- Validación de entrada
- Sanitización de datos
- Límites de rate limiting (configurable)

## 🔌 Integración con Frontend

### Configuración del Cliente

Para conectar con el frontend, configure la variable `VITE_API_BASE_URL`:

```env
VITE_API_BASE_URL=http://localhost:3001
```

### Actualización de Datos

**Para enviar datos desde tu aplicación:**

```javascript
// Ejemplo de envío de datos
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://um-sinmam-api.iroak.cl';

const sendHeartRateReading = async (pulse) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/heart-rate/reading`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pulse })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Heart rate reading sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending heart rate reading:', error);
    throw error;
  }
};

// Enviar una lectura
sendHeartRateReading(85);
```

```javascript
// Ejemplo de integración
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const fetchHeartRateStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/heart-rate/stats`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching heart rate stats:', error);
    throw error;
  }
};

// Actualización automática cada 15 segundos
setInterval(fetchHeartRateStats, 15000);
```

## 🚀 Despliegue

### Desarrollo Local

```bash
npm run dev
```

### Producción

```bash
npm start
```

### Docker (Opcional)

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 📈 Monitoreo

### Métricas Disponibles

- Número total de lecturas generadas
- Promedio de tiempo de respuesta
- Lecturas de riesgo por hora
- Estado de salud del sistema

### Logs

Los logs incluyen:
- Timestamp
- Nivel de log
- Mensaje descriptivo
- Información de contexto

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico o preguntas sobre la API:

1. Revisar la documentación
2. Verificar los logs del servidor
3. Consultar los endpoints de salud
4. Crear un issue en el repositorio

## 🔄 Actualizaciones

### Versión 1.0.0
- ✅ API completa de ritmo cardíaco
- ✅ Generación automática de datos
- ✅ Sistema de logging
- ✅ Validación de entrada
- ✅ Documentación completa
