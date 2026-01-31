# AgriGuard — Smart Irrigation System

A voice-first, offline-first farmer assistant dashboard for irrigation and fertilizer management.

## Architecture

```
AGRI_GUARD3/
├── frontend/           # React UI (display only)
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── screens/    # Screen components
│   │   ├── contexts/   # React contexts (state)
│   │   └── services/   # API connectors
│   └── package.json
│
├── backend/            # Express API (logic)
│   ├── src/
│   │   ├── api/        # REST endpoints
│   │   ├── ai/         # AI engines
│   │   ├── data/       # Data stores
│   │   └── server.js   # Entry point
│   └── package.json
│
└── UI/                 # Legacy (deprecated)
```

## Quick Start

### 1. Start Backend
```bash
cd backend
npm install
npm run dev
# Server starts at http://localhost:3001
```

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

## API Endpoints

### Assistant API
- `POST /api/assistant/query` — Send text/voice query
- `GET /api/assistant/status` — Get assistant status

### Sensor API
- `GET /api/sensors` — Get current readings
- `POST /api/sensors/update` — Update sensor data

### Irrigation API
- `GET /api/irrigation/recommendation` — Get recommendation
- `POST /api/irrigation/check` — Run manual check

## Data Flow

```
Frontend (Voice/Text Input)
    ↓
API Call to Backend
    ↓
Intent Router (ai/intentRouter.js)
    ↓
Decision Engine (ai/irrigationEngine.js)
    ↓
Sensor Store (data/localSensorStore.js)
    ↓
Response Engine (ai/responseEngine.js)
    ↓
JSON Response
    ↓
Frontend UI + Voice Output
```

## Key Principles

1. **Frontend = Display Only**
   - Captures user input
   - Calls backend API
   - Displays responses
   - NO AI logic

2. **Backend = Logic Only**
   - Processes queries
   - Makes decisions
   - Generates responses
   - NO UI rendering

3. **Offline-First**
   - All AI logic runs locally
   - No external APIs required
   - Cached data for reliability

## Hindi/English Support

The AI understands both languages:
- "Should I irrigate today?"
- "Aaj paani dena chahiye?"
- "Mitti ki nammi batao"
- "Check soil moisture"
