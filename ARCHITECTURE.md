# Reles - Architectural Overview

## What is Reles?

Reles is a **recipe discovery and extraction app** that turns YouTube cooking videos into structured, actionable recipes. Users can search for cooking videos, extract ingredients and instructions using AI, save recipes to a personal collection, build grocery lists organized by aisle, and order ingredients directly through Instacart.

**Tech Stack:** React Native 0.81 + Expo 54 + Expo Router 6 + TypeScript 5.9

**Backend:** Node.js/Express on Railway, Firebase Firestore for data, custom auth with JWT

**Monetization:** RevenueCat (Apple IAP) with free (5 lifetime extractions) and Pro (50/week) tiers

---

## High-Level System Architecture

```
                          +---------------------------+
                          |      YouTube Data API      |
                          |  (search, video details,   |
                          |       captions)            |
                          +------------+--------------+
                                       |
                                       v
+------------------+          +-----------------+          +------------------+
|                  |  REST    |                 |  Firestore|                  |
|   Reles Mobile   +--------->+  Reles Server   +---------->+  Firebase DB     |
|   (React Native) |  + SSE   |  (Express.js)   |          |  (Users, Recipes)|
|                  |<---------+  Railway.app     |<---------+                  |
+--------+---------+          +--------+--------+          +------------------+
         |                             |
         |                             |
         v                             v
+------------------+          +-----------------+
|   RevenueCat     |          |   Instacart     |
|   (Purchases)    |          |   (Ordering)    |
+------------------+          +-----------------+
```

---

## Navigation Architecture

```
Root Layout (_layout.tsx)
  |
  |-- Providers: ShareIntentProvider > AuthProvider > SubscriptionProvider > ThemeProvider
  |
  |-- Auth Status Router
        |
        |-- [logged_out / loading] --> (auth) Stack
        |       |-- welcome         (feature carousel onboarding)
        |       |-- login           (email/password)
        |       |-- onboarding-name (user name)
        |       |-- onboarding-cuisines (cuisine preferences)
        |       |-- onboarding-dietary  (dietary + allergens)
        |
        |-- [logged_in] --> (tabs) Bottom Tab Navigator
        |       |-- index.tsx       Home / Discover  [Home icon]
        |       |-- recipes.tsx     Saved Recipes     [Bookmark icon]
        |       |-- grocery.tsx     Grocery List       [Cart icon]
        |       |-- profile.tsx     Profile & Prefs    [Profile icon]
        |       |-- search.tsx      (hidden tab)
        |       |-- add.tsx         (hidden tab)
        |
        |-- recipe/ (Modal Stack)
                |-- preview.tsx     Video preview + extraction UI
                |-- [id].tsx        Saved recipe detail view
```

---

## Feature 1: Recipe Extraction from Videos

### Overview

The core feature of Reles. An AI-powered pipeline that reads YouTube video captions and extracts structured recipe data (ingredients, instructions, metadata) in real-time via Server-Sent Events (SSE).

### Architecture Diagram

