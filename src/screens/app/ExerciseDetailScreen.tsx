import React from 'react'
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native'
import { RouteProp, useRoute } from '@react-navigation/native'
import { AppStackParamList } from '../../navigation/types'
import ScreenContainer from '../../components/ScreenContainer'
import { theme } from '../../theme'

type ExerciseDetailScreenRouteProp = RouteProp<
  AppStackParamList,
  'ExerciseDetail'
>

export default function ExerciseDetailScreen() {
  const route = useRoute<ExerciseDetailScreenRouteProp>()
  const { exercise } = route.params

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>

        <Image source={{ uri: exercise.gifUrl }} style={styles.gif} />

        <View style={styles.infoContainer}>
          <InfoChip label="Alvo" value={exercise.target} />
          <InfoChip label="Equipamento" value={exercise.equipment} />
          <InfoChip label="Parte do Corpo" value={exercise.bodyPart} />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Instruções</Text>
          {exercise.instructions.map((instruction, index) => (
            <Text key={index} style={styles.instructionText}>
              {`${index + 1}. ${instruction}`}
            </Text>
          ))}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Músculos Secundários</Text>
          <View style={styles.secondaryMusclesContainer}>
            {exercise.secondaryMuscles.map((muscle, index) => (
              <View key={index} style={styles.muscleChip}>
                <Text style={styles.muscleChipText}>{muscle}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  )
}

const InfoChip = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoChip}>
    <Text style={styles.infoChipLabel}>{label.toUpperCase()}</Text>
    <Text style={styles.infoChipValue}>{value}</Text>
  </View>
)

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.medium,
  },
  exerciseName: {
    fontSize: theme.fontSizes.xlarge,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.medium,
    textAlign: 'center',
  },
  gif: {
    width: '100%',
    height: 300,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.lightGray,
    marginBottom: theme.spacing.large,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.large,
  },
  infoChip: {
    alignItems: 'center',
  },
  infoChipLabel: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  infoChipValue: {
    fontSize: theme.fontSizes.medium,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  sectionContainer: {
    marginBottom: theme.spacing.large,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.medium,
  },
  instructionText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
    lineHeight: 24,
  },
  secondaryMusclesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  muscleChip: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  muscleChipText: {
    color: theme.colors.white,
    fontWeight: 'bold',
  },
})
