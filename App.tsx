import React, { useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

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
import { MobileBottomNav } from './src/components/MobileBottomNav';
import { Login } from './src/pages/Login';
import { BizDashboard } from './src/pages/BizDashboard';
import { Theme } from './src/theme';

const T: any = {
  en: {
    tagline: 'Merchant Portal',
    phoneLabel: 'Phone number',
    sendOtp: 'Send OTP',
    or: 'or',
    googleBtn: 'Continue with Google',
    devfrogsBtn: 'Continue with Devfrogs',
    otpTitle: 'Enter OTP',
    otpSub: 'We sent a 4-digit code to',
    verify: 'Verify & continue',
    changeNumber: 'Change number',
    onbQ1: 'What kind of business are you?',
    onbQ2: 'Tell us about your shop',
    shopNamePh: 'Shop Name',
    shopDescPh: 'What do you sell or stitch?',
    pincodePh: 'Pincode',
    continueBtn: 'Continue',
    launchBtn: 'Launch my shop',
  },
  hi: {
    tagline: 'मर्चेंट पोर्टल',
    phoneLabel: 'फ़ोन नंबर',
    sendOtp: 'OTP भेजें',
    or: 'या',
    googleBtn: 'Google से जारी रखें',
    devfrogsBtn: 'Devfrogs से जारी रखें',
    otpTitle: 'OTP दर्ज करें',
    otpSub: 'हमने कोड भेजा है',
    verify: 'सत्यापित करें',
    changeNumber: 'नंबर बदलें',
    onbQ1: 'आपका व्यवसाय किस प्रकार का है?',
    onbQ2: 'अपनी दुकान के बारे में बताएँ',
    shopNamePh: 'दुकान का नाम',
    shopDescPh: 'आप क्या बेचते या सिलते हैं?',
    pincodePh: 'पिनकोड',
    continueBtn: 'आगे बढ़ें',
    launchBtn: 'दुकान शुरू करें',
  }
};

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
  const [lang, setLang] = useState<'en' | 'hi'>('en');
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

  const toggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  const handleNavigate = (target: string) => {
    if (!loggedIn && target === 'home') {
      setScreen('login');
    } else {
      setScreen(target);
    }
  };

  const currentT = T[lang];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <Header
        t={currentT}
        langLabel={lang === 'en' ? 'हिं' : 'EN'}
        loggedIn={loggedIn}
        onNavigate={handleNavigate}
        onToggleLang={toggleLang}
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

      <MobileBottomNav
        currentTab="home"
        onSelectTab={(tab) => handleNavigate(tab === 'home' ? 'home' : 'home')}
        loggedIn={loggedIn}
      />
    </SafeAreaView>
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
