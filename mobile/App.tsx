import { StatusBar, Text, View } from 'react-native';
import {  useFonts, Roboto_400Regular,Roboto_700Bold } from '@expo-google-fonts/roboto';
import { NativeBaseProvider } from 'native-base';
import { Loading } from '@components/Loading';
import { Routes } from '@routes/index';
import { THEME } from './src/theme';
import React from 'react';
import { AuthContextProvider } from './src/contexts/AuthContext';
import { OneSignal } from 'react-native-onesignal';

OneSignal.initialize(process.env.EXPO_PUBLIC_API_URL!)

export default function App() {
  const [fontsLoaded] = useFonts({ Roboto_400Regular,Roboto_700Bold })
  
  return (
    <NativeBaseProvider theme={THEME}>
      <StatusBar 
        barStyle="light-content" 
        translucent 
        backgroundColor="transparent" 
      />
      <AuthContextProvider>
        { fontsLoaded ? <Routes /> : <Loading />}
      </AuthContextProvider>
    </NativeBaseProvider>
  );
}
