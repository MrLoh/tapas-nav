import React, { useRef } from 'react';
import { useLinkProps, CommonActions, NavigationAction } from '@react-navigation/native';
import { Platform, TouchableOpacity, TouchableOpacityProps, View, ViewStyle } from 'react-native';
import { useHover, useFocus } from 'react-native-web-hooks';
import { useScreenContext } from './ScreenContext';

/**
 * This is a replacement for Touchable opacity that can be passed a routeName and optional params
 * instead of an onPress handler and will have correct behavior for links on web
 */
export default function TouchableLink({
  style,
  children,
  routeName,
  params,
  navigationAction,
  hoveredStyle,
  focusedStyle,
  onCheckIfNavigationShouldBePrevented,
  onAfterNavigation,
  ...props
}: Omit<TouchableOpacityProps, 'onPress'> & {
  style?: ViewStyle;
  hoveredStyle?: ViewStyle;
  focusedStyle?: ViewStyle;
  children: React.ReactNode;
  routeName: string;
  params?: { [key: string]: string | number };
  onCheckIfNavigationShouldBePrevented?: () => boolean;
  onAfterNavigation?: () => void;
  onLongPress?: () => void;
  navigationAction?: NavigationAction;
}) {
  const { buildLink } = useScreenContext();
  const {
    href,
    accessibilityRole,
    onPress: onDispatchAction,
  } = useLinkProps({
    to: buildLink(routeName, params)!,
    action: navigationAction || CommonActions.navigate(routeName, params),
  });
  const onPress = (e: Parameters<typeof onDispatchAction>[0]) => {
    if (onCheckIfNavigationShouldBePrevented?.()) {
      e?.preventDefault();
    } else {
      // this will dispatch the navigation action via on click or on press
      onDispatchAction(e);
      onAfterNavigation?.();
    }
  };

  const ref = useRef(null);
  const isHovered = useHover(ref);
  const isFocused = useFocus(ref);

  // Needs to be View so onClick can be passed and certain events can be prevented
  return Platform.OS === 'web' ? (
    <View
      // @ts-ignore -- needs to be on click to prevent certain defaults
      onClick={onPress}
      ref={ref}
      href={href}
      accessibilityRole={accessibilityRole}
      style={[
        style,
        isHovered ? hoveredStyle : null,
        isFocused ? focusedStyle : null,
        // @ts-ignore -- will work on web to animate hover and focus styles
        { transitionDuration: '150ms' },
      ]}
      {...props}
    >
      {children}
    </View>
  ) : (
    <TouchableOpacity
      style={style}
      onPress={onPress}
      {...props}
      accessibilityRole={accessibilityRole}
    >
      {children}
    </TouchableOpacity>
  );
}
