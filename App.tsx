import React, { useMemo } from 'react';
import { ThemeProvider, useWindowDimensions } from 'styled-native-components';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, Text } from 'react-native';
import { DefaultTheme, DarkTheme, Theme as NavigationTheme } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Navigator from './Navigator';
import Screen from './Screen';

enableScreens();

declare module 'styled-native-components' {
  export interface Theme {
    rem: number;
    dark: boolean;
    colors: NavigationTheme['colors'];
  }
}

// font scaling is disable globally and the app scales with the theme
// @ts-ignore -- missing type definitions
Text.defaultProps = { allowFontScaling: false };

const routes = [
  {
    name: 'Dashboard',
    path: '',
    iconName: 'home',
    component: Screen,
  },
  {
    name: 'Reports',
    path: 'reports',
    iconName: 'bar-chart',
    component: Screen,
  },
  {
    name: 'DeviceList',
    path: 'devices',
    iconName: 'phone-landscape',
    component: Screen,
    routes: [
      {
        name: 'Device',
        path: 'devices/:id',
        component: Screen,
      },
    ],
  },
  {
    name: 'Orders',
    path: 'orders',
    iconName: 'cart',
    component: Screen,
  },
  {
    name: 'Training',
    path: 'training',
    iconName: 'book',
    component: Screen,
  },
  {
    name: 'Upload',
    path: 'upload',
    iconName: 'cloud-upload',
    component: Screen,
  },
  {
    name: 'Share',
    path: 'share',
    iconName: 'share',
    component: Screen,
  },
];

export default function App() {
  const dark = useColorScheme() === 'dark';
  const { fontScale } = useWindowDimensions();
  const theme = useMemo(
    () => ({
      rem: 4 * fontScale,
      elevation: (value: number) => ({
        shadowColor: 'black',
        shadowOffset: { width: value / 2, height: value },
        shadowRadius: value * 2,
        shadowOpacity: dark ? 0.3 : value * 0.0325,
        elevation: value,
        zIndex: value,
      }),
      dark,
      colors: dark ? DarkTheme.colors : DefaultTheme.colors,
    }),
    [fontScale, dark]
  );
  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <StatusBar style="auto" />
        <Navigator routes={routes} domain="https://tapas.com" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
