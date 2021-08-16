import React, { useState } from 'react';
import styled from 'styled-native-components';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { Platform } from 'react-native';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

import Icon, { IconName } from './Icon';
import TouchableLink from './TouchableLink';
import { CommonActions, NavigationAction } from '@react-navigation/native';

export const BOTTOM_TABS_HEIGHT = '20rem';
export const SIDEBAR_WIDTH = '60rem';
export const SIDEBAR_WIDTH_COLLAPSED = '20rem';
export const MENU_HEIGHT = '16rem';
export const SIDEBAR_BREAKPOINT = '160rem';
export const SIDEBAR_COLLAPSED_BREAKPOINT = '250rem';

const BottomTabsWrapper = styled.View`
  position: absolute;
  bottom: 0;
  width: 100%;
  height: ${BOTTOM_TABS_HEIGHT};
  background: $card;
  elevation: 3;
  flex-direction: row;
  justify-content: space-around;
`;

const SidebarWrapper = styled.ScrollView<{ collapsed?: boolean; safeArea: EdgeInsets }>`
  position: absolute;
  height: 100%;
  width: ${(p) => (p.collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH)};
  background: $card;
  elevation: 3;
  contentContainer {
    padding: 4rem;
    padding-top: ${(p) => p.safeArea.top + 4 * p.theme.rem}px;
    padding-bottom: ${(p) => p.safeArea.bottom + 4 * p.theme.rem}px;
  }
`;

const MenuWrapper = styled.View`
  position: absolute;
  width: 100%;
  height: ${MENU_HEIGHT};
  background: $card;
  elevation: 3;
  padding: 4rem;
`;

const ToggleButton = styled.TouchableOpacity`
  position: absolute;
  right: 2rem;
  top: 50%;
  background: $background;
  height: 6rem;
  width: 6rem;
  border-radius: 3rem;
`;

const SideBarLinkWrapper = styled(TouchableLink)`
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin: 1rem 0;
  padding: 1rem 3rem;
  border-radius: 1rem;
  hovered {
    background: $background;
  }
`;

const BottomTabItem = styled(TouchableLink)`
  justify-content: flex-start;
  align-items: center;
  margin-top: 2rem;
  width: 14rem;
`;

const BottomTabLabel = styled.Text<{ isFocused?: boolean }>`
  font-size: 2rem;
  color: ${(p) => (p.isFocused ? '$primary' : '$text')};
`;

const SidebarLabel = styled.Text<{ isFocused?: boolean }>`
  font-size: 4rem;
  color: ${(p) => (p.isFocused ? '$primary' : '$text')};
  margin-left: 2rem;
`;

const MenuOverlay = styled.TouchableOpacity`
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10;
`;

const SideBarItem = ({
  collapsed,
  isFocused,
  iconName,
  label,
  ...props
}: {
  collapsed?: boolean;
  isFocused: boolean;
  iconName: IconName;
  label: string;
  routeName: string;
  onCheckIfNavigationShouldBePrevented: () => boolean;
  navigationAction: NavigationAction;
  onAfterNavigation?: () => void;
}) => {
  return (
    <SideBarLinkWrapper {...props}>
      <Icon color={isFocused ? '$primary' : '$text'} size="6rem" name={iconName}></Icon>
      {collapsed ? null : <SidebarLabel isFocused={isFocused}>{label}</SidebarLabel>}
    </SideBarLinkWrapper>
  );
};

export default function NavBar({
  type,
  collapsed,
  toggleCollapsed,
  state,
  descriptors,
  navigation,
}: BottomTabBarProps & {
  collapsed: boolean;
  toggleCollapsed: () => void;
  type: 'bottom-tabs' | 'sidebar' | 'menu';
}) {
  const getItemConfig = (route: typeof state.routes[number], index: number) => {
    // @ts-ignore -- cannot modify this type easily but it is passed
    const iconName: IconName = descriptors[route.key].options.iconName;
    const isFocused = state.index === index;

    const onCheckIfNavigationShouldBePrevented = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      return isFocused || event.defaultPrevented;
    };

    const navigationAction = CommonActions.navigate(route.name, {
      screen:
        Platform.OS === 'web' && route.name.includes('Stack')
          ? route.name.replace('Stack', '')
          : undefined,
    });

    return {
      routeName: route.name,
      iconName,
      label: route.name.replace('Stack', ''),
      isFocused,
      onCheckIfNavigationShouldBePrevented,
      navigationAction,
    };
  };

  const safeArea = useSafeAreaInsets();

  const [menuOpen, setMenuOpen] = useState(false);

  switch (type) {
    case 'bottom-tabs':
      return (
        <BottomTabsWrapper>
          {state.routes.map(getItemConfig).map((item) => (
            <BottomTabItem key={item.routeName} {...item}>
              <Icon
                color={item.isFocused ? '$primary' : '$text'}
                name={item.iconName}
                size="6rem"
              />
              <BottomTabLabel isFocused={item.isFocused}>{item.label}</BottomTabLabel>
            </BottomTabItem>
          ))}
        </BottomTabsWrapper>
      );
    case 'sidebar':
      return (
        <SidebarWrapper collapsed={collapsed} safeArea={safeArea}>
          {state.routes.map(getItemConfig).map((item) => {
            return <SideBarItem collapsed={collapsed} key={item.routeName} {...item} />;
          })}
          <ToggleButton onPress={toggleCollapsed}>
            <Icon name={collapsed ? 'chevron-forward' : 'chevron-back'} color="$text" size="6rem" />
          </ToggleButton>
        </SidebarWrapper>
      );
    case 'menu':
      return (
        <>
          {menuOpen ? (
            <MenuOverlay onPress={() => setMenuOpen(false)}>
              <SidebarWrapper safeArea={safeArea}>
                {state.routes.map(getItemConfig).map((item) => {
                  return (
                    <SideBarItem
                      key={item.routeName}
                      onAfterNavigation={() => setMenuOpen(false)}
                      {...item}
                    />
                  );
                })}
              </SidebarWrapper>
            </MenuOverlay>
          ) : null}
          <MenuWrapper>
            <Icon name="menu" color="$text" size="6rem" onPress={() => setMenuOpen(true)} />
          </MenuWrapper>
        </>
      );
  }
}
