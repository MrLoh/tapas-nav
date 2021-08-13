import React, { useState } from 'react';
import styled from 'styled-native-components';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

export const BOTTOM_TABS_HEIGHT = '20rem';
export const SIDE_BAR_WIDTH = '60rem';
export const SIDE_BAR_WIDTH_COLLAPSED = '20rem';
export const MENU_HEIGHT = '16rem';

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
  width: ${(p) => (p.collapsed ? SIDE_BAR_WIDTH_COLLAPSED : SIDE_BAR_WIDTH)};
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

const Icon = styled(Ionicons).attrs<{ isFocused?: boolean }, { size: number; color: string }>(
  (p) => {
    return {
      size: 6 * p.theme.rem,
      color: p.theme.colors[p.isFocused ? 'primary' : 'text'],
    };
  }
)``;

const ToggleButton = styled.TouchableOpacity`
  position: absolute;
  right: 2rem;
  top: 50%;
  background: $background;
  height: 6rem;
  width: 6rem;
  border-radius: 3rem;
`;

const SideBarItem = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin: 2rem 0;
`;

const BottomTabItem = styled.TouchableOpacity`
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
    const { iconName } = descriptors[route.key].options;
    const isFocused = state.index === index;
    const routeName = route.name;
    const screenName = route.name.replace('Stack', '');

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(routeName, Platform.OS === 'web' ? { screen: screenName } : undefined);
      }
    };
    return { iconName, isFocused, routeName, screenName, onPress };
  };

  const safeArea = useSafeAreaInsets();

  const [menuOpen, setMenuOpen] = useState(false);

  switch (type) {
    case 'bottom-tabs':
      return (
        <BottomTabsWrapper>
          {state.routes
            .map(getItemConfig)
            .map(({ iconName, isFocused, routeName, screenName, onPress }) => (
              <BottomTabItem key={routeName} onPress={onPress}>
                <Icon isFocused={isFocused} name={iconName}></Icon>
                <BottomTabLabel isFocused={isFocused}>{screenName}</BottomTabLabel>
              </BottomTabItem>
            ))}
        </BottomTabsWrapper>
      );
    case 'sidebar':
      return (
        <SidebarWrapper collapsed={collapsed} safeArea={safeArea}>
          {state.routes
            .map(getItemConfig)
            .map(({ iconName, isFocused, routeName, screenName, onPress }) => {
              return (
                <SideBarItem key={routeName} onPress={onPress}>
                  <Icon isFocused={isFocused} name={iconName}></Icon>
                  {collapsed ? null : (
                    <SidebarLabel isFocused={isFocused}>{screenName}</SidebarLabel>
                  )}
                </SideBarItem>
              );
            })}
          <ToggleButton onPress={toggleCollapsed}>
            <Icon name={collapsed ? 'chevron-forward' : 'chevron-back'} color="card"></Icon>
          </ToggleButton>
        </SidebarWrapper>
      );
    case 'menu':
      return (
        <>
          {menuOpen ? (
            <MenuOverlay onPress={() => setMenuOpen(false)}>
              <SidebarWrapper safeArea={safeArea}>
                {state.routes
                  .map(getItemConfig)
                  .map(({ iconName, isFocused, routeName, screenName, onPress }) => {
                    return (
                      <SideBarItem
                        key={routeName}
                        onPress={() => {
                          onPress();
                          setMenuOpen(false);
                        }}
                      >
                        <Icon isFocused={isFocused} name={iconName}></Icon>
                        <SidebarLabel isFocused={isFocused}>{screenName}</SidebarLabel>
                      </SideBarItem>
                    );
                  })}
              </SidebarWrapper>
            </MenuOverlay>
          ) : null}
          <MenuWrapper>
            <Icon name="menu" onPress={() => setMenuOpen(true)} />
          </MenuWrapper>
        </>
      );
  }
}
