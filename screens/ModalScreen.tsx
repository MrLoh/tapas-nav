import React from 'react';
import styled from 'styled-native-components';
import { useRoute } from '@react-navigation/native';

import { ModalWrapper } from '../shared-components';

const Title = styled.Text`
  font-size: 6rem;
  text-align: center;
  margin: 4rem;
  color: $text;
`;

export default function ModalScreen() {
  const { name } = useRoute<any>();
  return (
    <ModalWrapper>
      <Title>{name}</Title>
    </ModalWrapper>
  );
}
