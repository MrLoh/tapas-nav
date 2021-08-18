import React from 'react';
import styled from 'styled-native-components';
import { useNavigation, useNavigationState, useScrollToTop } from '@react-navigation/native';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

import Icon from './Icon';
import { useScreenContext } from './ScreenContext';
import TouchableLink from './TouchableLink';

const Wrapper = styled.ScrollView<{
  safeArea: EdgeInsets;
  margins: [number, number, number, number];
}>`
  margin: ${(p) => p.margins.join('px ')}px;
  flex: 1;
  background: $background;
  contentContainer {
    padding-top: ${(p) => p.safeArea.top}px;
    padding-bottom: ${(p) => (p.margins[2] ? 0 : p.safeArea.bottom)}px;
  }
`;

const ToolbarWrapper = styled.View`
  height: 12rem;
  width: 100%;
  border-color: $border;
  border-bottom-width: 1px;
  flex-direction: row;
  justify-content: flex-end;
  padding: 2rem;
`;

const ToolbarItem = styled(TouchableLink)``;

// TODO: add error boundary handling here
export default function ScreenWrapper({ children }: { children: React.ReactNode }) {
  const safeArea = useSafeAreaInsets();
  const { margins } = useScreenContext();
  const navigation = useNavigation();

  const ref = React.useRef(null);
  useScrollToTop(ref);

  // need to get state this way to ensure it refreshes
  const showBackButton = useNavigationState((s) => s.type === 'stack' && s.routes.length > 1);
  return (
    <Wrapper safeArea={safeArea} margins={margins} ref={ref}>
      <ToolbarWrapper>
        <ToolbarItem routeName="Profile">
          <Icon name="person-outline" size="6rem" />
        </ToolbarItem>
        <ToolbarItem routeName="Notifications">
          <Icon name="notifications-outline" size="6rem" />
        </ToolbarItem>
      </ToolbarWrapper>
      {showBackButton ? (
        <Icon name="chevron-back" size="8rem" onPress={() => navigation.goBack()} />
      ) : null}
      {children}
    </Wrapper>
  );
}
