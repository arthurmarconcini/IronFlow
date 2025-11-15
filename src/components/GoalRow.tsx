import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '../theme'
import { SessionTarget } from '../services/ProgressiveOverloadService'

interface GoalRowProps {
  target: SessionTarget
}

const GoalRow: React.FC<GoalRowProps> = ({ target }) => {
  return (
    <View style={styles.container}>
      <Ionicons
        name="trophy-outline"
        size={24}
        color={theme.colors.primary}
        style={styles.icon}
      />
      <View style={styles.textContainer}>
        <Text style={styles.title}>Sua Meta Hoje</Text>
        <Text style={styles.details}>
          {`Tente fazer ${target.targetReps} reps com `}
          <Text style={styles.weight}>{`${target.targetWeight} kg`}</Text>
        </Text>
        {target.notes && <Text style={styles.notes}>{target.notes}</Text>}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.lightPrimary,
    borderRadius: 12,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    borderLeftWidth: 5,
    borderLeftColor: theme.colors.primary,
  },
  icon: {
    marginRight: theme.spacing.medium,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme.fontSizes.medium,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  details: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
    marginTop: theme.spacing.small / 2,
  },
  weight: {
    fontWeight: 'bold',
  },
  notes: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.secondary,
    marginTop: theme.spacing.small,
    fontStyle: 'italic',
  },
})

export default GoalRow