```
+-------------------------------------------------------------------+
|                        CLIENT (React Native)                       |
+-------------------------------------------------------------------+
|                                                                     |
|  app/recipe/preview.tsx                                            |
|  +---------------------------------------------------------------+ |
|  |  RecipePreviewScreen                                           | |
|  |                                                                | |
|  |  1. Reads videoId from route params                            | |
|  |  2. Calls useRecipeExtraction(videoId, title, channel)         | |
|  |  3. Renders UI based on extraction phase                       | |
|  +--+------------------------------------------------------------+ |
|     |                                                               |
|     v                                                               |
|  hooks/useRecipeExtraction.ts                                      |
|  +---------------------------------------------------------------+ |
|  |  STATE:                                                        | |
|  |    phase: 'idle' | 'fetching' | 'extracting'                  | |
|  |    streamedIngredients: Ingredient[]                           | |
|  |    streamedInstructions: string[]                              | |
|  |    streamedMetadata: Partial<RecipeMetadata>                   | |
|  |    savedRecipe: Recipe | null                                  | |
|  |                                                                | |
|  |  ON MOUNT:                                                     | |
|  |    - Check if recipe already saved (apiCheckRecipeSaved)       | |
|  |    - Fetch video details (title, channel)                      | |
|  |                                                                | |
|  |  startExtraction():                                            | |
|  |    - Check subscription quota                                  | |
|  |    - If limit reached -> show paywall                          | |
|  |    - Call extractIngredientsStream()                           | |
|  |    - On complete: save recipe + deduct quota                   | |
|  +--+------------------------------------------------------------+ |
|     |                                                               |
|     v                                                               |
|  lib/api.ts :: extractIngredientsStream()                          |
|  +---------------------------------------------------------------+ |
|  |  1. Open XMLHttpRequest to /api/video/{id}/extract-stream      | |
|  |  2. Parse SSE buffer incrementally                             | |
|  |  3. Dispatch events via callbacks:                             | |
|  |     - onPhase('extracting')                                    | |
|  |     - onMetadata({servings: 4, cuisine: 'ITALIAN'})           | |
|  |     - onIngredient({name: 'flour', quantity: '2 cups'})       | |
|  |     - onInstruction(0, 'Preheat oven to 375F')               | |
|  |     - onComplete(fullRecipeObject)                             | |
|  |  4. Fallback: if SSE fails, call /extract (non-streaming)     | |
|  |     and simulate progressive delivery                          | |
|  +---------------------------------------------------------------+ |
+-------------------------------------------------------------------+

                              | SSE Stream |
                              v            v

+-------------------------------------------------------------------+
|                        SERVER (Express.js)                         |
+-------------------------------------------------------------------+
|                                                                     |
|  /api/video/:videoId/extract-stream                                |
|  +---------------------------------------------------------------+ |
|  |  1. Fetch YouTube captions for videoId                         | |
|  |  2. Send SSE: event: phase, data: {phase: "fetching"}         | |
|  |  3. Pass captions to AI/LLM for extraction                    | |
|  |  4. Stream results as they're generated:                       | |
|  |     - event: phase      -> "extracting"                       | |
|  |     - event: metadata   -> {servings, cuisine, difficulty...} | |
|  |     - event: ingredient -> {name, quantity, category}         | |
|  |     - event: instruction-> {index, text}                      | |
|  |     - event: complete   -> full recipe JSON                   | |
|  |  5. Close SSE connection                                       | |
|  +---------------------------------------------------------------+ |
+-------------------------------------------------------------------+
```

### SSE Event Protocol

```
EVENT STREAM:    Server ──────────────────────────> Client

  event: phase
  data: {"phase": "fetching"}            --> setPhase('fetching')
                                              Progress bar -> 30%
  event: phase
  data: {"phase": "extracting"}          --> setPhase('extracting')
                                              Haptic feedback
                                              Progress bar -> 55%
  event: metadata
  data: {"servings": 4, "cuisine": "ITALIAN",
         "difficulty": 2}                --> Metadata card appears

  event: ingredient
  data: {"name": "flour", "quantity": "2 cups",
         "category": "pantry"}           --> Ingredient fades in (animated)

  event: ingredient
  data: {"name": "butter", "quantity": "1/2 cup",
         "category": "dairy"}            --> Next ingredient fades in

  event: instruction
  data: {"index": 0,
         "text": "Preheat oven to 375F"}--> Step 1 appears

  event: instruction
  data: {"index": 1,
         "text": "Mix dry ingredients"} --> Step 2 appears

  event: complete
  data: {<full recipe JSON>}             --> Save recipe, deduct quota
                                              Transition to RecipeDetail view
```

### UI State Machine

```
                    +-------+
                    | IDLE  |  (shows video thumbnail + "Save to Recipes" button)
                    +---+---+
                        |
              User taps "Save to Recipes"
              (quota check + paywall if needed)
                        |
                        v
                  +-----------+
                  | FETCHING  |  ExtractionCard: emoji carousel, progress 0->30%
                  +-----+-----+  Status: "Reading the video for you..."
                        |
               SSE: phase=extracting
                        |
                        v
                 +------------+
                 | EXTRACTING |  ExtractionCard: progress 55->92%
                 +-----+------+  Ingredients/instructions fade in progressively
                       |
                SSE: complete
                       |
                       v
                  +---------+
                  | COMPLETE |  Full RecipeDetail view with all sections
                  +---------+  Bottom bar: "Add to Grocery List" + "Instacart"
```

