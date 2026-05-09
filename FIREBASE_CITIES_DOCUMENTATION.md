# Firebase Cities System

Este documento explica cómo está configurado el sistema de ciudades con Firebase y cómo funciona.

## Problema Resuelto

Anteriormente, las ciudades desaparecían dependiendo del estado de ánimo del usuario porque el componente `city-selector` cargaba las ciudades desde `agent-recommendations.json` basado en el `agentId`. Si el agent no tenía ciudades configuradas, el array quedaba vacío y desaparecían todas las opciones.

**Solución:** Las ciudades ahora se almacenan centralmente en Firebase (Firestore), garantizando que siempre estén disponibles sin importar el estado del usuario.

## Arquitectura

### Componentes

1. **`lib/firebase-cities.ts`** - Servicio central para gestionar ciudades en Firebase
   - `getAllCities()` - Obtiene todas las ciudades desde Firebase con cache
   - `getCitiesAsArray()` - Devuelve ciudades como array filtradas y activas
   - `initializeCitiesInFirebase()` - Inicializa Firebase con las 22 ciudades por defecto
   - `addCity()`, `updateCity()`, `toggleCityStatus()` - Operaciones de CRUD

2. **`components/firebase-cities-initializer.tsx`** - Componente que inicializa Firebase al montar la app

3. **`components/check-in/city-selector.tsx`** - Componente actualizado que usa Firebase
   - Ya no depende de `agent-recommendations.json`
   - Siempre muestra ciudades (fallback incluido)
   - Error handling robusto

4. **`app/layout.tsx`** - Agregado inicializador para garantizar que Firebase esté listo

## Ciudades Disponibles (22)

### América del Sur
- Santiago, Chile 🏔️
- Mendoza, Argentina 🍷
- Buenos Aires, Argentina 🎭
- Lima, Peru 🌊
- Bogota, Colombia 🌿
- São Paulo, Brazil 🎆

### América del Norte
- Mexico City, Mexico 🌮
- Miami, USA 🌴
- Nueva York, USA 🗽
- Toronto, Canada 🍁
- Ciudad de Mexico, Mexico 🦅

### Europa
- Madrid, Spain ☀️
- Barcelona, Spain 🏛️
- Londres, UK 👑
- Paris, France ✨
- Berlin, Germany 🏰
- Amsterdam, Netherlands 🚲

### Asia
- Tokyo, Japan 🌸
- Bangkok, Thailand 🏯
- Estambul, Turkey 🕌

### Medio Oriente
- Dubai, UAE 🌆

### Oceanía
- Sydney, Australia 🦘

## Características

### Cache Inteligente
- Las ciudades se cachean por 5 minutos
- Reduce llamadas a Firebase
- Se invalida automáticamente al agregar/actualizar ciudades

### Fallback Robusto
- Si Firebase no está disponible, usa las 22 ciudades por defecto
- Si hay error en la carga, muestra las 5 ciudades más populares
- Nunca desaparecen las ciudades

### Escalabilidad
Fácil agregar nuevas ciudades:

```typescript
import { addCity } from '@/lib/firebase-cities'

await addCity({
  name: 'Barcelona',
  emoji: '🏛️',
  country: 'Spain',
  region: 'Europe',
  isActive: true
})
```

## Estructura en Firebase

```
firebase/
└── system/
    └── cities/
        ├── Santiago: { name, emoji, country, region, isActive, createdAt, updatedAt }
        ├── Buenos Aires: { ... }
        └── ... (22 ciudades más)
```

## Flujo de Ejecución

1. **App monta** → `FirebaseCitiesInitializer` se ejecuta
2. **Inicializador** → Llama a `initializeCitiesInFirebase()`
3. **Firebase verifica** → Si no existen ciudades, las crea
4. **City Selector** → Al renderizar, llama a `getCitiesAsArray()`
5. **Cache** → Los datos se cachean por 5 minutos
6. **Fallback** → Si hay error, usa ciudades locales por defecto

## Variables de Entorno Requeridas

Ya están configuradas en tu proyecto:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

## Consideraciones

- Las ciudades ya nunca desaparecerán por cambios de mood
- El sistema está completamente descentralizado (ciudades en Firebase)
- Cache reduce latencia y carga en Firebase
- Fallback garantiza que siempre funcione
- Las emociones dinámicas siguen funcionando normalmente (step 2)
