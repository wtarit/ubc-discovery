import React from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Mail } from 'lucide-react-native';
import { Brand, Surfaces, Typography, Spacing, Radius } from '@/constants/Colors';
import { useAuthStore } from '@/stores/useAuthStore';

interface SignInSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function SignInSheet({ visible, onClose }: SignInSheetProps) {
  const { signInWithGoogle, isLoading, error, clearError } = useAuthStore();

  const handleGoogle = async () => {
    const success = await signInWithGoogle();
    if (success) onClose();
  };

  const handleEmail = () => {
    onClose();
    router.push('/(auth)/email-login');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.backdrop} />
      </TouchableWithoutFeedback>
      <View style={s.sheet}>
        <View style={s.handle} />
        <Text style={s.title}>Continue to UBC Newcomers</Text>
        {error && (
          <TouchableOpacity onPress={clearError}>
            <Text style={s.error}>{error}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={s.googleBtn}
          onPress={handleGoogle}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color={Surfaces.background} size="small" />
          ) : (
            <>
              <Text style={s.googleIcon}>G</Text>
              <Text style={s.googleText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={s.emailBtn}
          onPress={handleEmail}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Mail size={18} color={Brand.primary} />
          <Text style={s.emailText}>Continue with Email</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: Surfaces.background,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
    paddingTop: Spacing.md,
    alignItems: 'center',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Surfaces.border,
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: Typography.fonts.h2,
    fontSize: 20,
    color: Brand.primary,
    marginBottom: Spacing.lg,
  },
  error: {
    fontFamily: Typography.fonts.body,
    fontSize: 14,
    color: Brand.error,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Brand.accent,
  },
  googleIcon: {
    fontFamily: Typography.fonts.h3,
    fontSize: 18,
    color: Surfaces.background,
  },
  googleText: {
    fontFamily: Typography.fonts.h3,
    fontSize: 15,
    color: Surfaces.background,
  },
  emailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Surfaces.default,
    borderWidth: 1,
    borderColor: Surfaces.border,
    marginTop: Spacing.sm,
  },
  emailText: {
    fontFamily: Typography.fonts.h3,
    fontSize: 15,
    color: Brand.primary,
  },
});