---

## Feature 2: Instacart Ordering

### Overview

Users can send recipe ingredients or their entire grocery list to Instacart for ordering. The app supports two flows: single-recipe ordering and full grocery list ordering.

### Architecture Diagram

```
+-------------------------------------------------------------------+
|                         ENTRY POINTS                               |
+-------------------------------------------------------------------+
|                                                                     |
|  1. Recipe Preview (app/recipe/preview.tsx)                        |
|     Bottom bar "Instacart" button                                  |
|     -> handleInstacart() -> createInstacartRecipeLink(recipe)      |
|                                                                     |
|  2. Recipe Detail (app/recipe/[id].tsx)                            |
|     Bottom bar "Instacart" button                                  |
|     -> handleInstacart() -> createInstacartRecipeLink(recipe)      |
|                                                                     |
|  3. Grocery Screen (app/(tabs)/grocery.tsx)                        |
|     "Add to Instacart" header button                               |
|     -> handleInstacart() -> createInstacartGroceryLink(items)      |
+-------------------------------------------------------------------+

                                |
                                v

+-------------------------------------------------------------------+
|                      API LAYER (lib/api.ts)                        |
+-------------------------------------------------------------------+
|                                                                     |
|  createInstacartRecipeLink(recipe)                                 |
|    POST /api/recipe/instacart                                      |
|    Body: { title, ingredients[], instructions[], servings,         |
|            prepTimeMinutes, cookTimeMinutes, thumbnailUrl }        |
|    Returns: { url: string }                                        |
|                                                                     |
|  createInstacartGroceryLink(items, title?)                         |
|    POST /api/grocery/instacart                                     |
|    Body: { items: GroceryItem[], title? }                          |
|    Returns: { url: string }                                        |
|                                                                     |
+-------------------------------------------------------------------+

                                |
                                v

+-------------------------------------------------------------------+
|                    SERVER (Express.js)                              |
+-------------------------------------------------------------------+
|  Converts ingredient data to Instacart-compatible format           |
|  Generates Instacart partner link with pre-populated items         |
|  Returns URL to client                                             |
+-------------------------------------------------------------------+

                                |
                                v

+-------------------------------------------------------------------+
|              WebBrowser.openBrowserAsync(url)                      |
|  Opens Instacart in in-app browser with items pre-populated       |
+-------------------------------------------------------------------+
```

### Grocery List Data Pipeline

```
Recipe Extraction                     Grocery Screen
  |                                      |
  | User taps "Add to List"              | Displays items by aisle
  v                                      |
addRecipeToGroceryList(videoId)          |
  |                                      |
  v                                      |
lib/aggregation.ts                       |
  |                                      |
  |  1. Normalize ingredient names       |
  |     (lowercase, trim, de-pluralize)  |
  |                                      |
  |  2. Parse quantities                 |
  |     "2 cups" -> {amount:2, unit:"cups"}
  |     "1/2 tsp" -> {amount:0.5, unit:"tsp"}
  |                                      |
  |  3. Assign aisles (lib/aisles.ts)    |
  |     "flour" -> Pantry                |
  |     "chicken" -> Meat & Seafood      |
  |     "garlic" -> Produce              |
  |                                      |
  |  4. Deduplicate across recipes       |
  |     Same ingredient from 2 recipes:  |
  |     "1 cup + 2 tbsp" (combined)      |
  |                                      |
  |  5. Track sources                    |
  |     [{recipeId, recipeTitle, qty}]   |
  |                                      |
  v                                      v
AsyncStorage                          Aisle-grouped display
("reles_grocery_list")                  |
                                        |  Produce      [garlic, onion...]
                                        |  Dairy        [butter, cream...]
                                        |  Pantry       [flour, sugar...]
                                        |  Meat         [chicken...]
                                        |
                                        v
                                    "Add to Instacart" button
                                        |
                                        v
                              POST /api/grocery/instacart
                                        |
                                        v
                                  Open Instacart URL
```

