import React from 'react';
import styled from 'styled-native-components';
import { useNavigation } from '@react-navigation/native';

import { useScreenContext } from './ScreenContext';
import Icon from './Icon';

const Overlay = styled.TouchableOpacity.attrs({
  activeOpacity: 1,
})`
  position: absolute;
  background: rgba(0, 0, 0, 0.5);
  width: 100%;
  height: 100%;
`;

const Wrapper = styled.View`
  position: absolute;
  width: 100%;
  height: 100%;
  padding: 20rem 5rem;
  align-items: center;
`;

const Card = styled.ScrollView`
  background: $card;
  elevation: 4;
  border-radius: 2rem;
  flex: 1;
  width: 100%;
  max-width: 250rem;
`;

// TODO: add error boundary handling here
export default function ScreenWrapper({ children }: { children: React.ReactNode }) {
  const navigation = useNavigation();
  const { navType } = useScreenContext();

  return navType === 'bottom-tabs' ? (
    <Card>
      <Icon name="close" size="8rem" onPress={() => navigation.goBack()} />
      {children}
    </Card>
  ) : (
    <>
      <Overlay onPress={() => navigation.goBack()}></Overlay>
      <Wrapper pointerEvents="box-none">
        <Card>
          <Icon name="close" size="8rem" onPress={() => navigation.goBack()} />
          {children}
        </Card>
      </Wrapper>
    </>
  );
}
