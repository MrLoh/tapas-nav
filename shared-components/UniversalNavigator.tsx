import React, { useState } from 'react';
import { LayoutAnimation, Platform, useWindowDimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useLengthAttribute } from 'styled-native-components';
import * as Linking from 'expo-linking';

import { ScreenContextProvider } from './ScreenContext';
import NavBar, {
  BOTTOM_TABS_HEIGHT,
  SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_COLLAPSED,
  SIDEBAR_BREAKPOINT,
  MENU_HEIGHT,
  SIDEBAR_COLLAPSED_BREAKPOINT,
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
  notFoundScreenComponent: React.ComponentType<{}>;
  modalScreens?: {
    [key: string]: {
      exactPath: string;
      component: React.ComponentType<{}>;
    };
  };
  tabScreens: {
    [key: string]: {
      exactPath: string;
      iconName: IconName;
      label: string;
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

export const useNavType = () => {
  const [sidebarBreakpoint, sidebarCollapsedBreakpoint] = useLengthAttribute(
    [SIDEBAR_BREAKPOINT, SIDEBAR_COLLAPSED_BREAKPOINT].join(' ')
  );
  const screenWidth = useWindowDimensions().width;
  const isNative = Platform.OS !== 'web';
  const navType = isNative
    ? screenWidth < sidebarBreakpoint
      ? ('bottom-tabs' as const)
      : ('sidebar' as const)
    : screenWidth < sidebarBreakpoint
    ? ('menu' as const)
    : ('sidebar' as const);
  const sidebarDefaultCollapsedState = sidebarCollapsedBreakpoint > screenWidth;

  return { navType, isNative, sidebarDefaultCollapsedState };
};

export default function UniversalNavigator({ config }: { config: NavigatorConfig }) {
  const [bottomTabsHeight, sidebarWidth, sidebarWidthCollapsed, menuHeight] = useLengthAttribute(
    [BOTTOM_TABS_HEIGHT, SIDEBAR_WIDTH, SIDEBAR_WIDTH_COLLAPSED, MENU_HEIGHT].join(' ')
  );
  const { navType, sidebarDefaultCollapsedState } = useNavType();
  const [sideBarCollapsed, setSideBarCollapsed] = useState(sidebarDefaultCollapsedState);

  const linking = {
    prefixes: [Linking.createURL('/'), config.domain],
    config: {
      initialRouteName: 'Main',
      screens: Object.assign(
        {
          Main: {
            path: '',
            screens: Object.assign(
              { NotFound: { path: '*' } },
              ...Object.entries(config.tabScreens).map(([tabName, tabConfig]) =>
                tabConfig.stackScreens
                  ? {
                      [tabName + 'Stack']: {
                        initialRouteName: tabName,
                        screens: Object.assign(
                          { [tabName]: { path: tabConfig.exactPath, exact: true } },
                          ...Object.entries(tabConfig.stackScreens).map(
                            ([screenName, screenConfig]) => ({
                              [screenName]: { path: screenConfig.exactPath, exact: true },
                            })
                          )
                        ),
                      },
                    }
                  : { [tabName]: { path: tabConfig.exactPath, exact: true } }
              )
            ),
          },
        },
        ...Object.entries(config.modalScreens || {}).map(([modalName, modalConfig]) => ({
          [modalName]: { path: modalConfig.exactPath, exact: true },
        }))
      ),
    },
  };

  const pathMap = [
    config.modalScreens
      ? Object.entries(config.modalScreens).map(([name, { exactPath: path }]) => ({ name, path }))
      : [],
    ...Object.entries(config.tabScreens).map(([tabName, { stackScreens, exactPath }]) => [
      { name: tabName, path: exactPath },
      ...Object.entries(stackScreens || {}).map(([name, { exactPath: path }]) => ({ name, path })),
    ]),
  ].reduce((curr: { [key: string]: string }, paths) => {
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
    if (!path) {
      throw new Error(`no path found for route name ${name}`);
    }
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
        <Modal.Navigator
          screenOptions={{
            header: () => null,
            presentation: navType === 'bottom-tabs' ? 'modal' : 'transparentModal',
          }}
        >
          <Modal.Screen name="Main">
            {() => (
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
                {Object.entries(config.tabScreens).map(([tabName, tabConfig]) =>
                  tabConfig.stackScreens ? (
                    <Tab.Screen
                      key={tabName}
                      name={tabName + 'Stack'}
                      options={{
                        // @ts-ignore -- cannot easily modify this type
                        iconName: tabConfig.iconName,
                        tabBarLabel: tabConfig.label,
                        // cannot be lazy so the stack navigator is initialized when navigating to a sub
                        // screen from a different tab (e.g. from dashboard to order details)
                        lazy: false,
                      }}
                    >
                      {() => {
                        const Stack = createStackNavigator();
                        return (
                          <Stack.Navigator
                            screenOptions={{
                              header: () => null,
                              gestureResponseDistance:
                                (navType === 'sidebar'
                                  ? sideBarCollapsed
                                    ? sidebarWidthCollapsed
                                    : sidebarWidth
                                  : 0) + 50,
                            }}
                          >
                            <Stack.Screen name={tabName} component={tabConfig.component} />
                            {Object.entries(tabConfig.stackScreens!).map(
                              ([name, { component }]) => (
                                <Stack.Screen key={name} name={name} component={component} />
                              )
                            )}
                          </Stack.Navigator>
                        );
                      }}
                    </Tab.Screen>
                  ) : (
                    <Tab.Screen
                      key={tabName}
                      name={tabName}
                      component={tabConfig.component}
                      options={{
                        // @ts-ignore -- cannot easily modify this type
                        iconName: tabConfig.iconName,
                        tabBarLabel: tabConfig.label,
                      }}
                    />
                  )
                )}
                <Tab.Screen name="NotFound" component={config.notFoundScreenComponent} />
              </Tab.Navigator>
            )}
          </Modal.Screen>
          {Object.entries(config.modalScreens || {}).map(([name, { component }]) => (
            <Modal.Screen key={name} name={name} component={component} />
          ))}
        </Modal.Navigator>
      </NavigationContainer>
    </ScreenContextProvider>
  );
}
