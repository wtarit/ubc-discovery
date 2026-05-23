import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Brand, Surfaces, Typography, Spacing, Radius } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import { SignInSheet } from '@/components/ui/SignInSheet';

interface AuthPromptProps {
  variant: 'inline' | 'toast';
  message?: string;
  visible?: boolean;
  onDismiss?: () => void;
}

export function AuthPrompt({
  variant,
  message = 'Sign in to unlock this feature',
  visible = true,
  onDismiss,
}: AuthPromptProps) {
  const [showSignIn, setShowSignIn] = useState(false);

  const openSheet = () => setShowSignIn(true);
  const closeSheet = () => {
    setShowSignIn(false);
    onDismiss?.();
  };

  if (variant === 'toast') {
    return (
      <>
        <AuthToast
          message={message}
          visible={visible}
          onDismiss={onDismiss}
          onSignIn={openSheet}
        />
        <SignInSheet visible={showSignIn} onClose={closeSheet} />
      </>
    );
  }

  return (
    <>
      <View style={s.inlineWrap}>
        <Feather name="lock" size={24} color={Brand.secondary} />
        <Text style={s.inlineMsg}>{message}</Text>
        <Button title="Sign In" variant="primary" size="md" onPress={openSheet} />
      </View>
      <SignInSheet visible={showSignIn} onClose={closeSheet} />
    </>
  );
}

function AuthToast({
  message,
  visible,
  onDismiss,
  onSignIn,
}: {
  message: string;
  visible: boolean;
  onDismiss?: () => void;
  onSignIn: () => void;
}) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => onDismiss?.());
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      opacity.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[s.toast, { opacity }]}>
      <Text style={s.toastMsg}>{message}</Text>
      <TouchableOpacity onPress={onSignIn} activeOpacity={0.7}>
        <Text style={s.toastLink}>Sign In</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  inlineWrap: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  inlineMsg: {
    fontFamily: Typography.fonts.body,
    fontSize: 15,
    color: Brand.secondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.md,
  },
  toast: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Brand.primary,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    zIndex: 100,
  },
  toastMsg: {
    fontFamily: Typography.fonts.body,
    fontSize: 14,
    color: Surfaces.background,
    flex: 1,
    marginRight: 12,
  },
  toastLink: {
    fontFamily: Typography.fonts.h3,
    fontSize: 14,
    color: Surfaces.background,
    textDecorationLine: 'underline',
  },
});
