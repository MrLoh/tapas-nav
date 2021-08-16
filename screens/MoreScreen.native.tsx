import React from 'react';
import styled from 'styled-native-components';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { ScreenWrapper } from '../shared-components';

const Item = styled.TouchableOpacity`
  height: 10rem;
  margin: 2rem 4rem;
  flex-direction: row;
  align-items: center;
`;

const Icon = styled(Ionicons).attrs((p) => ({ size: 6 * p.theme.rem }))`
  margin-right: 2rem;
`;

const Label = styled.Text`
  font-size: 4rem;
`;

export default function MoreScreen() {
  const navigation = useNavigation();
  return (
    <ScreenWrapper>
      {[
        { name: 'Training', iconName: 'book' as const },
        { name: 'Upload', iconName: 'cloud-upload' as const },
        { name: 'Share', iconName: 'share' as const },
      ].map(({ name, iconName }) => (
        <Item key={name} onPress={() => navigation.navigate(name)}>
          <Icon name={iconName} />
          <Label>{name}</Label>
        </Item>
      ))}
    </ScreenWrapper>
  );
}
