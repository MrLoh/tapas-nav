import React, { useMemo } from 'react';
import { ThemeProvider, useWindowDimensions } from 'styled-native-components';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, Text } from 'react-native';
import { DefaultTheme, DarkTheme, Theme as NavigationTheme } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Navigator from './Navigator';

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
        <Navigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
