import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, KeyboardAvoidingView,
  Platform, TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand, Surfaces, Typography, Spacing, Radius } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';
import { Feather } from '@expo/vector-icons';

export default function VerifyScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const insets = useSafeAreaInsets();
  const { verifyEmail, isLoading, error, clearError } = useAuthStore();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const fullCode = code.join('');
  const canSubmit = fullCode.length === 6;

  const handleVerify = async () => {
    clearError();
    const success = await verifyEmail(email, fullCode);
    if (success) {
      router.replace('/(auth)/login');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[s.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
        <Feather name="arrow-left" size={20} color={Brand.primary} />
      </TouchableOpacity>

      <View style={s.content}>
        <View style={s.iconWrap}>
          <Feather name="mail" size={32} color={Brand.accent} />
        </View>
        <Text style={s.title}>Check your email</Text>
        <Text style={s.subtitle}>
          We sent a 6-digit verification code to{'\n'}
          <Text style={s.email}>{email}</Text>
        </Text>

        <View style={s.codeRow}>
          {code.map((digit, i) => (
            <TextInput
              key={i}
              ref={el => { inputs.current[i] = el; }}
              style={[s.codeInput, digit ? s.codeInputFilled : null]}
              value={digit}
              onChangeText={text => handleChange(text.replace(/[^0-9]/g, ''), i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {error && (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        <Button
          title="Verify Email"
          variant="primary"
          size="lg"
          onPress={handleVerify}
          loading={isLoading}
          disabled={!canSubmit}
          style={{ width: '100%', marginTop: Spacing.lg }}
        />

        <TouchableOpacity style={s.resendBtn}>
          <Text style={s.resendText}>Didn't receive a code? Resend</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Surfaces.background, paddingHorizontal: Spacing.lg },
  backBtn: {
    width: 40, height: 40, borderRadius: Radius.full,
    backgroundColor: Surfaces.default, borderWidth: 1, borderColor: Surfaces.border,
    alignItems: 'center', justifyContent: 'center', marginTop: Spacing.md,
  },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  iconWrap: {
    width: 72, height: 72, borderRadius: Radius.xl,
    backgroundColor: `${Brand.accent}10`, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: { fontFamily: Typography.fonts.h1, fontSize: 24, color: Brand.primary, marginBottom: Spacing.sm },
  subtitle: { fontFamily: Typography.fonts.body, fontSize: 15, color: Brand.secondary, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl },
  email: { fontFamily: Typography.fonts.h4, color: Brand.primary },
  codeRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.md },
  codeInput: {
    width: 48, height: 56, borderRadius: Radius.md,
    backgroundColor: Surfaces.default, borderWidth: 1, borderColor: Surfaces.border,
    textAlign: 'center', fontFamily: Typography.fonts.h2, fontSize: 22, color: Brand.primary,
  },
  codeInputFilled: { borderColor: Brand.accent, backgroundColor: `${Brand.accent}05` },
  errorBox: { backgroundColor: '#FEF2F2', borderRadius: Radius.md, padding: Spacing.md, width: '100%' },
  errorText: { fontFamily: Typography.fonts.body, fontSize: 14, color: Brand.error, textAlign: 'center' },
  resendBtn: { marginTop: Spacing.lg },
  resendText: { fontFamily: Typography.fonts.body, fontSize: 14, color: Brand.accent },
});
