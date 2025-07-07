# SINMAM API Backend

API backend para el sistema de monitoreo de ritmo cardíaco SINMAM.

## 🚀 Inicio Rápido

### Requisitos
- Node.js 16+ 
- npm o yarn

### Instalación

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Ejecutar el servidor**
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

Recibe una nueva lectura de ritmo cardíaco y oxigenación y la procesa automáticamente.

**Cuerpo de la petición:**
```json
{
  "pulse": 85,
  "spo2": 97
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
    "spo2": 97,
    "isRisky": false,
    "timestamp": "2025-07-06T14:30:00Z"
  }
}
```

### Estadísticas de Ritmo Cardíaco
**GET** `/api/heart-rate/stats`

Retorna estadísticas de ritmo cardíaco y oxigenación incluyendo promedios para diferentes períodos de tiempo.

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
  "spo2": 97,
  "avgSpo2_5min": 97,
  "avgSpo2_15min": 96,
  "avgSpo2_30min": 95
}
```

### Historial de Lecturas
**GET** `/api/heart-rate/readings`

Retorna las lecturas recientes de ritmo cardíaco y oxigenación.

**Parámetros de consulta:**
- `limit` (opcional): Número máximo de lecturas a retornar (1-20, default: 10)

**Respuesta:**
```json
[
  {
    "id": 1,
    "hour": "14:30",
    "pulse": 110,
    "spo2": 98,
    "isRisky": false,
    "timestamp": "2025-07-06T14:30:00Z"
  }
]
```

### Lectura Actual
**GET** `/api/heart-rate/current`

Retorna la lectura actual de ritmo cardíaco y oxigenación.

**Respuesta:**
```json
{
  "current": 98,
  "spo2": 97,
  "lastUpdated": "14:30:25",
  "timestamp": "2025-07-06T14:30:00Z",
  "hasData": true
}
```

### Estado de Salud
**GET** `/health`

Endpoint para verificar el estado de la API.

**Respuesta:**
```json
{
  "status": "OK",
  "message": "SINMAM API is running",
  "timestamp": "2025-07-06T14:30:00Z",
  "version": "1.0.0",
  "defaultEndpoint": "https://um-sinmam-api.iroak.cl/",
  "totalReadings": 25
}
```

## 🏗️ Estructura del Proyecto

```
UM-SINMAM-Backend/
├── mock-server.js           # Servidor API principal
├── package.json            # Configuración del proyecto
├── .env                    # Variables de entorno
├── .env.example           # Ejemplo de variables de entorno
├── .gitignore             # Archivos ignorados por Git
└── README.md              # Este archivo
```

## ⚙️ Configuración

### Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `PORT` | Puerto del servidor | 3001 |
| `NODE_ENV` | Entorno de ejecución | development |
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

### Almacenamiento de Datos

**⚠️ IMPORTANTE:** La API almacena datos en memoria.

**Características:**
- ✅ Recibe datos reales vía POST `/api/heart-rate/reading`
- ✅ Almacena hasta 50 lecturas en memoria
- ✅ Calcula estadísticas en tiempo real
- ✅ Clasifica automáticamente el riesgo
- ❌ Los datos se pierden al reiniciar el servidor

**Para enviar datos:**
```bash
curl -X POST http://localhost:3001/api/heart-rate/reading \
  -H "Content-Type: application/json" \
  -d '{"pulse": 85, "spo2": 97}'
```

## 📊 Características

### Funcionalidades Principales

- ✅ Recepción de datos reales vía POST
- ✅ Procesamiento automático de lecturas
- ✅ Cálculo de promedios por períodos de tiempo
- ✅ Clasificación automática de riesgo
- ✅ API REST completa
- ✅ Validación de entrada
- ✅ Manejo de errores
- ✅ CORS habilitado
- ✅ Almacenamiento en memoria

### Seguridad

- Validación de entrada
- Límites de valores (30-250 BPM, 50-100 SpO2)
- Manejo de errores estructurado
- CORS habilitado

## 🔌 Integración con Frontend

### Configuración del Cliente

Para conectar con el backend, configure la variable `VITE_API_BASE_URL` en su frontend:

**Desarrollo local:**
```env
VITE_API_BASE_URL=http://localhost:3001
```

**Producción:**
```env
VITE_API_BASE_URL=https://um-sinmam-api.iroak.cl
```

### Envío de Datos

```javascript
// Ejemplo de envío de datos
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://um-sinmam-api.iroak.cl';

const sendHeartRateReading = async (pulse, spo2) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/heart-rate/reading`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pulse, spo2 })
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
sendHeartRateReading(85, 97);
```

### Obtener Estadísticas

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

## 📈 Monitoreo

### Logs

Los logs incluyen:
- Timestamp
- Tipo de operación
- Datos procesados
- Estados de error

### Ejemplo de logs:
```
📥 New reading: 85 BPM, SpO2: 97 (NORMAL)
📊 Stats requested: Current 85 BPM, SpO2: 97 (1 readings)
📋 Readings requested: 1 entries
💓 Current heart rate: 85 BPM, SpO2: 97
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## 🆘 Soporte

Para soporte técnico:

1. Verificar los logs del servidor
2. Consultar el endpoint `/health`
3. Crear un issue en el repositorio

## 🔄 Actualizaciones

### Versión 1.1.0
- ✅ Soporte para SpO2 (oxigenación)
- ✅ Estadísticas de SpO2
- ✅ Documentación actualizada
