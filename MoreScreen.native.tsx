import React from 'react';
import styled from 'styled-native-components';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from './ScreenWrapper';

const Item = styled.TouchableOpacity`
  height: 4rem;
  margin: 2rem;
  flex-direction: row;
  align-items: center;
`;

type Props<C> = C extends React.ComponentType<infer TProps> ? TProps : null;

const Icon = styled(Ionicons).attrs((p) => ({ size: 3 * p.theme.rem }))`
  margin-right: 1rem;
`;

const Label = styled.Text`
  font-size: 2rem;
`;

export default function MoreScreen({
  items,
}: {
  items: { name: string; iconName: Props<typeof Ionicons>['name'] }[];
}) {
  const navigation = useNavigation();
  return (
    <ScreenWrapper>
      {items.map(({ name, iconName }) => (
        <Item key={name} onPress={() => navigation.navigate(name)}>
          <Icon name={iconName} />
          <Label>{name}</Label>
        </Item>
      ))}
    </ScreenWrapper>
  );
}
