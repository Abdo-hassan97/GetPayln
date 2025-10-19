import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Animated,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { loginUser } from '../store/slices/sessionSlice';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import ReactNativeBiometrics from 'react-native-biometrics';
import { getString } from '../storage/mmkv';
import { RootStackParamList } from '../navigation/RootNavigator';
import SweetAlert from 'react-native-sweet-alert';

const eyeIcon = require('../assets/images/eye.png');
const eyeOffIcon = require('../assets/images/eye-off.png');
const fingerprintIcon = require('../assets/images/fingerprint.png');

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { loading, error } = useSelector((state: RootState) => state.session);

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const rnBiometrics = new ReactNativeBiometrics();
    rnBiometrics.isSensorAvailable().then(result => {
      const { available } = result;
      setBiometricAvailable(available);
    });
  }, []);

  const validateInputs = () => {
    let valid = true;
    const newErrors: { username?: string; password?: string } = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
      valid = false;
    }
    if (!password.trim()) {
      newErrors.password = 'Password is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleBiometricLogin = async () => {
    const token = getString('token');
    if (!token) {
      SweetAlert.showAlertWithOptions({
        title: 'No session found',
        subTitle: 'Please login manually first.',
        confirmButtonTitle: 'OK',
        confirmButtonColor: '#000',
        style: 'error',
      });
      return;
    }

    const rnBiometrics = new ReactNativeBiometrics();
    const { success } = await rnBiometrics.simplePrompt({
      promptMessage: 'Unlock with Biometrics',
    });

    if (success) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } else {
      SweetAlert.showAlertWithOptions({
        title: 'Authentication failed',
        subTitle: 'Try again or use password login.',
        confirmButtonTitle: 'OK',
        confirmButtonColor: '#000',
        style: 'error',
      });
    }
  };

  // ✅ النسخة المعدلة بدون Alert عند النجاح
  const handleLogin = async () => {
    if (!validateInputs()) return;

    try {
      const result = await dispatch(loginUser({ username, password }));

      if (loginUser.fulfilled.match(result)) {
         setErrors({});
        // نجاح تسجيل الدخول ➜ الانتقال مباشرة
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } else {
        // فشل تسجيل الدخول ➜ عرض الخطأ
        const payload = result.payload as any;
        const message =
          typeof payload === 'string'
            ? payload
            : payload?.message || 'Invalid credentials. Please try again.';

        SweetAlert.showAlertWithOptions({
          title: 'Login Failed',
          subTitle: String(message),
          confirmButtonTitle: 'OK',
          confirmButtonColor: '#000',
          style: 'error',
        });
      }
    } catch (err: any) {
      SweetAlert.showAlertWithOptions({
        title: 'Login Error',
        subTitle: String(err.message || 'Something went wrong'),
        confirmButtonTitle: 'OK',
        confirmButtonColor: '#000',
        style: 'error',
      });
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>Login to continue</Text>

      <TextInput
        style={[styles.input, errors.username && styles.inputError]}
        placeholder="Username"
        placeholderTextColor="#888"
        value={username}
        onChangeText={text => {
          setUsername(text);
          if (errors.username) setErrors(prev => ({ ...prev, username: undefined }));
        }}
        autoCapitalize="none"
      />
      {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

      <View style={[styles.passwordWrapper, errors.password && styles.inputError]}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry={secure}
          value={password}
          onChangeText={text => {
            setPassword(text);
            if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
          }}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setSecure(!secure)} style={styles.iconButton}>
          <Image source={secure ? eyeOffIcon : eyeIcon} style={styles.iconImage} />
        </TouchableOpacity>
      </View>
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        {biometricAvailable && (
          <TouchableOpacity
            style={styles.fingerprintInlineButton}
            onPress={handleBiometricLogin}>
            <Image source={fingerprintIcon} style={styles.fingerprintInlineIcon} />
          </TouchableOpacity>
        )}
      </View>

      {loading && (
        <View style={styles.inlineLoaderContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      )}


    </Animated.View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    marginBottom: 6,
    color: '#000',
  },
  inputError: {
    borderColor: 'red',
  },
  passwordWrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 8,
    marginTop: 8,
    marginBottom: 6,
  },
  passwordInput: { flex: 1, paddingVertical: 10, paddingHorizontal: 6, color: '#000' },
  iconButton: { padding: 8, marginLeft: 6 },
  iconImage: { width: 22, height: 22, tintColor: '#444' },
  buttonRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    backgroundColor: '#000',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  fingerprintInlineButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
  },
  fingerprintInlineIcon: {
    width: 30,
    height: 30,
    tintColor: '#000',
  },
  errorText: {
    width: '100%',
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
  },
  serverError: { color: 'red', marginTop: 12, textAlign: 'center' },
  inlineLoaderContainer: {
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});
