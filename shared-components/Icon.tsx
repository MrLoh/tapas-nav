import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Theme, useColorAttribute, useLengthAttribute } from 'styled-native-components';

type Props<C> = C extends React.ComponentType<infer TProps> ? TProps : null;

export type IconName = Props<typeof Ionicons>['name'];

export default function Icon({
  size,
  name,
  color = '$text',
  onPress,
}: {
  size: string;
  name: IconName;
  color?: `$${keyof Theme['colors']}`;
  onPress?: () => void;
}) {
  return (
    <Ionicons
      onPress={onPress}
      name={name}
      color={useColorAttribute(color)}
      size={useLengthAttribute(size)[0]}
    />
  );
}
