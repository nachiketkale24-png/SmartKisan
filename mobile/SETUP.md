# Kisan Sahayak Mobile Setup

## Prerequisites
- Node.js v18 or v20 (NOT v23)
- Expo Go app on your phone

## Setup Steps

### 1. Install NVM (if you have Node v23)
```powershell
# Windows - use nvm-windows
# Download from: https://github.com/coreybutler/nvm-windows/releases

nvm install 20
nvm use 20
```

### 2. Install Dependencies
```bash
cd mobile
npm install
```

### 3. Configure Backend IP
Edit `config.js` and update `BACKEND_IP` to your computer's IP:
```javascript
const BACKEND_IP = '192.168.1.XXX'; // Your IP here
```

Find your IP:
- Windows: `ipconfig` → Look for "IPv4 Address"
- Mac/Linux: `ifconfig` or `ip addr`

### 4. Start Backend (in backend folder)
```bash
cd ../backend
npm install
node src/server.js
```
Backend runs on port 3002.

### 5. Start Mobile App
```bash
cd mobile
npx expo start
```

### 6. Connect Phone
- Open Expo Go app on phone
- Scan QR code from terminal
- Make sure phone is on same WiFi as computer

## Troubleshooting

### "Network request failed"
- Check if backend is running (`http://YOUR_IP:3002/api/status/health`)
- Ensure phone and computer are on same network
- Update `config.js` with correct IP

### Expo not starting (Node v23 error)
- Install Node v18 or v20 using NVM
- Run `nvm use 20` before starting Expo

## Architecture
- REST API only (no WebSocket)
- Offline-first with local intent detection
- Hindi/Hinglish/English support
