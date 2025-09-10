import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { database } from '@/lib/database';
import { notificationService } from '@/lib/notifications';
import { SplashScreen } from '@/components/SplashScreen';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Initialize database and notifications when app loads
    const initializeApp = async () => {
      try {
        console.log('Initializing GentleCycle app...');
        
        // Initialize database
        await database.initializeDatabase();
        console.log('Database initialized successfully');
        
        // Request notification permissions
        const hasPermissions = await notificationService.requestPermissions();
        if (hasPermissions) {
          console.log('Notification permissions granted');
        } else {
          console.log('Notification permissions denied');
        }
        
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    if (loaded) {
      initializeApp();
    }
  }, [loaded]);

  if (!loaded || showSplash) {
    return loaded ? (
      <SplashScreen onAnimationFinish={() => setShowSplash(false)} />
    ) : null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