### Aisle Categories

```
+------------------+-----------------------------------------------+
| Aisle            | Example Keywords                              |
+------------------+-----------------------------------------------+
| Produce          | onion, garlic, tomato, lettuce, carrot...     |
| Bakery           | bread, rolls, tortillas, pita...              |
| Meat & Seafood   | chicken, beef, salmon, shrimp...              |
| Dairy & Eggs     | milk, cheese, butter, cream, eggs...          |
| Frozen           | frozen, ice cream...                          |
| Pantry           | flour, sugar, rice, pasta, beans...           |
| Spices           | salt, pepper, cumin, oregano, paprika...      |
| Condiments       | soy sauce, ketchup, mustard, mayo...         |
| Beverages        | water, juice, coffee, tea, wine...            |
| Other            | (fallback for unmatched items)                |
+------------------+-----------------------------------------------+
```

---

## Feature 3: RevenueCat & Subscription Integration

### Overview

Reles uses RevenueCat for in-app purchase management with a freemium model. Free users get 5 lifetime recipe extractions; Pro users get 50 per week (resetting Mondays UTC).

### Architecture Diagram

```
+-------------------------------------------------------------------+
|                    SUBSCRIPTION ARCHITECTURE                       |
+-------------------------------------------------------------------+

  +-----------------+         +-----------------+        +-----------+
  |  SubscriptionCtx|-------->| RevenueCat SDK  |------->| App Store |
  |  (React Context)|         | (Purchases)     |        | (Apple)   |
  |                 |<--------| react-native-   |<-------+           |
  |  State:         |         | purchases       |        +-----------+
  |  - isPro        |         +-----------------+
  |  - remaining    |
  |  - weeklyLimit  |                 |
  |  - paywallVis.  |                 | Purchase receipt
  |                 |                 v
  |  Methods:       |         +-----------------+        +-----------+
  |  - showPaywall()|-------->| Reles Server    |------->| Firebase  |
  |  - tryExtract() |         | /subscription/* |        | Firestore |
  |  - refresh()    |<--------|                 |<-------| users/    |
  +-----------------+         +-----------------+        +-----------+
```

### Subscription Tiers

```
+-------------------+--------------------+--------------------+
|                   |      FREE          |       PRO          |
+-------------------+--------------------+--------------------+
| Extractions       | 5 total (lifetime) | 50 per week        |
| Tracking          | recipesUsed        | weeklyExtractions  |
| Reset             | Never              | Every Monday 00:00 |
|                   |                    | UTC                |
| Price             | $0                 | TBD (IAP)          |
| Constant          | FREE_TOTAL_LIMIT=5 | PRO_WEEKLY_LIMIT=50|
+-------------------+--------------------+--------------------+
```

### Paywall Flow (Promise-Based Modal)

```
useRecipeExtraction::startExtraction()
  |
  |-- remainingExtractions <= 0?
  |     |
  |     YES --> showPaywall() returns Promise<boolean>
  |     |         |
  |     |         v
  |     |    +-------------------+
  |     |    |   PaywallModal    |  (RevenueCat UI)
  |     |    |                   |
  |     |    |  [Subscribe Pro]  |-----> RevenueCat purchase flow
  |     |    |                   |         |
  |     |    |  [Continue Free]  |--+      | Success
  |     |    +-------------------+  |      v
  |     |                           |   handlePaywallPurchased()
  |     |                           |     |
  |     |    Promise resolves:      |     | POST /api/subscription/activate-pro
  |     |    false <----------------+     | Server: isPro = true, reset weekly count
  |     |    true  <----------------------+
  |     |      |                          | Returns: {isPro:true, remaining:50}
  |     |      v                          v
  |     |    Continue extraction     Update context state
  |     |
  |     NO --> Continue extraction directly
  |
  v
extractIngredientsStream(videoId, ...)
  |
  v (on success)
apiSaveRecipe(videoId)
  |
  v
tryExtract() --> POST /api/subscription/use-extraction
  |               |
  |               v (Firebase Transaction)
  |             +---------------------------------+
  |             | Free: recipesUsed += 1          |
  |             | Pro:  weeklyExtractions.count+=1 |
  |             | Returns: {allowed, remaining}   |
  |             +---------------------------------+
  v
Update remainingExtractions in context
```

