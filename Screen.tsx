import React from 'react';
import { times } from 'lodash';
import styled from 'styled-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenWrapper from './ScreenWrapper';

const Title = styled.Text`
  font-size: 6rem;
  text-align: center;
  margin: 4rem;
`;

const Card = styled.TouchableOpacity`
  elevation: 2;
  background: $card;
  height: 40rem;
  margin: 4rem;
  align-items: center;
  justify-content: center;
`;

export default function Screen() {
  const { name, params } = useRoute<any>();
  const navigation = useNavigation();
  return (
    <ScreenWrapper>
      <Title>{name + (params?.num || '')}</Title>
      {times(5, (i) => i + 1).map((i) => (
        <Card onPress={() => navigation.push('Screen', { num: i })}>
          <Title>{i}</Title>
        </Card>
      ))}
    </ScreenWrapper>
  );
}
