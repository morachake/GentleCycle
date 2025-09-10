# GentleCycle 🌸

A comprehensive period tracking and menstrual health app built with React Native and Expo.

## Features

- 📅 **Period Calendar**: Visual cycle tracking with color-coded phases
- 📊 **Analytics**: Real-time insights and cycle statistics  
- 🩸 **Symptom Tracking**: Daily mood, energy, and symptom logging
- 🔔 **Smart Notifications**: Period and fertility reminders
- 📈 **Cycle Predictions**: AI-powered cycle forecasting
- 🔒 **Privacy First**: All data stored locally on device

## Get Started

1. Install dependencies
   ```bash
   npm install
   ```

2. Start the app
   ```bash
   npx expo start
   ```

## Important: Notifications & Development Build

⚠️ **For full functionality, use a development build instead of Expo Go**

With Expo SDK 53+, push notifications are not fully supported in Expo Go. To enable all features:

### Create a Development Build

1. Install EAS CLI
   ```bash
   npm install -g eas-cli
   ```

2. Configure EAS
   ```bash
   eas build:configure
   ```

3. Build for your platform
   ```bash
   # For iOS
   eas build --platform ios --profile development
   
   # For Android  
   eas build --platform android --profile development
   ```

4. Install the development build on your device

### What Works in Expo Go vs Development Build

| Feature | Expo Go | Development Build |
|---------|---------|------------------|
| Period Tracking | ✅ Full | ✅ Full |
| Calendar & Analytics | ✅ Full | ✅ Full |
| Data Storage | ✅ Full | ✅ Full |
| Push Notifications | ⚠️ Limited | ✅ Full |
| Local Notifications | ✅ Full | ✅ Full |

## Database

GentleCycle uses SQLite for local data storage:
- All data is stored on-device for privacy
- No cloud sync or external servers
- Data persists between app launches
- Export/import functionality for backups

## App Structure

```
app/
├── (tabs)/
│   ├── index.tsx          # Home/Dashboard
│   ├── calendar.tsx       # Period Calendar  
│   ├── analytics.tsx      # Insights & Charts
│   ├── symptoms.tsx       # Daily Symptom Entry
│   └── settings.tsx       # App Settings
lib/
├── database/              # SQLite operations
├── services/              # Data services
└── utils/                 # Utility functions
components/
├── ui/                    # Reusable UI components
├── period/                # Period-specific components
└── modals/                # Modal dialogs
```

## Development

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **Database**: Expo SQLite
- **UI**: Custom components with consistent theming
- **Charts**: React Native Chart Kit
- **Notifications**: Expo Notifications

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [React Native](https://reactnative.dev/)

## Privacy

GentleCycle prioritizes user privacy:
- All data stored locally on device
- No user accounts or cloud storage required  
- No data collection or analytics tracking
- Full user control over data export/import