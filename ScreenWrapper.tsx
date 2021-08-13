import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { useContext } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-native-components';

type ScreenOptions = {
  hasTabBar: boolean;
  showMenuBar: boolean;
};
export const ScreenWrapperContext = React.createContext<ScreenOptions>(null as any);

const Wrapper = styled.ScrollView<{ safeArea: EdgeInsets; options: ScreenOptions }>`
  margin-top: ${(p) => (p.options.showMenuBar ? 8 : 0)}rem;
  contentContainer {
    padding-top: ${(p) => p.safeArea.top}px;
    padding-bottom: ${(p) => (p.options.hasTabBar ? 0 : p.safeArea.bottom)}px;
  }
`;

const MenuBar = styled.View`
  position: absolute;
  width: 100%;
  height: 8rem;
  background: $card;
  elevation: 3;
`;

const MenuIcon = styled(Ionicons).attrs((p) => ({ size: 4 * p.theme.rem }))`
  margin: 2rem;
`;

export default function ScreenWrapper({ children }: { children: React.ReactNode }) {
  const safeArea = useSafeAreaInsets();
  const options = useContext(ScreenWrapperContext);
  const navigation = useNavigation();
  return (
    <>
      <Wrapper safeArea={safeArea} options={options}>
        {children}
      </Wrapper>
      {options.showMenuBar ? (
        <MenuBar>
          <MenuIcon name="menu" onPress={navigation.openDrawer} />
        </MenuBar>
      ) : null}
    </>
  );
}
