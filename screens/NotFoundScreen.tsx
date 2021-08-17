import React from 'react';
import styled from 'styled-native-components';

import { ScreenWrapper } from '../shared-components';

const Title = styled.Text`
  font-size: 24rem;
  text-align: center;
  margin: 4rem;
  color: $text;
`;

export default function Screen() {
  return (
    <ScreenWrapper>
      <Title>404</Title>
    </ScreenWrapper>
  );
}
