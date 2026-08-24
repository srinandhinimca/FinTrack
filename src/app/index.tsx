import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, Platform } from 'react-native';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      // 1. Guard against Server Side Rendering executions
      if (Platform.OS === 'web' && typeof window === 'undefined') {
        return;
      }
      
      try {
        const launched = await AsyncStorage.getItem('already_launched');
        if (!launched) {
          await AsyncStorage.setItem('already_launched', 'true');
          setIsFirstLaunch(true);
        }
      } catch (error) {
        console.error("Storage error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkFirstLaunch();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isFirstLaunch) {
    return <Redirect href="/OnboardingScreen" />;
  }

  // 2. Route directly to the screen within the group folder
  return <Redirect href="/(auth)/AuthScreen" />;
}
