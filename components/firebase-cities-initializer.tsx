'use client'

import { useEffect } from 'react'
import { initializeCitiesInFirebase } from '@/lib/firebase-cities'

export function FirebaseCitiesInitializer() {
  useEffect(() => {
    // Initialize Firebase cities on client mount
    initializeCitiesInFirebase().catch((error) => {
      console.warn('[v0] Failed to initialize Firebase cities:', error)
    })
  }, [])

  return null
}
