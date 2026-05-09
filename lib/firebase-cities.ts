import { getFirestoreDb } from './firebase-init'
import { collection, getDocs, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'

export interface City {
  name: string
  emoji: string
  country: string
  region: string
  isActive: boolean
  createdAt: number
  updatedAt: number
}

export interface CityData {
  [cityName: string]: City
}

// Fallback cities - always available (Chile & Argentina only)
const FALLBACK_CITIES: CityData = {
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

let citiesCache: CityData | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Initialize Firebase with default cities if not present
 */
export async function initializeCitiesInFirebase(): Promise<void> {
  try {
    const db = getFirestoreDb()
    const citiesRef = doc(db, 'system', 'cities')
    const snapshot = await getDoc(citiesRef)

    if (!snapshot.exists()) {
      console.log('[v0] Initializing cities in Firebase...')
      await setDoc(citiesRef, FALLBACK_CITIES)
      console.log('[v0] Cities initialized in Firebase')
    }
  } catch (error) {
    console.error('[v0] Error initializing cities in Firebase:', error)
  }
}

/**
 * Get all active cities from Firebase with fallback
 */
export async function getAllCities(): Promise<CityData> {
  try {
    // Check cache first
    const now = Date.now()
    if (citiesCache && now - cacheTimestamp < CACHE_DURATION) {
      console.log('[v0] Using cached cities')
      return citiesCache
    }

    const db = getFirestoreDb()
    const citiesRef = doc(db, 'system', 'cities')
    const snapshot = await getDoc(citiesRef)

    if (snapshot.exists()) {
      const data = snapshot.data() as CityData
      citiesCache = data
      cacheTimestamp = now
      console.log('[v0] Loaded cities from Firebase:', Object.keys(data).length)
      return data
    } else {
      console.warn('[v0] No cities found in Firebase, initializing...')
      await initializeCitiesInFirebase()
      return FALLBACK_CITIES
    }
  } catch (error) {
    console.error('[v0] Error fetching cities from Firebase:', error)
    console.log('[v0] Using fallback cities')
    return FALLBACK_CITIES
  }
}

/**
 * Get cities list as array
 */
export async function getCitiesAsArray(): Promise<Array<{ name: string; emoji: string; country: string }>> {
  const citiesData = await getAllCities()
  return Object.values(citiesData)
    .filter(city => city.isActive)
    .map(city => ({
      name: city.name,
      emoji: city.emoji,
      country: city.country
    }))
}

/**
 * Add a new city to Firebase
 */
export async function addCity(city: Omit<City, 'createdAt' | 'updatedAt'>): Promise<void> {
  try {
    const db = getFirestoreDb()
    const citiesRef = doc(db, 'system', 'cities')
    const now = Date.now()

    await updateDoc(citiesRef, {
      [city.name]: {
        ...city,
        createdAt: now,
        updatedAt: now
      }
    })

    // Invalidate cache
    citiesCache = null
    console.log('[v0] City added:', city.name)
  } catch (error) {
    console.error('[v0] Error adding city:', error)
    throw error
  }
}

/**
 * Update city in Firebase
 */
export async function updateCity(cityName: string, updates: Partial<Omit<City, 'createdAt'>>): Promise<void> {
  try {
    const db = getFirestoreDb()
    const citiesRef = doc(db, 'system', 'cities')

    await updateDoc(citiesRef, {
      [cityName]: {
        ...updates,
        updatedAt: Date.now()
      }
    })

    // Invalidate cache
    citiesCache = null
    console.log('[v0] City updated:', cityName)
  } catch (error) {
    console.error('[v0] Error updating city:', error)
    throw error
  }
}

/**
 * Toggle city active status
 */
export async function toggleCityStatus(cityName: string, isActive: boolean): Promise<void> {
  await updateCity(cityName, { isActive })
}
