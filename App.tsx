import React, { useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Font loaders from @expo-google-fonts
import {
  useFonts,
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic
} from '@expo-google-fonts/instrument-serif';
import {
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_600SemiBold,
  InstrumentSans_700Bold
} from '@expo-google-fonts/instrument-sans';

import { Header } from './src/components/Header';
import { Login } from './src/pages/Login';
import { BizDashboard } from './src/pages/BizDashboard';
import { theme as Theme } from '@arli/tokens';
import { getMerchantDictionary, toggleLang as flipLang, otherLangLabel, type Lang } from '@arli/i18n';



export default function App() {
  const [fontsLoaded] = useFonts({
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
    InstrumentSans_400Regular,
    InstrumentSans_500Medium,
    InstrumentSans_600SemiBold,
    InstrumentSans_700Bold
  });

  const [screen, setScreen] = useState('login');
  const [lang, setLang] = useState<Lang>('en');
  const [loggedIn, setLoggedIn] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [_shopDetails, setShopDetails] = useState({ name: '', pin: '' });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2A3B66" />
        <Text style={styles.loadingText}>ARLI Merchant loading…</Text>
      </View>
    );
  }


  const handleNavigate = (target: string) => {
    if (!loggedIn && target === 'home') {
      setScreen('login');
    } else {
      setScreen(target);
    }
  };

  const currentT = getMerchantDictionary(lang);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <Header
        t={currentT}
        langLabel={otherLangLabel(lang)}
        loggedIn={loggedIn}
        onNavigate={handleNavigate}
        onToggleLang={() => setLang(flipLang)}
      />

      <View style={styles.body}>
        {screen === 'login' && (
          <Login
            t={currentT}
            onLoginSuccess={() => {
              setLoggedIn(true);
              setScreen('home');
            }}
            lang={lang}
          />
        )}
        {screen === 'home' && (
          <BizDashboard
            t={currentT}
            lang={lang}
            isRegistered={isRegistered}
            onRegister={(name, pin) => {
              setShopDetails({ name, pin });
              setIsRegistered(true);
            }}
          />
        )}
      </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.bgPrimary,
  },
  body: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FAF5EC',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#2A3B66',
  },
});
