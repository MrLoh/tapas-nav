import React from 'react';
import { times } from 'lodash';
import styled from 'styled-native-components';
import { useRoute } from '@react-navigation/native';

import { ScreenWrapper, TouchableLink } from '../shared-components';

const Title = styled.Text`
  font-size: 6rem;
  text-align: center;
  margin: 4rem;
  color: $text;
`;

const Card = styled(TouchableLink)`
  elevation: 2;
  background: $card;
  height: 40rem;
  margin: 4rem;
  align-items: center;
  justify-content: center;
`;

export default function Screen() {
  const { name, params } = useRoute<any>();
  return (
    <ScreenWrapper>
      <Title>{name + (params?.id || '')}</Title>
      {times(5, (i) => i + 1).map((i) => (
        <Card key={i} routeName={'Device'} params={{ deviceId: 1 }}>
          <Title>{i}</Title>
        </Card>
      ))}
    </ScreenWrapper>
  );
}
