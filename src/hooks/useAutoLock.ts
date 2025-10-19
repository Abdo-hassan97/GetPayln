// src/hooks/useAutoLock.ts
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { logout } from '../store/slices/sessionSlice';
import type { AppDispatch } from '../store';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export const useAutoLock = (timeout = 10000) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  const isActiveScreen = route.name === 'AllProducts';

  const forceLogout = () => {
    if (!isActiveScreen) return; 
    console.log('🔒 Auto logout triggered');
    dispatch(logout());
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const resetTimer = () => {
    if (!isActiveScreen) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(forceLogout, timeout);
  };

  useEffect(() => {
    if (!isActiveScreen) return; 

    resetTimer();

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/active/) &&
        nextAppState.match(/inactive|background/)
      ) {
        console.log('🔒 App moved to background');
        forceLogout();
      }
      appState.current = nextAppState;
    });

    const touchHandler = () => resetTimer();
    const events = [
      'touchStart',
      'touchMove',
      'touchEnd',
      'keyPress',
      'keyDown',
      'keyUp',
    ];

    events.forEach(event => {
      // @ts-ignore
      global.addEventListener?.(event, touchHandler);
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      subscription.remove();
      events.forEach(event => {
        // @ts-ignore
        global.removeEventListener?.(event, touchHandler);
      });
    };
  }, [dispatch, timeout, isActiveScreen]);
};
