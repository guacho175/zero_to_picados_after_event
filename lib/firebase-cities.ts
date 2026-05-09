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

// Fallback cities - always available
const FALLBACK_CITIES: CityData = {
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
