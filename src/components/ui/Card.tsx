import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';

interface CardProps {
  children?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  onPress,
  style,
  variant = 'elevated',
  padding = 'md',
}: CardProps) {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      backgroundColor: '#FFFFFF',
    };

    const paddingStyles = {
      none: {},
      sm: { padding: 12 },
      md: { padding: 16 },
      lg: { padding: 20 },
    };

    const variantStyles = {
      default: {
        backgroundColor: '#FFFFFF',
      },
      elevated: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      },
      outlined: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
      },
    };

    return {
      ...baseStyle,
      ...paddingStyles[padding],
      ...variantStyles[variant],
      ...style,
    };
  };

  if (onPress) {
    return (
      <TouchableOpacity style={getCardStyle()} onPress={onPress} activeOpacity={0.95}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={getCardStyle()}>{children}</View>;
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  style?: ViewStyle;
}

export function CardHeader({ title, subtitle, rightElement, style }: CardHeaderProps) {
  return (
    <View style={[{ marginBottom: 12 }, style]}>
      <View
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#111827',
              marginBottom: subtitle ? 4 : 0,
            }}>
            {title}
          </Text>
          {subtitle && (
            <Text
              style={{
                fontSize: 14,
                color: '#6B7280',
              }}>
              {subtitle}
            </Text>
          )}
        </View>
        {rightElement}
      </View>
    </View>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardContent({ children, style }: CardContentProps) {
  return <View style={[{ marginBottom: 12 }, style]}>{children}</View>;
}

interface CardFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardFooter({ children, style }: CardFooterProps) {
  return <View style={style}>{children}</View>;
}
