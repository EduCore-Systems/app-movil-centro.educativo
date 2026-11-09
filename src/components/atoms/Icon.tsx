import React from 'react';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { StyleProp, TextStyle } from 'react-native';

export type IconType = 'material' | 'ion';

interface IconProps {
  name: string;
  type?: IconType;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export const Icon: React.FC<IconProps> = ({
  name,
  type = 'material',
  size = 20,
  color = '#64748B',
  style,
}) => {
  if (type === 'ion') {
    return <Ionicons name={name as any} size={size} color={color} style={style} />;
  }
  return <MaterialIcons name={name as any} size={size} color={color} style={style} />;
};

export default Icon;
