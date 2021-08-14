import React from 'react';
import styled from 'styled-native-components';
import { useNavigation, useNavigationState, useScrollToTop } from '@react-navigation/native';
import { useContext } from 'react';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

import Icon from './Icon';

type ScreenOptions = {
  navType: 'bottom-tabs' | 'sidebar' | 'menu';
  margins: [number, number, number, number];
};
export const ScreenWrapperContext = React.createContext<ScreenOptions>(null as any);

const Wrapper = styled.ScrollView<{ safeArea: EdgeInsets; options: ScreenOptions }>`
  margin: ${(p) => p.options.margins.join('px ')}px;
  flex: 1;
  contentContainer {
    padding-top: ${(p) => p.safeArea.top}px;
    padding-bottom: ${(p) => (p.options.margins[2] ? 0 : p.safeArea.bottom)}px;
  }
`;

export default function ScreenWrapper({ children }: { children: React.ReactNode }) {
  const safeArea = useSafeAreaInsets();
  const options = useContext(ScreenWrapperContext);
  const navigation = useNavigation();

  const ref = React.useRef(null);
  useScrollToTop(ref);

  // need to get state this way to ensure it refreshes
  const showBackButton = useNavigationState((s) => s.type === 'stack' && s.routes.length > 1);
  return (
    <Wrapper safeArea={safeArea} options={options} ref={ref}>
      {showBackButton ? (
        <Icon name="chevron-back" size="8rem" onPress={() => navigation.goBack()} />
      ) : null}
      {children}
    </Wrapper>
  );
}
