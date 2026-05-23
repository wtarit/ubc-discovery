/**
 * Tab Layout — Bottom tab bar with 3 main tabs
 */
import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Map, Users, Bookmark, User, LogIn, MessageSquare } from '@/components/icons';
import type { LucideIcon } from '@/components/icons';
import { Brand, Surfaces, Typography, Spacing } from '@/constants/Colors';
import { useAuthStore } from '@/stores/useAuthStore';

function TabBarIcon({ Icon, color, focused }: {
  Icon: LucideIcon;
  color: string;
  focused: boolean;
}) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Icon size={22} color={color} />
    </View>
  );
}

export default function TabLayout() {
  const { accessToken } = useAuthStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Brand.accent,
        tabBarInactiveTintColor: Brand.secondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon Icon={Map} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="nearby"
        options={{
          title: 'Meet',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon Icon={Users} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon Icon={Bookmark} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: accessToken ? 'Profile' : 'Sign In',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon Icon={accessToken ? User : LogIn} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="connections"
        options={{
          title: 'Connections',
          href: null,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon Icon={MessageSquare} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Surfaces.default,
    borderTopWidth: 1,
    borderTopColor: Surfaces.border,
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  tabLabel: {
    fontFamily: Typography.fonts.caption,
    fontSize: 11,
    letterSpacing: 0.2,
    marginTop: 2,
  },
  tabItem: {
    gap: 2,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 30,
    borderRadius: 15,
  },
  iconWrapActive: {
    backgroundColor: `${Brand.accent}15`,
  },
});
