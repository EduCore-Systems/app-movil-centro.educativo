import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
import * as authModule from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCcvsPsIkpMTl87LlnhbdaCrwhdxUXVmRw',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'educore-systems-dd8a3.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'educore-systems-dd8a3',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'educore-systems-dd8a3.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '34032202235',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:34032202235:web:d55794496203dda8555b5e',
};

// Inicializar la app de Firebase (evita inicializaciones duplicadas)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Obtener getReactNativePersistence de forma segura para mobile
const getPersistence = (authModule as unknown as { getReactNativePersistence?: (storage: typeof AsyncStorage) => any }).getReactNativePersistence;

// Inicializar Auth con persistencia en AsyncStorage (mantiene la sesion en el dispositivo)
export const auth = initializeAuth(app, {
  persistence: getPersistence ? getPersistence(AsyncStorage) : undefined,
});

// Inicializar Cloud Firestore (misma base de datos que la web)
export const db = getFirestore(app);

export default app;
