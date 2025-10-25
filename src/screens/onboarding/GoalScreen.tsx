import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { theme } from '../../theme'
import StyledButton from '../../components/StyledButton'
import { OnboardingNavigationProp } from '../../navigation/types'

type Props = {
  navigation: OnboardingNavigationProp
}

type Goal = {
  id: 'GAIN_MASS' | 'LOSE_FAT' | 'MAINTAIN'
  title: string
  description: string
}

const GOALS_DATA: Goal[] = [
  {
    id: 'GAIN_MASS',
    title: 'Ganhar Massa Muscular',
    description: 'Foco em hipertrofia e ganho de força.',
  },
  {
    id: 'LOSE_FAT',
    title: 'Perder Gordura',
    description: 'Foco em queima calórica e definição muscular.',
  },
  {
    id: 'MAINTAIN',
    title: 'Manter a Forma',
    description: 'Foco em consistência e manutenção da saúde.',
  },
]

const GoalScreen = ({ navigation }: Props) => {
  const [selectedGoal, setSelectedGoal] = useState<Goal['id'] | null>(null)

  const handleNext = () => {
    if (selectedGoal) {
      navigation.navigate('Biometrics', { goal: selectedGoal })
    }
  }

  const renderGoal = ({ item }: { item: Goal }) => {
    const isSelected = selectedGoal === item.id
    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.selectedCard]}
        onPress={() => setSelectedGoal(item.id)}
      >
        <Text style={[styles.cardTitle, isSelected && styles.selectedCardText]}>
          {item.title}
        </Text>
        <Text
          style={[
            styles.cardDescription,
            isSelected && styles.selectedCardText,
          ]}
        >
          {item.description}
        </Text>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.content}>
        <Text style={styles.title}>Qual é o seu principal objetivo?</Text>
        <FlatList
          data={GOALS_DATA}
          renderItem={renderGoal}
          keyExtractor={(item) => item.id}
          style={styles.list}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.progressIndicator}>Passo 2 de 3</Text>
        <StyledButton
          title="Próximo"
          onPress={handleNext}
          disabled={!selectedGoal}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.medium,
    paddingTop: 60, // Espaço para o header transparente
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.large,
  },
  list: {
    flex: 1,
  },
  card: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.medium,
    borderRadius: theme.spacing.small,
    borderWidth: 2,
    borderColor: theme.colors.lightGray,
    marginBottom: theme.spacing.medium,
  },
  selectedCard: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  cardTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  cardDescription: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.secondary,
    marginTop: theme.spacing.small,
  },
  selectedCardText: {
    color: theme.colors.white,
  },
  footer: {
    padding: theme.spacing.medium,
    paddingBottom: theme.spacing.large,
  },
  progressIndicator: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.medium,
  },
})

export default GoalScreen