### Weekly Reset Logic (Server-Side)

```
User calls GET /api/subscription/status
  |
  v
Server: getCurrentWeekStart()
  |
  |  Calculate Monday 00:00:00 UTC of current week
  |
  v
Compare stored weekStart vs current weekStart
  |
  |-- MATCH --> Use existing count
  |
  |-- DIFFERENT --> Reset: {count: 0, weekStart: newMonday}
  |                 Update Firestore
  |
  v
Return: {isPro, remaining, limit, weeklyExtractions}
```

### Trigger Points for Paywall

```
+----------------------------------+--------------------------------------+
| Location                         | Trigger                              |
+----------------------------------+--------------------------------------+
| Recipe extraction                | remainingExtractions <= 0            |
| (useRecipeExtraction.ts)         | Before starting extraction           |
+----------------------------------+--------------------------------------+
| Profile screen                   | "Upgrade to Pro" button              |
| (profile.tsx)                    | Visible when !isPro                  |
+----------------------------------+--------------------------------------+
| Recipe preview quota card        | "Upgrade" link text                  |
| (preview.tsx)                    | Visible when !isPro                  |
+----------------------------------+--------------------------------------+
```

### Firebase User Document Schema

```
users/{uid}
  |-- uid: string
  |-- email: string
  |-- name: string
  |-- isPro: boolean                    // false by default
  |-- recipesUsed: number              // lifetime count (free tier)
  |-- weeklyExtractions:
  |     |-- count: number              // extractions this week
  |     |-- weekStart: string          // ISO Monday 00:00 UTC
  |-- preferences:
  |     |-- likedCuisines: string[]
  |     |-- dietaryRestrictions: {...}
  |     |-- allergens: string[]
  |-- createdAt: string
  |-- updatedAt: string
```

---

## Feature 4: YouTube Search

### Overview

Users can search for cooking videos via text query or paste/share YouTube URLs directly. The search integrates with the home screen, a dedicated search screen, and the system share intent.

### Architecture Diagram

```
+-------------------------------------------------------------------+
|                     SEARCH ENTRY POINTS                            |
+-------------------------------------------------------------------+

  1. TEXT SEARCH (Home/Search screen)
     +------------------+
     | Search Bar Input |
     +--------+---------+
              |
              v
     Is it a YouTube URL?
     (extractVideoId regex)
       |              |
       YES            NO
       |              |
       v              v
     Navigate to    Debounce 1000ms
     /recipe/       (min 3 chars)
     preview?           |
     videoId=xxx        v
                   searchRecipeVideos(query)
                   GET /api/video/search?q=...
                        |
                        v
                   Display results in FlatList
                        |
                        v (user taps result)
                   Navigate to /recipe/preview
                   with {videoId, title, channel, thumbnail}

  2. SHARE INTENT (from YouTube app / browser)
     +-------------------------+
     | System Share Sheet      |
     | (YouTube URL shared)    |
     +----------+--------------+
                |
                v
     ShareIntentProvider catches intent
                |
                v
     Root _layout.tsx useEffect
                |
                v
     extractVideoId(sharedUrl)
                |
                v
     router.push('/recipe/preview', {videoId})
```

### Search State Management (useRecipeSearch hook)

```
+-------------------------------------------------------------------+
|  useRecipeSearch.ts                                                |
+-------------------------------------------------------------------+
|                                                                     |
|  State:                                                            |
|    query: string          // Current search text                   |
|    results: VideoSearchResult[]  // Search results                 |
|    loading: boolean       // API call in progress                  |
|    error: string | null   // Error message                         |
|                                                                     |
|  Refs:                                                             |
|    debounceTimer          // setTimeout reference                  |
|    skipNextDebounce       // Flag to bypass debounce               |
|                                                                     |
|  Flow:                                                             |
|    setQuery(text)                                                  |
|      |                                                             |
|      |-- extractVideoId(text) found?                               |
|      |     YES -> skipNextDebounce = true                          |
|      |     NO  -> schedule debounced search (1000ms)               |
|      |                                                             |
|      v                                                             |
|    handleSearch(text)                                              |
|      |-- text.length < 3? -> clear results, return                |
|      |-- setLoading(true)                                          |
|      |-- searchRecipeVideos(text)                                  |
|      |-- setResults(data) or setError(msg)                        |
|      |-- setLoading(false)                                         |
|                                                                     |
|  onSubmitEditing():                                                |
|    |-- extractVideoId? -> navigate to preview                     |
|    |-- else -> immediate search (bypass debounce)                  |
+-------------------------------------------------------------------+
```

