import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  AppState,
  AppStateStatus,
  PanResponder,
  Text,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './src/store';
import { QueryClientProvider } from '@tanstack/react-query';
import RootNavigator from './src/navigation/RootNavigator';
import { queryClient } from './src/utils/queryClient'; 

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [inactive, setInactive] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigationRef = useNavigationContainerRef();

  // ✅ Splash screen
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
    });
    return () => unsubscribe();
  }, []);

  // ✅ Reset inactivity timer
  const resetInactivityTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setInactive(false);
    timeoutRef.current = setTimeout(() => setInactive(true), 10000);
  };

  // ✅ App goes background / foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/active/) &&
        nextAppState.match(/inactive|background/)
      ) {
        setInactive(true);
      } else if (nextAppState === 'active') {
        resetInactivityTimer();
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', resetInactivityTimer);
    const hideSub = Keyboard.addListener('keyboardDidHide', resetInactivityTimer);
    const changeSub = Keyboard.addListener('keyboardDidChangeFrame', resetInactivityTimer);

    return () => {
      showSub.remove();
      hideSub.remove();
      changeSub.remove();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = navigationRef.addListener('state', resetInactivityTimer);
    return unsubscribe;
  }, [navigationRef]);

  // ✅ Start timer on mount
  useEffect(() => {
    resetInactivityTimer();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: resetInactivityTimer,
      onPanResponderMove: resetInactivityTimer,
      onPanResponderRelease: resetInactivityTimer,
    })
  ).current;

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <Image
          source={require('./src/assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer ref={navigationRef}>
          <View style={{ flex: 1 }} {...panResponder.panHandlers}>
            <RootNavigator />

            {!isConnected && (
              <View style={styles.noInternetOverlay}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.noInternetText}>No Internet Connection</Text>
              </View>
            )}

            {inactive && <View style={styles.overlay} />}
          </View>
        </NavigationContainer>
      </QueryClientProvider>
    </ReduxProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 300,
    height: 300,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(128,128,128,0.5)',
    zIndex: 9998,
  },
  noInternetOverlay: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  noInternetText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
});
