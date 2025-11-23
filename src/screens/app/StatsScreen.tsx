import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import ScreenContainer from '../../components/ScreenContainer'
import StyledButton from '../../components/StyledButton'
import { theme } from '../../theme'
import { useSubscriptionStatus } from '../../hooks/useSubscriptionStatus'
import { useAuth } from '../../hooks/useAuth'
import { DatabaseService } from '../../db/DatabaseService'
import { Ionicons } from '@expo/vector-icons'
import { AppNavigationProp } from '../../navigation/types'
import {
  StatisticsService,
  ChartData,
  MuscleGroupData,
} from '../../services/StatisticsService'
import {
  VolumeChart,
  MuscleDistributionChart,
} from '../../components/stats/ChartComponents'

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

const InsightCard = ({ text }: { text: string }) => (
  <View style={styles.insightCard}>
    <Ionicons
      name="bulb-outline"
      size={24}
      color={theme.colors.primary}
      style={styles.insightIcon}
    />
    <Text style={styles.insightText}>{text}</Text>
  </View>
)

type Props = {
  navigation: AppNavigationProp
}

export default function StatsScreen({ navigation }: Props) {
  const { isPremium } = useSubscriptionStatus()
  const { user } = useAuth()

  const [workoutCount, setWorkoutCount] = useState(0)
  const [setCount, setSetCount] = useState(0)
  const [volumeData, setVolumeData] = useState<ChartData | null>(null)
  const [muscleData, setMuscleData] = useState<MuscleGroupData[]>([])
  const [insights, setInsights] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      const fetchStats = async () => {
        if (user) {
          setLoading(true)
          try {
            // Basic Stats
            const workouts = await DatabaseService.getWorkoutLogsCount(user.uid)
            const sets = await DatabaseService.getTotalSetsCompleted(user.uid)
            setWorkoutCount(workouts)
            setSetCount(sets)

            if (isPremium) {
              // Premium Stats
              const vData = await StatisticsService.getVolumeChartData(
                user.uid,
                'month',
              )
              const mData = await StatisticsService.getMuscleGroupData(user.uid)
              const iData = await StatisticsService.getCoachInsights(user.uid)

              setVolumeData(vData)
              setMuscleData(mData)
              setInsights(iData)
            }
          } catch (error) {
            console.error('Error fetching stats:', error)
          } finally {
            setLoading(false)
          }
        }
      }
      fetchStats()
    }, [user, isPremium]),
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenContainer style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Minhas Estatísticas</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.statsGrid}>
            <StatCard
              label="Treinos Concluídos"
              value={workoutCount}
              icon="barbell"
            />
            <StatCard label="Séries Totais" value={setCount} icon="layers" />
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : isPremium ? (
            <>
              {insights.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Ionicons
                      name="school-outline"
                      size={24}
                      color={theme.colors.text}
                    />
                    <Text style={styles.sectionTitle}>Coach Virtual</Text>
                  </View>
                  {insights.map((insight, index) => (
                    <InsightCard key={index} text={insight} />
                  ))}
                </View>
              )}

              {volumeData && (
                <VolumeChart
                  data={volumeData}
                  title="Volume de Treino (Último Mês)"
                />
              )}

              {muscleData.length > 0 && (
                <MuscleDistributionChart
                  data={muscleData}
                  title="Distribuição Muscular (3 Meses)"
                />
              )}
            </>
          ) : (
            <LinearGradient
              colors={['#FFFFFF', '#F8F9FA']}
              style={styles.premiumSection}
            >
              <View style={styles.premiumHeader}>
                <Ionicons name="sparkles" size={24} color="#FFD700" />
                <Text style={styles.premiumTitle}>Estatísticas Premium</Text>
              </View>
              <Text style={styles.premiumDescription}>
                Acesse gráficos de volume, progressão de carga, recordes
                pessoais e insights do Coach Virtual.
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
        </ScrollView>
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
  scrollContent: {
    paddingBottom: theme.spacing.large,
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
  section: {
    marginBottom: theme.spacing.large,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: theme.spacing.small,
  },
  insightCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: theme.spacing.medium,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  insightIcon: {
    marginRight: theme.spacing.medium,
  },
  insightText: {
    flex: 1,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
    lineHeight: 20,
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
