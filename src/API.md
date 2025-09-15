# Data Infrastructure

## Simple Architecture

We use **static data imports** instead of APIs for our 150KB JSON file. This is the fastest and simplest approach.

## How It Works

### Data Source
- **File:** `public/entities.json` (150KB, ~140 UN entities)
- **Access:** `src/data/entities.ts` (typed functions)
- **No APIs needed** - direct file imports

### Data Flow
```
entities.json → src/data/entities.ts → Components
```

## Key Functions
```typescript
getAllEntities()        // Get all visible entities
getEntityBySlug(slug)   // Find entity by URL slug
getEntitiesByGroup()    // Filter by group
searchEntities()        // Search functionality
```

## Pages
- **Main grid:** Loads all entities instantly
- **Entity pages:** Direct data lookup by url param
- **Modal overlay:** Same data, no network calls

## Why This Works
- **Fast:** No API calls = instant loading
- **Simple:** One data file, direct imports
- **Reliable:** No network dependencies
- **SEO-friendly:** Server-side rendering with data

## Perfect For
✅ Static or rarely-changing data  
✅ Small to medium datasets (<1MB)  
✅ Fast performance requirements  
✅ Simple deployment needs


## SETUP
- intercepted routes (modals) 
- Missing rewrite rules for Azure Web Apps: Azure Web Apps need specific configuration to handle client-side routing properly
- Intercepted routes may not work correctly: The modal intercept pattern (.)entity/[slug] might not function properly in a production environment without proper server configuration
- Docker configuration: The Dockerfile might need adjustments for proper routing
