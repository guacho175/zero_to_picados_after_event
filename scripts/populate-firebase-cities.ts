import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, doc, setDoc } from 'firebase/firestore'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const CITIES_DATA = {
  'Santiago': { name: 'Santiago', emoji: '🏔️', country: 'Chile', region: 'South America', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  'Mendoza': { name: 'Mendoza', emoji: '🍷', country: 'Argentina', region: 'South America', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  'Buenos Aires': { name: 'Buenos Aires', emoji: '🎭', country: 'Argentina', region: 'South America', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  'Lima': { name: 'Lima', emoji: '🌊', country: 'Peru', region: 'South America', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  'Bogota': { name: 'Bogota', emoji: '🌿', country: 'Colombia', region: 'South America', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  'Mexico City': { name: 'Mexico City', emoji: '🌮', country: 'Mexico', region: 'North America', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  'Madrid': { name: 'Madrid', emoji: '☀️', country: 'Spain', region: 'Europe', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  'Barcelona': { name: 'Barcelona', emoji: '🏛️', country: 'Spain', region: 'Europe', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  'São Paulo': { name: 'São Paulo', emoji: '🎆', country: 'Brazil', region: 'South America', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  'Miami': { name: 'Miami', emoji: '🌴', country: 'USA', region: 'North America', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  'Nueva York': { name: 'Nueva York', emoji: '🗽', country: 'USA', region: 'North America', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  'Londres': { name: 'Londres', emoji: '👑', country: 'UK', region: 'Europe', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  'Paris': { name: 'Paris', emoji: '✨', country: 'France', region: 'Europe', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  'Berlin': { name: 'Berlin', emoji: '🏰', country: 'Germany', region: 'Europe', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  'Amsterdam': { name: 'Amsterdam', emoji: '🚲', country: 'Netherlands', region: 'Europe', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  'Tokyo': { name: 'Tokyo', emoji: '🌸', country: 'Japan', region: 'Asia', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  'Bangkok': { name: 'Bangkok', emoji: '🏯', country: 'Thailand', region: 'Asia', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  'Estambul': { name: 'Estambul', emoji: '🕌', country: 'Turkey', region: 'Middle East', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  'Dubai': { name: 'Dubai', emoji: '🌆', country: 'UAE', region: 'Middle East', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  'Sydney': { name: 'Sydney', emoji: '🦘', country: 'Australia', region: 'Oceania', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  'Toronto': { name: 'Toronto', emoji: '🍁', country: 'Canada', region: 'North America', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  'Ciudad de Mexico': { name: 'Ciudad de Mexico', emoji: '🦅', country: 'Mexico', region: 'North America', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
}

async function populateCities() {
  try {
    // Initialize Firebase
    if (!getApps().length) {
      initializeApp(firebaseConfig)
    }
    const db = getFirestore()
    
    console.log('📍 Iniciando población de ciudades en Firebase...')
    console.log('Validando variables de entorno:')
    console.log('- projectId:', firebaseConfig.projectId ? '✓' : '✗')
    console.log('- apiKey:', firebaseConfig.apiKey ? '✓' : '✗')
    
    // Write cities to Firestore at system/cities document
    const citiesRef = doc(db, 'system', 'cities')
    await setDoc(citiesRef, CITIES_DATA, { merge: true })
    
    console.log('✅ Ciudades pobladas exitosamente en Firebase!')
    console.log(`📊 Total de ciudades: ${Object.keys(CITIES_DATA).length}`)
    console.log('📍 Ruta: system/cities')
    console.log('\nCiudades creadas:')
    Object.keys(CITIES_DATA).forEach((city, i) => {
      const data = CITIES_DATA[city as keyof typeof CITIES_DATA]
      console.log(`  ${i + 1}. ${data.emoji} ${city} (${data.country}) - ${data.region}`)
    })
    
  } catch (error) {
    console.error('❌ Error poblando ciudades:', error)
    process.exit(1)
  }
}

populateCities()
