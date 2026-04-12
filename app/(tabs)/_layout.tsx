import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';

const palette = {
  active: '#B85042',
  inactive: '#8F7A6A',
  background: '#FFF8F1',
  border: '#E8D8C8',
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: palette.active,
        tabBarInactiveTintColor: palette.inactive,
        tabBarStyle: {
          backgroundColor: palette.background,
          borderTopColor: palette.border,
          height: 68,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ordering System',
          tabBarIcon: ({ color, size }) => <MaterialIcons color={color} name="point-of-sale" size={size} />,
        }}
      />
      <Tabs.Screen
        name="monitor"
        options={{
          title: 'Order Monitor',
          tabBarIcon: ({ color, size }) => <MaterialIcons color={color} name="sticky-note-2" size={size} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <MaterialIcons color={color} name="history" size={size} />,
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color, size }) => <MaterialIcons color={color} name="inventory-2" size={size} />,
        }}
      />
    </Tabs>
  );
}
