import React, { useState } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';

import Screen from './Screen';
import MoreScreen from './MoreScreen.native';
import { ScreenWrapperContext } from './ScreenWrapper';
import NavBar, {
  BOTTOM_TABS_HEIGHT,
  SIDE_BAR_WIDTH,
  SIDE_BAR_WIDTH_COLLAPSED,
  MENU_HEIGHT,
} from './NavBar';
import { useLengthAttribute } from 'styled-native-components';

declare global {
  namespace ReactNavigation {
    interface RootParamList {
      [key: string]: any;
    }
  }
}

const Tab = createBottomTabNavigator();
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

const truncateTabs = (tcs: typeof tabs, max?: number) =>
  max
    ? [
        ...tcs.slice(0, max),
        {
          name: 'More',
          iconName: 'menu' as const,
          Component: () => <MoreScreen items={tcs.slice(4)} />,
        },
      ]
    : tcs;

export default function Navigator() {
  const isSmallScreen = useWindowDimensions().width < 500;
  const isNative = Platform.OS !== 'web';
  const navType = isNative
    ? isSmallScreen
      ? 'bottom-tabs'
      : 'sidebar'
    : isSmallScreen
    ? 'menu'
    : 'sidebar';

  const [sideBarCollapsed, setSideBarCollapsed] = useState(false);

  const [bottomTabsHeight, sidebarWidth, sidebarWidthCollapsed, menuHeight] = useLengthAttribute(
    [BOTTOM_TABS_HEIGHT, SIDE_BAR_WIDTH, SIDE_BAR_WIDTH_COLLAPSED, MENU_HEIGHT].join(' ')
  );

  return (
    <ScreenWrapperContext.Provider
      value={{
        navType,
        margins: [
          navType === 'menu' ? menuHeight : 0,
          0,
          navType === 'bottom-tabs' ? bottomTabsHeight : 0,
          navType === 'sidebar' ? (sideBarCollapsed ? sidebarWidthCollapsed : sidebarWidth) : 0,
        ],
      }}
    >
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{ header: () => null }}
          tabBar={(props) => (
            <NavBar
              type={navType}
              collapsed={sideBarCollapsed}
              toggleCollapsed={() => setSideBarCollapsed((v) => !v)}
              {...props}
            />
          )}
        >
          {truncateTabs(tabs, navType === 'bottom-tabs' ? 4 : undefined).map(
            ({ name, iconName, Component }) => (
              <Tab.Screen name={name + 'Stack'} options={{ iconName }}>
                {() => (
                  <Stack.Navigator screenOptions={{ header: () => null }}>
                    <Stack.Screen name={name} component={Component} />
                    {[...(navType === 'bottom-tabs' ? tabs.slice(4) : []), ...screens].map(
                      ({ name, Component }) => (
                        <Stack.Screen name={name} component={Component} />
                      )
                    )}
                  </Stack.Navigator>
                )}
              </Tab.Screen>
            )
          )}
        </Tab.Navigator>
      </NavigationContainer>
    </ScreenWrapperContext.Provider>
  );
}