### YouTube URL Detection Regex

```
Supported formats:
  youtube.com/watch?v=dQw4w9WgXcQ      (standard)
  youtu.be/dQw4w9WgXcQ                 (short URL)
  youtube.com/embed/dQw4w9WgXcQ        (embed)
  youtube.com/shorts/dQw4w9WgXcQ       (Shorts)

Pattern: /(?:youtube\.com\/watch\?.*v=|youtu\.be\/|youtube\.com\/embed\/
          |youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/

Extracts: 11-character video ID
```

### VideoSearchResult Type

```
+-------------------+----------+----------------------------------+
| Field             | Type     | Description                      |
+-------------------+----------+----------------------------------+
| videoId           | string   | YouTube video ID (11 chars)      |
| title             | string   | Video title                      |
| channelName       | string   | YouTube channel name             |
| channelThumbnail  | string?  | Channel avatar URL               |
| thumbnail         | string   | Video thumbnail URL              |
| url               | string   | Full YouTube URL                 |
| viewCount         | number?  | Total view count                 |
+-------------------+----------+----------------------------------+
```

---

## Feature 5: Homepage / Multi-Feed Discovery

### Overview

The home screen presents a personalized, multi-section discovery feed combining API-driven recommendations, user behavioral data, time-based suggestions, and curated categories.

### Feed Section Architecture

```
+-------------------------------------------------------------------+
|                    HOMEPAGE FEED SECTIONS                           |
+-------------------------------------------------------------------+
|                                                                     |
|  DATA SOURCES:                                                     |
|                                                                     |
|  +-- API (fetchHomeFeed) -----+  +-- Local (savedRecipes) ---+    |
|  |                            |  |                            |    |
|  |  pickedForYou[]            |  |  recentRecipes (top 5)    |    |
|  |  trending{cuisine,recipes} |  |  accompanyingSuggestions   |    |
|  |  quickTonight[]            |  |  (from saved recipe data) |    |
|  |  deepDive{cuisine,recipes} |  |                            |    |
|  |  challenge[]               |  +----------------------------+    |
|  +----------------------------+                                    |
|                                                                     |
|  +-- Constants + Computed ----+                                    |
|  |                            |                                    |
|  |  moodCategories (8 cats)   |                                    |
|  |  quickActionChips (4 max)  |                                    |
|  |  greeting (time-based)     |                                    |
|  +----------------------------+                                    |
+-------------------------------------------------------------------+
```

### Section Rendering Order & Data Sources

```
SCROLL POSITION    SECTION                     DATA SOURCE         PERSONALIZATION
+-------------+
|             |    1. Greeting +               Time of day +       User name,
|  Top of     |       Quick Action Chips       User prefs          favorite cuisines,
|  Screen     |                                                    dietary restrictions
+-------------+
|             |    2. Picked For You           API: feedData.      Cuisines, dietary,
|             |       (curated video cards)    pickedForYou        allergens sent to API
+-------------+
|             |    3. Trending in [Cuisine]    API: feedData.      User's top liked
|             |       (ranked #1, #2, #3...)   trending            cuisine
+-------------+
|             |    4. Quick Tonight            API: feedData.      Dietary restrictions
|             |       (recipes < 30 min)       quickTonight        (filtered server-side)
+-------------+
|             |    5. Because You Love         API: feedData.      User's favorite
|             |       [Cuisine] (deep dive)    deepDive            cuisine
+-------------+
|             |    6. Ready for a Challenge?   API: feedData.      Sent to API
|             |       (advanced recipes)       challenge
+-------------+
|             |    7. Continue Your Journey    Computed from       Based on saved
|             |       (related recipes)        savedRecipes        recipes' suggestions
+-------------+
|             |    8. Recently Saved           Local: saved        User's saved
|             |       (last 5 recipes)         Recipes[0:5]        recipe history
+-------------+
|  Bottom     |    9. What Are You Feeling?    Constants:          Dietary prefix
|  of Feed    |       (mood categories)        EXPLORE_CATEGORIES  ("vegan", etc.)
+-------------+
```

