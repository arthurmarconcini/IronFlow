import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { OnboardingNavigationProp } from '../../navigation/types'
import { useOnboardingStore } from '../../state/onboardingStore'
import ScreenContainer from '../../components/ScreenContainer'
import StyledButton from '../../components/StyledButton'
import { theme } from '../../theme'

// Componente para seleção de equipamento durante o onboarding
const EquipmentScreen = () => {
  const navigation = useNavigation<OnboardingNavigationProp>()
  const { setOnboardingData } = useOnboardingStore()

  const handleSelect = (equipment: 'full' | 'limited') => {
    setOnboardingData({ equipment })
    navigation.navigate('Biometrics')
  }

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>
          Que tipo de equipamento você tem acesso?
        </Text>
        <Text style={styles.subtitle}>
          Isso nos ajuda a personalizar seu plano de treino.
        </Text>
        <View style={styles.optionsContainer}>
          <StyledButton
            title="Academia Completa"
            onPress={() => handleSelect('full')}
            type="primary"
            containerStyle={styles.button}
          />
          <StyledButton
            title="Pesos Livres / Limitada"
            onPress={() => handleSelect('limited')}
            type="primary"
            containerStyle={styles.button}
          />
        </View>
      </View>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.secondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  optionsContainer: {
    width: '100%',
  },
  button: {
    marginBottom: 16,
  },
})

export default EquipmentScreen
