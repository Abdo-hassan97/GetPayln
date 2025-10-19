# 📱 GetPayln App

A modern **React Native + TypeScript** mobile application built with:
- ⚡ React Query (with MMKV caching & offline mode)
- 🔄 Redux Toolkit for global state
- 🌐 React Navigation for routing
- 🧠 MMKV for persistent storage
- 📡 Secure API calls (with sign headers)

---

## 🚀 Setup Instructions

### 1️⃣ Clone the project

```bash
git clone https://github.com/YOUR_USERNAME/GetPayln.git
cd GetPayln
# 📱 install App
npm install
# or
yarn install
# Android setup
npx react-native run-android
✅ Make sure you have:

Android SDK installed

Emulator or physical device connected

In AndroidManifest.xml, allow HTTP if needed:
⚙️ Features

🧭 Splash screen with inactivity detection

📴 Offline indicator (using NetInfo)

💾 Persisted queries with MMKV (offline caching)

🔐 Secure login with API headers

🧰 Modular folder structure with reusable services