### useDiscovery Hook - Data Flow

```
app/(tabs)/index.tsx
  |
  v
useDiscovery(user.preferences)
  |
  |-- useFocusEffect (triggers on screen focus)
  |     |
  |     |-- PARALLEL FETCH:
  |     |     |
  |     |     |-- apiGetSavedRecipes()  --> setSavedRecipes
  |     |     |
  |     |     |-- fetchHomeFeed(         --> setFeedData
  |     |           cuisines: [...],        {pickedForYou, trending,
  |     |           dietary: "vegan",        quickTonight, deepDive,
  |     |           allergens: [...]         challenge}
  |     |         )
  |     |
  |     v
  |
  |-- useMemo COMPUTATIONS:
  |     |
  |     |-- greeting = getGreeting(timeOfDay, userName)
  |     |     Morning -> "Good morning, [Name]"
  |     |     Afternoon -> "Good afternoon, [Name]"
  |     |     Evening -> "Good evening, [Name]"
  |     |
  |     |-- quickActionChips = buildQuickActionChips(cuisines, dietary, time)
  |     |     [time-based meal] + [up to 2 cuisine chips]
  |     |     Examples: ["Vegan Breakfast", "30-min Italian", "Easy Japanese"]
  |     |
  |     |-- pickedForYouVideos = feedData.pickedForYou
  |     |
  |     |-- trendingSection = feedData.trending
  |     |     {cuisine: "ITALIAN", emoji: "...", recipes: [...]}
  |     |
  |     |-- quickTonightRecipes = feedData.quickTonight
  |     |
  |     |-- deepDiveSection = feedData.deepDive
  |     |
  |     |-- challengeRecipes = feedData.challenge
  |     |
  |     |-- accompanyingSuggestions = buildAccompanyingSuggestions(savedRecipes)
  |     |     Loop top 10 saved recipes
  |     |     Extract accompanyingRecipes arrays
  |     |     Deduplicate (case-insensitive)
  |     |     Return first 6 unique suggestions
  |     |
  |     |-- recentRecipes = savedRecipes.slice(0, 5)
  |     |
  |     |-- moodCategories = buildMoodCategories(dietary)
  |           8 categories from EXPLORE_CATEGORIES
  |           + dietary prefix if vegan/vegetarian
  |
  v
Returns all computed sections to index.tsx for rendering
```

### Personalization Matrix

```
+---------------------+-------------------+-----------------------------+
| User Preference     | Sections Affected | How It's Used               |
+---------------------+-------------------+-----------------------------+
| likedCuisines[]     | Quick Chips       | Top 2 cuisines as chips     |
|                     | Picked For You    | Sent to API for ranking     |
|                     | Trending          | "Trending in [top cuisine]" |
|                     | Deep Dive         | "Because you love [cuisine]"|
+---------------------+-------------------+-----------------------------+
| dietaryRestrictions | Quick Chips       | Prefix: "Vegan Breakfast"   |
| (vegan/vegetarian)  | All API sections  | Server filters by diet      |
|                     | Mood Categories   | Prefix: "Vegan Comfort Food"|
+---------------------+-------------------+-----------------------------+
| allergens[]         | All API sections  | Server excludes allergens   |
+---------------------+-------------------+-----------------------------+
| savedRecipes        | Continue Journey  | Suggests related recipes    |
| (behavioral)        | Recently Saved    | Shows last 5 saved          |
+---------------------+-------------------+-----------------------------+
| Time of day         | Greeting          | Morning/Afternoon/Evening   |
| (automatic)         | Quick Chips       | Breakfast/Lunch/Dinner      |
+---------------------+-------------------+-----------------------------+
```

