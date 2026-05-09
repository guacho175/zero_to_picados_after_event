## Firebase Cities Population Guide

This document explains how cities are managed in Firebase for the mood-adaptive check-in system.

### Automatic Population (Recommended)

**When it happens:**
- The first time the app loads after deployment
- `FirebaseCitiesInitializer` component automatically calls `initializeCitiesInFirebase()`
- This function checks if `system/cities` document exists in Firestore
- If it doesn't exist → Creates all 22 cities automatically
- If it exists → Does nothing (cities already set up)

**No action needed!** Just deploy and the cities will be created automatically.

### Manual Population (If needed)

If you want to populate cities manually or re-populate them:

#### Prerequisites
```bash
# Make sure you have .env.local with Firebase credentials:
# NEXT_PUBLIC_FIREBASE_API_KEY=
# NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
# NEXT_PUBLIC_FIREBASE_PROJECT_ID=
# etc.
```

#### Run the script
```bash
# Option 1: Using ts-node (if installed)
npx ts-node scripts/populate-firebase-cities.ts

# Option 2: Using Node.js after compiling
npm run build:populate
npm run populate
```

#### What gets created
The script creates a document at:
```
Firestore
└── system (collection)
    └── cities (document)
        ├── Santiago: { name, emoji, country, region, isActive, createdAt, updatedAt }
        ├── Buenos Aires: { ... }
        ├── Lima: { ... }
        ├── Bogota: { ... }
        ├── Mexico City: { ... }
        ├── Madrid: { ... }
        ├── Barcelona: { ... }
        ├── São Paulo: { ... }
        ├── Miami: { ... }
        ├── Nueva York: { ... }
        ├── Londres: { ... }
        ├── Paris: { ... }
        ├── Berlin: { ... }
        ├── Amsterdam: { ... }
        ├── Tokyo: { ... }
        ├── Bangkok: { ... }
        ├── Estambul: { ... }
        ├── Dubai: { ... }
        ├── Sydney: { ... }
        ├── Toronto: { ... }
        └── Ciudad de Mexico: { ... }
```

### How Cities are Used

1. **On App Load:**
   - `CitySelector` component mounts
   - Calls `getCitiesAsArray()` from Firebase
   - Fetches from `system/cities` document
   - Has 5-minute cache to reduce reads

2. **Fallback Cities:**
   - If Firebase is unavailable or empty
   - Always falls back to 5 basic cities: Santiago, Mendoza, Buenos Aires, Lima, Bogota
   - This ensures cities NEVER disappear

3. **Adding New Cities:**
   Use the `addCity()` function from `lib/firebase-cities.ts`:
   ```typescript
   import { addCity } from '@/lib/firebase-cities'
   
   await addCity({
     name: 'New City',
     emoji: '🌆',
     country: 'Country',
     region: 'Region',
     isActive: true
   })
   ```

4. **Toggling City Status:**
   ```typescript
   import { toggleCityStatus } from '@/lib/firebase-cities'
   
   await toggleCityStatus('Santiago', false) // Deactivates Santiago
   ```

### Troubleshooting

**Cities not showing up?**
- Check Firebase console → Firestore → `system` collection → `cities` document
- If empty, run the populate script
- Or just reload the app (should auto-create)

**Getting fallback cities instead?**
- This is expected behavior if Firebase is unavailable
- Check Firebase credentials in `.env.local`
- Check browser console for errors

**Want to see what's cached?**
- Open browser DevTools → Console
- Look for messages like `[v0] Loaded cities from Firebase: 22`

### API Reference

From `lib/firebase-cities.ts`:

```typescript
// Initialize cities if not present
initializeCitiesInFirebase(): Promise<void>

// Get all cities as object
getAllCities(): Promise<CityData>

// Get cities as array (filtered active only)
getCitiesAsArray(): Promise<Array<{ name, emoji, country }>>

// Add new city
addCity(city: Omit<City, 'createdAt' | 'updatedAt'>): Promise<void>

// Update existing city
updateCity(cityName: string, updates: Partial<...>): Promise<void>

// Toggle city active/inactive
toggleCityStatus(cityName: string, isActive: boolean): Promise<void>
```

### Environment Variables Required

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your-url
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

These should already be in your `.env.local` from Firebase setup.
