import React from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';

import Screen from './Screen';
import MoreScreen from './MoreScreen.native';
import { ScreenWrapperContext } from './ScreenWrapper';

declare global {
  namespace ReactNavigation {
    interface RootParamList {
      [key: string]: any;
    }
  }
}

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();
const Modal = createStackNavigator();

const tabs = [
  { name: 'Dashboard', iconName: 'home' as const, Component: Screen },
  { name: 'Reports', iconName: 'bar-chart' as const, Component: Screen },
  { name: 'Devices', iconName: 'phone-landscape' as const, Component: Screen },
  { name: 'Orders', iconName: 'cart' as const, Component: Screen },
  { name: 'Training', iconName: 'book' as const, Component: Screen },
  { name: 'Upload', iconName: 'cloud-upload' as const, Component: Screen },
  { name: 'Share', iconName: 'share' as const, Component: Screen },
];

const screens = [{ name: 'Screen', Component: Screen }];

export default function Navigator() {
  const isSmallScreen = useWindowDimensions().width < 500;
  const isNative = Platform.OS !== 'web';
  return (
    <ScreenWrapperContext.Provider
      value={{ hasTabBar: isNative && isSmallScreen, showMenuBar: isSmallScreen && !isNative }}
    >
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ header: () => null }}>
          <Stack.Screen name="Home">
            {() =>
              isNative ? (
                <Tab.Navigator screenOptions={{ header: () => null }}>
                  {(isSmallScreen
                    ? [
                        ...tabs.slice(0, 4),
                        { name: 'More', Component: () => <MoreScreen items={tabs.slice(4)} /> },
                      ]
                    : tabs
                  ).map(({ name, Component }) => (
                    <Tab.Screen name={name} component={Component}></Tab.Screen>
                  ))}
                </Tab.Navigator>
              ) : (
                // isWeb
                <Drawer.Navigator
                  screenOptions={{
                    drawerType: isSmallScreen ? 'front' : 'permanent',
                    header: () => null,
                  }}
                >
                  {tabs.map(({ name, Component }) => (
                    <Drawer.Screen name={name} component={Component}></Drawer.Screen>
                  ))}
                  {screens.map(({ name, Component }) => (
                    <Stack.Screen name={name} component={Component} />
                  ))}
                </Drawer.Navigator>
              )
            }
          </Stack.Screen>
          {[...(isNative && isSmallScreen ? tabs.slice(4) : [])].map(({ name, Component }) => (
            <Stack.Screen name={name} component={Component} />
          ))}
        </Stack.Navigator>
      </NavigationContainer>
    </ScreenWrapperContext.Provider>
  );
}
