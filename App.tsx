import React, { useMemo } from 'react';
import { ThemeProvider, useWindowDimensions } from 'styled-native-components';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, Text } from 'react-native';
import { DefaultTheme, DarkTheme, Theme as NavigationTheme } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { UniversalNavigator, useNavType } from './shared-components';

import Screen from './screens/Screen';
import MoreScreen from './screens/MoreScreen.native';
import NotFoundScreen from './screens/NotFoundScreen';
import ModalScreen from './screens/ModalScreen';

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

// screen definitions

const Dashboard = {
  exactPath: '/',
  iconName: 'home' as const,
  label: 'Dashboard',
  component: Screen,
};

const Reports = {
  exactPath: '/reports',
  iconName: 'bar-chart' as const,
  label: 'Reports',
  component: Screen,
};

const DevicesList = {
  exactPath: '/devices',
  iconName: 'phone-landscape' as const,
  label: 'Devices',
  component: Screen,
  stackScreens: {
    Device: {
      exactPath: '/devices/:deviceId',
      component: Screen,
    },
    Update: {
      exactPath: '/update/:updateId',
      component: Screen,
    },
    UpdateCourse: {
      exactPath: '/update/:updateId/course/:courseId',
      component: Screen,
    },
    UpdateLesson: {
      exactPath: '/update/:updateId/course/:courseId/lesson/:lessonId',
      component: Screen,
    },
  },
};

const OrdersList = {
  exactPath: '/orders',
  iconName: 'cart' as const,
  label: 'Orders',
  component: Screen,
};

const Training = {
  exactPath: '/training',
  iconName: 'book' as const,
  label: 'Training',
  component: Screen,
  stackScreens: {
    InPersonTrainingPrep: {
      exactPath: '/in-person-training-prep',
      component: Screen,
    },
    Course: {
      exactPath: '/course/:courseId',
      component: Screen,
    },
    Lesson: {
      exactPath: '/course/:courseId/lesson/:lessonId',
      component: Screen,
    },
  },
};

const Upload = {
  exactPath: '/upload',
  iconName: 'cloud-upload' as const,
  label: 'Upload',
  component: Screen,
};

const Share = {
  exactPath: '/share',
  iconName: 'share' as const,
  label: 'Share',
  component: Screen,
};

const More = {
  exactPath: '/more',
  iconName: 'menu' as const,
  label: 'More',
  component: MoreScreen,
  stackScreens: {
    ...Training.stackScreens,
    Training,
    Upload,
    Share,
  },
};

const Profile = {
  exactPath: '/profile',
  component: ModalScreen,
};

const Notifications = {
  exactPath: '/notifications',
  component: ModalScreen,
};

const Navigator = () => {
  const { navType } = useNavType();
  return (
    <UniversalNavigator
      config={{
        domain: 'https://tapas.com',
        notFoundScreenComponent: NotFoundScreen,
        tabScreens:
          navType === 'bottom-tabs'
            ? {
                Dashboard,
                Reports,
                DevicesList,
                OrdersList,
                More,
              }
            : {
                Dashboard,
                Reports,
                DevicesList,
                OrdersList,
                Training,
                Upload,
                Share,
              },
        modalScreens: { Notifications, Profile },
      }}
    />
  );
};

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
