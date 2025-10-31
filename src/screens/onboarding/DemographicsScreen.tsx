import React, { useState } from 'react'
import { View, Text, StyleSheet, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Picker } from '@react-native-picker/picker'
import { theme } from '../../theme'
import StyledButton from '../../components/StyledButton'
import { OnboardingNavigationProp } from '../../navigation/types'
import { RouteProp } from '@react-navigation/native'

type Props = {
  navigation: OnboardingNavigationProp
  route: RouteProp<OnboardingStackParamList, 'Demographics'>
}

const DemographicsScreen = ({ navigation, route }: Props) => {
  const { goal } = route.params
  const [displayName, setDisplayName] = useState('')
  const [dob, setDob] = useState('')
  const [sex, setSex] = useState<'male' | 'female' | 'other' | null>(null)

  const handleNext = () => {
    if (displayName && dob && sex) {
      navigation.navigate('Experience', {
        goal,
        displayName,
        dob,
        sex,
      })
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Text style={styles.title}>Conte-nos sobre você</Text>
        <TextInput
          style={styles.input}
          placeholder="Como podemos te chamar?"
          value={displayName}
          onChangeText={setDisplayName}
        />
        <TextInput
          style={styles.input}
          placeholder="DD/MM/AAAA"
          value={dob}
          onChangeText={setDob}
        />
        <Picker
          selectedValue={sex}
          onValueChange={(itemValue) => setSex(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Selecione seu sexo" value={null} />
          <Picker.Item label="Masculino" value="male" />
          <Picker.Item label="Feminino" value="female" />
          <Picker.Item label="Outro" value="other" />
        </Picker>
      </View>
      <View style={styles.footer}>
        <StyledButton
          title="Próximo"
          onPress={handleNext}
          disabled={!displayName || !dob || !sex}
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
    padding: theme.spacing.medium,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: theme.spacing.large,
    textAlign: 'center',
  },
  input: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.medium,
    borderRadius: theme.spacing.small,
    marginBottom: theme.spacing.medium,
    fontSize: theme.fontSizes.medium,
  },
  picker: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing.small,
  },
  footer: {
    padding: theme.spacing.medium,
  },
})

export default DemographicsScreen
