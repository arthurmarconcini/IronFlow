import React, { useState, useCallback } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import ScreenContainer from '../../components/ScreenContainer'
import StyledButton from '../../components/StyledButton'
import { theme } from '../../theme'
import { useSubscription } from '../../hooks/useSubscription'
import { useAuth } from '../../hooks/useAuth'
import { DatabaseService } from '../../db/DatabaseService'
import { Ionicons } from '@expo/vector-icons'
import { AppNavigationProp } from '../../navigation/types'

const StatCard = ({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon: keyof typeof Ionicons.glyphMap
}) => (
  <View style={styles.card}>
    <Ionicons name={icon} size={32} color={theme.colors.primary} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
)

type Props = {
  navigation: AppNavigationProp
}

export default function StatsScreen({ navigation }: Props) {
  const { isPremium } = useSubscription()
  const { user } = useAuth()

  const [workoutCount, setWorkoutCount] = useState(0)
  const [setCount, setSetCount] = useState(0)

  useFocusEffect(
    useCallback(() => {
      const fetchStats = async () => {
        if (user) {
          const workouts = await DatabaseService.getWorkoutLogsCount(user.uid)
          const sets = await DatabaseService.getTotalSetsCompleted(user.uid)
          setWorkoutCount(workouts)
          setSetCount(sets)
        }
      }
      fetchStats()
    }, [user]),
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenContainer style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Minhas Estatísticas</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            label="Treinos Concluídos"
            value={workoutCount}
            icon="barbell"
          />
          <StatCard label="Séries Totais" value={setCount} icon="layers" />
        </View>

        {!isPremium && (
          <LinearGradient
            colors={['#FFFFFF', '#F8F9FA']}
            style={styles.premiumSection}
          >
            <View style={styles.premiumHeader}>
              <Ionicons name="sparkles" size={24} color="#FFD700" />
              <Text style={styles.premiumTitle}>Estatísticas Premium</Text>
            </View>
            <Text style={styles.premiumDescription}>
              Acesse gráficos de volume, progressão de carga, recordes pessoais
              e muito mais.
            </Text>
            <StyledButton
              title="Fazer Upgrade Agora"
              onPress={() => navigation.navigate('Premium')}
              icon={
                <Ionicons name="arrow-up-circle" size={20} color="#FFFFFF" />
              }
            />
          </LinearGradient>
        )}
      </ScreenContainer>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
    marginBottom: theme.spacing.medium,
  },
  title: {
    fontSize: theme.fontSizes.large,
    fontWeight: '600',
    color: theme.colors.text,
    paddingBottom: theme.spacing.small,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.large,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: theme.spacing.medium,
    alignItems: 'center',
    justifyContent: 'center',
    width: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginVertical: theme.spacing.small,
  },
  statLabel: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.secondary,
    textAlign: 'center',
  },
  premiumSection: {
    marginTop: theme.spacing.large,
    padding: theme.spacing.medium,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.medium,
  },
  premiumTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: theme.spacing.small,
  },
  premiumDescription: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.large,
  },
})
