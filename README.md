# Cafe-Tracker
App that can find good coffee options near you in real time (places which are open)
- No need to search (like in google) - but can have an option if need to 
- If places are open it shows
- If places are not open it doesn't show

1. Can filter:
- Price
- Proximity
- Vibe (chill, work friendly, lively etc)
- Study? 

2. Can add to a 'must-visit' list
- Users can add the cafes they want to visit 
- Can remove from the list
- Can move to the visited list

3. Have a visited list
- A little personal diary to note down the visited cafes and info about it 
This is there to be able to reference in the future if you want to visit again etc

### Folder Structure
Cafe-Tracker/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── CafeCard.tsx          # Individual cafe display
│   │   ├── CafeList.tsx          # Grid/list of CafeCards
│   │   ├── FilterBar.tsx         # Price + distance filters
│   │   ├── MapView.tsx           # Optional map component
│   │   ├── NavBar.tsx
│   │   └── DiaryEntry.tsx        # Notes/rating for visited cafes
│   ├── pages/
│   │   ├── Discover.tsx          # Main page - nearby cafes
│   │   ├── MustVisit.tsx         # Saved list
│   │   ├── Visited.tsx           # visited list
│   │   ├── home.tsx              # home elements
│   │   └── profile.tsx           # profile info
│   ├── hooks/
│   │   ├── useNearby.ts          # Fetches cafes from Google Places
│   │   └── useLocation.ts        # Gets user's GPS coords
│   ├── context/
│   │   └── CafeContext.tsx       # Global state (lists, filters)
│   ├── types/
│   │   └── cafe.ts               # TypeScript interfaces
│   ├── utils/
│   │   └── storage.ts            # localStorage read/write helpers
│   ├── App.tsx
│   └── main.tsx
├── .env                          # Your Google Places API key goes here
├── package.json
└── vite.config.ts