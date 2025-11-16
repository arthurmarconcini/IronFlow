import { useSubscriptionStatus } from '../hooks/useSubscriptionStatus'

import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'

import HomeScreen from '../screens/app/HomeScreen'

import StatsScreen from '../screens/app/StatsScreen'
import ScheduleScreen from '../screens/app/ScheduleScreen' // Importar a nova tela
import { theme } from '../theme'
import { AppTabParamList } from './types'

const Tab = createBottomTabNavigator<AppTabParamList>()

export default function AppTabs() {
  const { isPremium } = useSubscriptionStatus()

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.secondary,
        tabBarStyle: {
          backgroundColor: theme.colors.white,
          borderTopColor: theme.colors.lightGray,
          paddingBottom: theme.spacing.medium * 2, // Aumenta o padding inferior
        },
        tabBarLabelStyle: {
          fontSize: theme.fontSizes.small,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ScheduleTab"
        component={ScheduleScreen}
        options={{
          tabBarLabel: 'Agenda',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="StatsTab"
        component={StatsScreen}
        options={{
          tabBarLabel: 'Estatísticas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            if (!isPremium) {
              e.preventDefault()
              navigation.getParent()?.navigate('Premium')
            }
          },
        })}
      />
      <Tab.Screen
        name="ProfileTab"
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault()
            navigation.getParent()?.navigate('Profile')
          },
        })}
      >
        {() => null}
      </Tab.Screen>
    </Tab.Navigator>
  )
}
