import React, { useState } from 'react';
import { LayoutAnimation, Platform, useWindowDimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useLengthAttribute } from 'styled-native-components';
import * as Linking from 'expo-linking';

import MoreScreen from './MoreScreen.native';
import { ScreenWrapperContext } from './ScreenWrapper';
import NavBar, {
  BOTTOM_TABS_HEIGHT,
  SIDE_BAR_WIDTH,
  SIDE_BAR_WIDTH_COLLAPSED,
  MENU_HEIGHT,
} from './NavBar';
import { IconName } from './Icon';

declare global {
  namespace ReactNavigation {
    interface RootParamList {
      [key: string]: any;
    }
  }
}

const Tab = createBottomTabNavigator();

const Modal = createStackNavigator();

type RouteConfig = {
  name: string;
  path: string;
  iconName: IconName;
  component: React.ComponentType<{}>;
  routes?: {
    name: string;
    path: string;
    component: React.ComponentType<{}>;
  }[];
};

export default function Navigator({ routes, domain }: { routes: RouteConfig[]; domain: string }) {
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

  const linking = {
    prefixes: [Linking.createURL('/'), domain],
    config: {
      screens: Object.assign(
        {},
        ...routes.map((tab) =>
          tab.routes
            ? {
                [tab.name + 'Stack']: {
                  initialRouteName: tab.name,
                  path: tab.path,
                  screens: Object.assign(
                    { [tab.name]: { path: '' } },
                    ...tab.routes.map((screen) => ({
                      [screen.name]: { path: screen.path, exact: true },
                    }))
                  ),
                },
              }
            : { [tab.name]: { path: tab.path } }
        )
      ),
    },
  };

  const truncate = navType === 'bottom-tabs' && routes.length > 5 ? 4 : 0;

  console.log(JSON.stringify(linking.config, null, 2));

  const stackScreenOptions = {
    header: () => null,
    gestureResponseDistance:
      (navType === 'sidebar' ? (sideBarCollapsed ? sidebarWidthCollapsed : sidebarWidth) : 0) + 50,
  };

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
      <NavigationContainer linking={linking}>
        <Tab.Navigator
          screenOptions={{ header: () => null }}
          tabBar={(props) => (
            <NavBar
              type={navType}
              collapsed={sideBarCollapsed}
              toggleCollapsed={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setSideBarCollapsed((v) => !v);
              }}
              {...props}
            />
          )}
        >
          {(truncate ? routes.slice(0, truncate) : routes).map((tab) =>
            tab.routes ? (
              <Tab.Screen
                name={tab.name + 'Stack'}
                // @ts-ignore -- cannot easily modify this type
                options={{ iconName: tab.iconName }}
                key={tab.name}
              >
                {() => {
                  const Stack = createStackNavigator();
                  return (
                    <Stack.Navigator screenOptions={stackScreenOptions}>
                      <Stack.Screen name={tab.name} component={tab.component} />
                      {tab.routes!.map(({ name, component }) => (
                        <Stack.Screen name={name} key={name} component={component} />
                      ))}
                    </Stack.Navigator>
                  );
                }}
              </Tab.Screen>
            ) : (
              <Tab.Screen
                name={tab.name}
                key={tab.name}
                component={tab.component}
                // @ts-ignore -- cannot easily modify this type
                options={{ iconName: tab.iconName }}
              />
            )
          )}
          {truncate ? (
            // @ts-ignore -- cannot easily modify this type
            <Tab.Screen name={'MoreStack'} options={{ iconName: 'menu' }}>
              {() => {
                const Stack = createStackNavigator();
                return (
                  <Stack.Navigator screenOptions={stackScreenOptions}>
                    <Stack.Screen name="More">
                      {() => <MoreScreen items={routes.slice(truncate)}></MoreScreen>}
                    </Stack.Screen>
                    {routes.slice(truncate).map(({ name, component }) => (
                      <Stack.Screen name={name} key={name} component={component} />
                    ))}
                  </Stack.Navigator>
                );
              }}
            </Tab.Screen>
          ) : null}
        </Tab.Navigator>
      </NavigationContainer>
    </ScreenWrapperContext.Provider>
  );
}