### Mood Categories (Constant Data)

```
+-----------------+------+----------------------------------------+
| Category        | Icon | Search Query (with dietary prefix)      |
+-----------------+------+----------------------------------------+
| Quick & Easy    | lightning| "[dietary] quick easy recipes"           |
| Comfort Food    | pot     | "[dietary] comfort food recipes"        |
| Something Light | salad   | "[dietary] light healthy recipes"       |
| One Pot         | fondue  | "[dietary] one pot recipes"             |
| Meal Prep       | box     | "[dietary] meal prep recipes"           |
| Date Night      | candle  | "[dietary] date night dinner recipes"   |
| Sweet Tooth     | cake    | "[dietary] dessert recipes"             |
| Breakfast       | pancakes| "[dietary] breakfast recipes"            |
+-----------------+------+----------------------------------------+
```

---

## Overall Data Flow Summary

```
+-------------------------------------------------------------------+
|                      COMPLETE APP DATA FLOW                        |
+-------------------------------------------------------------------+

  DISCOVERY (Browse)
    Home Feed -----> User sees sections -----> Taps recipe card
                                                    |
  SEARCH (Find)                                     |
    Type query -----> See results -----> Taps result|
                                                    |
  SHARE (External)                                  |
    YouTube Share -----> App intercepts ------>------+
                                                    |
                                                    v
                                            /recipe/preview
                                            (Video Preview)
                                                    |
                                         User taps "Save to Recipes"
                                                    |
                                                    v
                                          Quota Check (Subscription)
                                           |                |
                                         OK            Limit reached
                                           |                |
                                           |          Show Paywall
                                           |           /        \
                                           |       Purchase    Decline
                                           |         |           |
                                           |     Activate Pro   Error msg
                                           |         |
                                           v         v
                                     SSE Extraction Stream
                                     (ingredients flow in real-time)
                                                    |
                                                    v
                                            Recipe Saved
                                           /       |        \
                                          /        |         \
                                         v         v          v
                                    View in    Add to      Order on
                                    Recipes    Grocery     Instacart
                                    Tab        List
                                               |
                                               v
                                        Aisle-organized
                                        shopping list
                                               |
                                               v
                                        Order all on
                                        Instacart
```

---

## Key Files Reference

```
reles-mobile/
  app/
    _layout.tsx                 Root layout, auth routing, share intent
    (auth)/_layout.tsx          Auth flow navigation
    (tabs)/
      _layout.tsx               Tab bar configuration
      index.tsx                 Home/Discover feed + search
      recipes.tsx               Saved recipes list
      grocery.tsx               Grocery list (aisle-organized)
      profile.tsx               User preferences + subscription
      search.tsx                Dedicated search screen
    recipe/
      preview.tsx               Video preview + extraction UI
      [id].tsx                  Saved recipe detail

  hooks/
    useDiscovery.ts             Homepage feed logic & personalization
    useRecipeExtraction.ts      SSE streaming extraction pipeline
    useRecipeSearch.ts          YouTube search with debounce
    useRecipeDetail.ts          Single recipe fetching
    useRecipeList.ts            Saved recipes management

  contexts/
    AuthContext.tsx              Auth state, login/register/logout
    SubscriptionContext.tsx      RevenueCat init, paywall, quota tracking

  lib/
    api.ts                      All API client functions + SSE parser
    aggregation.ts              Ingredient normalization & deduplication
    aisles.ts                   Grocery aisle keyword mapping
    storage.ts                  AsyncStorage wrappers
    subscription.ts             Subscription constants (limits)
    types.ts                    TypeScript interfaces

  components/
    home/                       9 homepage section components
    ExtractionCard.tsx          Animated extraction progress
    PaywallModal.tsx            Pro subscription paywall
    VideoSearchResults.tsx      Search result list
    MetadataCard.tsx            Recipe metadata display
    GroceryItemRow.tsx          Single grocery item
    AisleSection.tsx            Aisle group in grocery list

  constants/
    colors.ts                   Design tokens (cream, burgundy, terracotta)
    explore-categories.ts       8 mood categories
    cuisines.ts                 Cuisine list
    dietary.ts                  Dietary options
```
