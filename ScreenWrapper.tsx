import React from 'react';
import styled from 'styled-native-components';
import { useNavigation, useScrollToTop } from '@react-navigation/native';
import { useContext } from 'react';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

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

const Icon = styled(Ionicons).attrs((p) => {
  return {
    size: 8 * p.theme.rem,
  };
})`
  margin: 4rem;
`;

export default function ScreenWrapper({ children }: { children: React.ReactNode }) {
  const safeArea = useSafeAreaInsets();
  const options = useContext(ScreenWrapperContext);
  const navigation = useNavigation();

  const ref = React.useRef(null);
  useScrollToTop(ref);
  return (
    <Wrapper safeArea={safeArea} options={options} ref={ref}>
      {navigation.getState().routes.length > 1 ? (
        <Icon name="chevron-back" onPress={() => navigation.goBack()} />
      ) : null}
      {children}
    </Wrapper>
  );
}
