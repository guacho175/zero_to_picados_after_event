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
  'Santiago': { name: 'Santiago', emoji: '🏔️', country: 'Chile', region: 'Central Chile', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  'Valparaíso': { name: 'Valparaíso', emoji: '🌊', country: 'Chile', region: 'Central Chile', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  'Viña del Mar': { name: 'Viña del Mar', emoji: '🏖️', country: 'Chile', region: 'Central Chile', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  'Concepción': { name: 'Concepción', emoji: '🏗️', country: 'Chile', region: 'South-Central Chile', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  'Puerto Montt': { name: 'Puerto Montt', emoji: '⛵', country: 'Chile', region: 'South Chile', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  'Punta Arenas': { name: 'Punta Arenas', emoji: '❄️', country: 'Chile', region: 'Patagonia', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  'Buenos Aires': { name: 'Buenos Aires', emoji: '🎭', country: 'Argentina', region: 'Buenos Aires', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  'Mendoza': { name: 'Mendoza', emoji: '🍷', country: 'Argentina', region: 'Cuyo', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  'Córdoba': { name: 'Córdoba', emoji: '⛪', country: 'Argentina', region: 'Central Argentina', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  'Rosario': { name: 'Rosario', emoji: '🌾', country: 'Argentina', region: 'Littoral', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  'La Plata': { name: 'La Plata', emoji: '🏛️', country: 'Argentina', region: 'Buenos Aires Province', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
  'Ushuaia': { name: 'Ushuaia', emoji: '🏔️', country: 'Argentina', region: 'Tierra del Fuego', isActive: true, createdAt: Date.now(), updatedAt: Date.now() },
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
