import React, { useState } from 'react';
import { LayoutAnimation, Platform, useWindowDimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useLengthAttribute } from 'styled-native-components';
import * as Linking from 'expo-linking';

import MoreScreen from './MoreScreen.native';
import { ScreenContextProvider } from './ScreenContext';
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

type NavigatorConfig = {
  domain: string;
  tabScreens: {
    [key: string]: {
      exactPath: string;
      iconName: IconName;
      component: React.ComponentType<{}>;
      stackScreens?: {
        [key: string]: {
          exactPath: string;
          component: React.ComponentType<{}>;
        };
      };
    };
  };
};

export default function Navigator({ config }: { config: NavigatorConfig }) {
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
    prefixes: [Linking.createURL('/'), config.domain],
    config: {
      screens: Object.assign(
        {},
        ...Object.entries(config.tabScreens).map(([tabName, tabConfig]) =>
          tabConfig.stackScreens
            ? {
                [tabName + 'Stack']: {
                  initialRouteName: tabName,
                  screens: Object.assign(
                    { [tabName]: { path: tabConfig.exactPath, exact: true } },
                    ...Object.entries(tabConfig.stackScreens).map(([screenName, screenConfig]) => ({
                      [screenName]: { path: screenConfig.exactPath, exact: true },
                    }))
                  ),
                },
              }
            : { [tabName]: { path: tabConfig.exactPath, exact: true } }
        )
      ),
    },
  };

  const pathMap = Object.entries(config.tabScreens)
    .map(([tabName, { stackScreens, exactPath }]) => [
      { name: tabName, path: exactPath },
      ...Object.entries(stackScreens || {}).map(([name, { exactPath }]) => ({
        name,
        path: exactPath,
      })),
    ])
    .reduce((curr: { [key: string]: string }, paths) => {
      paths.forEach(({ name, path }) => {
        if (name in curr) {
          throw new Error(`routes must be unique across all stacks, ${name} was duplicated`);
        }
        curr[name] = path;
      });
      return curr;
    }, {});

  // the default useLinkBuilder hook doesn't work for determining links for a nested tab in a
  // different stack than the one you are currently in, thus we build a custom solution
  const buildLink = (name: string, params?: { [key: string]: string | number }) => {
    const path = pathMap[name] || pathMap[name.replace('Stack', '')];
    let link = path;
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        if (!link.includes(`:${param}`)) {
          throw new Error(`unknown param ${param} provided for path ${path}`);
        }
        link = link.replace(`:${param}`, String(value));
      });
    }
    if (link.includes('/:')) {
      throw new Error(`missing param for path ${path} in ${JSON.stringify(params)}`);
    }
    return link;
  };

  const truncate =
    navType === 'bottom-tabs' && Object.entries(config.tabScreens).length > 5 ? 4 : 0;

  const stackScreenOptions = {
    header: () => null,
    gestureResponseDistance:
      (navType === 'sidebar' ? (sideBarCollapsed ? sidebarWidthCollapsed : sidebarWidth) : 0) + 50,
  };

  return (
    <ScreenContextProvider
      value={{
        navType,
        buildLink,
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
          {(truncate
            ? Object.entries(config.tabScreens).slice(0, truncate)
            : Object.entries(config.tabScreens)
          ).map(([tabName, tabConfig]) =>
            tabConfig.stackScreens ? (
              <Tab.Screen
                name={tabName + 'Stack'}
                // @ts-ignore -- cannot easily modify this type
                options={{ iconName: tabConfig.iconName }}
                key={tabName}
              >
                {() => {
                  const Stack = createStackNavigator();
                  return (
                    <Stack.Navigator screenOptions={stackScreenOptions}>
                      <Stack.Screen name={tabName} component={tabConfig.component} />
                      {Object.entries(tabConfig.stackScreens!).map(([name, { component }]) => (
                        <Stack.Screen name={name} key={name} component={component} />
                      ))}
                    </Stack.Navigator>
                  );
                }}
              </Tab.Screen>
            ) : (
              <Tab.Screen
                name={tabName}
                key={tabName}
                component={tabConfig.component}
                // @ts-ignore -- cannot easily modify this type
                options={{ iconName: tabConfig.iconName }}
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
                      {() => (
                        <MoreScreen
                          items={Object.entries(config.tabScreens)
                            .slice(truncate)
                            .map(([name, { iconName }]) => ({ name, iconName }))}
                        ></MoreScreen>
                      )}
                    </Stack.Screen>
                    {Object.entries(config.tabScreens)
                      .slice(truncate)
                      .map(([name, { component }]) => (
                        <Stack.Screen name={name} key={name} component={component} />
                      ))}
                  </Stack.Navigator>
                );
              }}
            </Tab.Screen>
          ) : null}
        </Tab.Navigator>
      </NavigationContainer>
    </ScreenContextProvider>
  );
}
