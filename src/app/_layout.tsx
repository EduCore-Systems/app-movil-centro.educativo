import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from '../context/AuthContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inLogin = segments[0] === 'login';

    if (!user && !inLogin) {
      router.replace('/login');
    } else if (user && inLogin) {
      router.replace('/');
    }

    SplashScreen.hideAsync().catch(() => {});
  }, [user, loading, segments]);

  // Pantalla de Splash Institucional mientras inicializa Firebase
  if (loading) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar style="light" />
        <View style={styles.splashCenter}>
          <View style={styles.splashIconBox}>
            <Ionicons name="school" size={64} color="#FFFFFF" />
          </View>
          <Text style={styles.splashBrand}>EduCore</Text>
          <Text style={styles.splashSlogan}>Educar para Transformar</Text>
        </View>

        <View style={styles.splashBottom}>
          <ActivityIndicator size="small" color="#FFFFFF" style={{ marginBottom: 12 }} />
          <Text style={styles.splashLoadingText}>INICIANDO SISTEMA...</Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="explore" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#EA580C',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
  },
  splashCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashIconBox: {
    width: 104,
    height: 104,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  splashBrand: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  splashSlogan: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 6,
    fontWeight: '500',
  },
  splashBottom: {
    alignItems: 'center',
  },
  splashLoadingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
});
