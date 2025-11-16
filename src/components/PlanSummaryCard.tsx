import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '../theme'
import { UserProfile } from '../types/database'

interface PlanSummaryCardProps {
  profile: UserProfile | null
  splitType: string
}

const GOAL_MAP = {
  GAIN_MASS: 'Hipertrofia',
  FAT_LOSS: 'Perda de Gordura',
  STRENGTH: 'Força',
  MAINTAIN: 'Manutenção',
}

const PlanSummaryCard: React.FC<PlanSummaryCardProps> = ({
  profile,
  splitType,
}) => {
  if (!profile) {
    return null
  }

  const goalText = profile.goal ? GOAL_MAP[profile.goal] : 'Não definido'
  const bmiText = profile.bmi ? profile.bmi.toFixed(1) : 'N/A'

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Ciclo Atual: Semana 1</Text>
      <Text style={styles.subtitle}>
        Seu plano está focado nos seus objetivos.
      </Text>
      <View style={styles.tagsContainer}>
        <View style={styles.tag}>
          <Ionicons
            name="ribbon-outline"
            size={16}
            color={theme.colors.primary}
          />
          <Text style={styles.tagText}>{goalText}</Text>
        </View>
        <View style={styles.tag}>
          <Ionicons
            name="repeat-outline"
            size={16}
            color={theme.colors.primary}
          />
          <Text style={styles.tagText}>{splitType}</Text>
        </View>
        <View style={styles.tag}>
          <Ionicons
            name="body-outline"
            size={16}
            color={theme.colors.primary}
          />
          <Text style={styles.tagText}>IMC: {bmiText}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.large,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  title: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.secondary,
    marginTop: 4,
    marginBottom: theme.spacing.medium,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.lightPrimary,
    borderRadius: theme.borderRadius.large,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    marginLeft: 6,
    fontSize: theme.fontSizes.small,
    fontWeight: '600',
    color: theme.colors.primary,
  },
})

export default PlanSummaryCard
