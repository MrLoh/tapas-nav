import React, { useState } from 'react';
import styled, { useLengthAttribute } from 'styled-native-components';
import { Platform, TextStyle, ViewStyle } from 'react-native';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { CommonActions, NavigationAction } from '@react-navigation/native';

import Icon, { IconName } from './Icon';
import TouchableLink from './TouchableLink';

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

const SidebarLabel = styled.Text<{ isFocused?: boolean }>`
  font-size: 4rem;
  color: ${(p) => (p.isFocused ? '$primary' : '$text')};
  margin-left: 2rem;
`;

const MenuPosition = styled.View`
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 10;
`;

const MenuOverlay = styled.TouchableOpacity.attrs({
  activeOpacity: 1,
})`
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
`;

const Label = styled.Text<{ isFocused: boolean }>`
  color: ${(p) => (p.isFocused ? '$primary' : '$text')};
`;

const NavItem = ({
  collapsed,
  isFocused,
  iconName,
  label,
  labelStyle,
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
  style?: ViewStyle;
  labelStyle?: TextStyle;
}) => {
  return (
    <TouchableLink
      {...props}
      accessibilityLabel={label}
      // TODO: test if tab is still broken on iOS, see https://github.com/react-navigation/react-navigation/blob/80a8567618b8ef52be1e4e73a9a8ccdff3a31244/packages/bottom-tabs/src/views/BottomTabItem.tsx#L266
      accessibilityRole={Platform.select({ ios: 'button', default: 'tab', web: 'link' })}
      accessibilityState={{ selected: isFocused }}
    >
      <Icon color={isFocused ? '$primary' : '$text'} size="6rem" name={iconName}></Icon>
      {collapsed ? null : (
        <Label style={labelStyle} isFocused={isFocused}>
          {label}
        </Label>
      )}
    </TouchableLink>
  );
};

const SideBarItem = styled(NavItem)`
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin: 1rem 0;
  padding: 1rem 3rem;
  border-radius: 1rem;
  hovered {
    background: $background;
  }
  label {
    font-size: 4rem;
    margin-left: 2rem;
  }
`;

const BottomTabItem = styled(NavItem)`
  justify-content: flex-start;
  align-items: center;
  margin-top: 2rem;
  width: 14rem;
  label {
    font-size: 2rem;
  }
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
    const options = descriptors[route.key].options;
    // @ts-ignore -- cannot modify this type easily but it is passed
    const iconName: IconName = options.iconName;
    // @ts-ignore -- cannot modify this type easily but it is passed as string
    const label: string = options.tabBarLabel;
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
          ? // on web we want to always go to the first screen in a stack
            route.name.replace('Stack', '')
          : undefined,
    });

    return {
      routeName: route.name,
      iconName,
      label,
      isFocused,
      onCheckIfNavigationShouldBePrevented,
      navigationAction,
    };
  };

  const safeArea = useSafeAreaInsets();

  const menuAnimation = useSharedValue(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const animationConfig = {
    stiffness: 1000,
    damping: 500,
    mass: 3,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  };
  const openMenu = () => {
    console.log('open');
    setMenuOpen(true);
    menuAnimation.value = withSpring(1, animationConfig);
  };
  const closeMenu = () => {
    menuAnimation.value = withSpring(0, animationConfig, () => {
      setMenuOpen(false);
    });
  };
  const menuOverlayStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      width: '100%',
      height: '100%',
      opacity: menuAnimation.value,
    };
  });
  const [sidebarWidth] = useLengthAttribute(SIDEBAR_WIDTH);
  const menuPositionStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      height: '100%',
      transform: [{ translateX: (menuAnimation.value - 1) * sidebarWidth * 1.2 }],
    };
  });

  // the not found screen shouldn't display in the nav bar
  const navItems = state.routes.filter(({ name }) => name !== 'NotFound').map(getItemConfig);

  switch (type) {
    case 'bottom-tabs':
      return (
        <BottomTabsWrapper accessibilityRole="tablist">
          {navItems.map((item) => (
            <BottomTabItem key={item.routeName} {...item} />
          ))}
        </BottomTabsWrapper>
      );
    case 'sidebar':
      return (
        <SidebarWrapper collapsed={collapsed} safeArea={safeArea} accessibilityRole="tablist">
          {navItems.map((item) => {
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
          <MenuPosition pointerEvents={menuOpen ? 'auto' : 'none'}>
            <Animated.View style={menuOverlayStyle}>
              <MenuOverlay onPress={closeMenu}></MenuOverlay>
            </Animated.View>
            <Animated.View style={menuPositionStyle}>
              <SidebarWrapper safeArea={safeArea} accessibilityRole="tablist">
                <Icon name="close" color="$text" size="6rem" onPress={closeMenu} />
                {navItems.map((item) => {
                  return (
                    <SideBarItem key={item.routeName} onAfterNavigation={closeMenu} {...item} />
                  );
                })}
              </SidebarWrapper>
            </Animated.View>
          </MenuPosition>
          <MenuWrapper>
            <Icon name="menu" color="$text" size="6rem" onPress={openMenu} />
          </MenuWrapper>
        </>
      );
  }
}
