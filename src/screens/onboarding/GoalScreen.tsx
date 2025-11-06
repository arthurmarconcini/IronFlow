import React from 'react'
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
import { useOnboardingStore } from '../../state/onboardingStore'

type Props = {
  navigation: OnboardingNavigationProp
}

type Goal = {
  id: 'GAIN_MASS' | 'FAT_LOSS' | 'STRENGTH' | 'MAINTAIN'
  title: string
  description: string
}

const GOALS_DATA: Goal[] = [
  {
    id: 'GAIN_MASS',
    title: 'Hipertrofia (Ganhar Músculo)',
    description: 'Foco em maximizar o ganho de massa muscular.',
  },
  {
    id: 'FAT_LOSS',
    title: 'Emagrecimento / Definição',
    description: 'Foco em maximizar o gasto calórico e preservar músculos.',
  },
  {
    id: 'STRENGTH',
    title: 'Força',
    description: 'Foco em maximizar sua capacidade de carga (1RM).',
  },
  {
    id: 'MAINTAIN',
    title: 'Manter a Forma',
    description: 'Foco em consistência e manutenção da saúde.',
  },
]

const GoalScreen = ({ navigation }: Props) => {
  const { goal, setOnboardingData } = useOnboardingStore()

  const handleSelectGoal = (selectedGoal: Goal['id']) => {
    setOnboardingData({ goal: selectedGoal })
  }

  const handleNext = () => {
    if (goal) {
      navigation.navigate('Demographics')
    }
  }

  const renderGoal = ({ item }: { item: Goal }) => {
    const isSelected = goal === item.id
    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.selectedCard]}
        onPress={() => handleSelectGoal(item.id)}
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
        <Text style={styles.progressIndicator}>Passo 2 de 5</Text>
        <StyledButton title="Próximo" onPress={handleNext} disabled={!goal} />
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
    paddingTop: 60,
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
    borderRadius: theme.borderRadius.medium,
    borderWidth: 2,
    borderColor: theme.colors.border,
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
