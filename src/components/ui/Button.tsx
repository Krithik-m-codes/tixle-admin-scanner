import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    };

    // Size styles
    const sizeStyles = {
      sm: { paddingHorizontal: 12, paddingVertical: 8, minHeight: 36 },
      md: { paddingHorizontal: 16, paddingVertical: 12, minHeight: 44 },
      lg: { paddingHorizontal: 20, paddingVertical: 16, minHeight: 52 },
    };

    // Variant styles
    const variantStyles = {
      primary: {
        backgroundColor: isDisabled ? '#9CA3AF' : '#4F46E5',
        borderColor: isDisabled ? '#9CA3AF' : '#4F46E5',
      },
      secondary: {
        backgroundColor: isDisabled ? '#F3F4F6' : '#6B7280',
        borderColor: isDisabled ? '#E5E7EB' : '#6B7280',
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: isDisabled ? '#E5E7EB' : '#4F46E5',
      },
      ghost: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
      },
      danger: {
        backgroundColor: isDisabled ? '#FCA5A5' : '#EF4444',
        borderColor: isDisabled ? '#FCA5A5' : '#EF4444',
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(fullWidth && { width: '100%' }),
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseFontSize = {
      sm: 14,
      md: 16,
      lg: 18,
    };

    const textColors = {
      primary: isDisabled ? '#FFFFFF' : '#FFFFFF',
      secondary: isDisabled ? '#9CA3AF' : '#FFFFFF',
      outline: isDisabled ? '#9CA3AF' : '#4F46E5',
      ghost: isDisabled ? '#9CA3AF' : '#4F46E5',
      danger: isDisabled ? '#FFFFFF' : '#FFFFFF',
    };

    return {
      fontSize: baseFontSize[size],
      fontWeight: '600',
      color: textColors[variant],
      marginLeft: icon && iconPosition === 'left' ? 8 : 0,
      marginRight: icon && iconPosition === 'right' ? 8 : 0,
    };
  };

  const getIconColor = () => {
    const iconColors = {
      primary: isDisabled ? '#FFFFFF' : '#FFFFFF',
      secondary: isDisabled ? '#9CA3AF' : '#FFFFFF',
      outline: isDisabled ? '#9CA3AF' : '#4F46E5',
      ghost: isDisabled ? '#9CA3AF' : '#4F46E5',
      danger: isDisabled ? '#FFFFFF' : '#FFFFFF',
    };
    return iconColors[variant];
  };

  const iconSize = {
    sm: 16,
    md: 18,
    lg: 20,
  }[size];

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? '#4F46E5' : '#FFFFFF'}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons name={icon} size={iconSize} color={getIconColor()} />
          )}
          <Text style={getTextStyle()}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <Ionicons name={icon} size={iconSize} color={getIconColor()} />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}
