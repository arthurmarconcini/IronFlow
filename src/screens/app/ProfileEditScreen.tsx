import React, { useState } from 'react'
import { View, Text, StyleSheet, Platform, ScrollView } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Slider } from '@miblanchard/react-native-slider'
import { Picker } from '@react-native-picker/picker'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '../../theme'
import StyledButton from '../../components/StyledButton'
import StyledInput from '../../components/StyledInput'
import { useProfileStore } from '../../state/profileStore'
import { calculateBMI, getBMICategory } from '../../utils/bmiUtils'
import { DatabaseService } from '../../db/DatabaseService'
import { SyncService } from '../../sync/SyncService'
import { useAuth } from '../../hooks/useAuth'
import { AppNavigationProp } from '../../navigation/types'
import {
  availabilityMap,
  experienceMap,
  goalMap,
  sexMap,
} from '../../utils/translationUtils'
import FormGroup from '../../components/FormGroup'

type Props = {
  navigation: AppNavigationProp
}

export default function ProfileEditScreen({ navigation }: Props) {
  const { user } = useAuth()
  const { profile, updateProfile } = useProfileStore()
  const [isLoading, setIsLoading] = useState(false)
  const insets = useSafeAreaInsets()

  // O RootNavigator garante que 'profile' não é nulo aqui.
  // Se for, a tela não deveria nem ser acessível.
  const [displayName, setDisplayName] = useState(profile!.displayName || '')
  const [weight, setWeight] = useState(profile!.currentWeightKg ?? 70)
  const [goal, setGoal] = useState<keyof typeof goalMap>(
    profile!.goal || 'GAIN_MASS',
  )
  const [experienceLevel, setExperienceLevel] = useState<
    keyof typeof experienceMap
  >(profile!.experienceLevel || 'beginner')
  const [availability, setAvailability] = useState<
    keyof typeof availabilityMap
  >(profile!.availability || '3-4')
  const [sex, setSex] = useState<keyof typeof sexMap>(profile!.sex || 'male')

  const handleSave = async () => {
    if (!profile || !user) return

    setIsLoading(true)
    try {
      const newBmi = calculateBMI(weight, profile.heightCm!)
      const newBmiCategory = getBMICategory(newBmi)

      const updatedFields = {
        displayName,
        currentWeightKg: weight,
        goal,
        experienceLevel,
        availability,
        sex,
        bmi: newBmi,
        bmiCategory: newBmiCategory,
        syncStatus: 'dirty' as const,
        lastModifiedLocally: Date.now(),
      }

      await DatabaseService.updateUserProfile(profile.id!, updatedFields)
      updateProfile(updatedFields)
      SyncService.syncUserProfile(user)

      navigation.goBack()
    } catch (error) {
      console.error('Erro ao atualizar o perfil:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderPickerItems = (map: { [key: string]: string }) =>
    Object.entries(map).map(([key, value]) => (
      <Picker.Item key={key} label={value} value={key} />
    ))

  const displayHeight = `${profile!.heightCm?.toFixed(0) ?? 'N/A'} cm`
  const displayWeightUnit =
    useProfileStore.getState().unitSystem === 'metric' ? 'kg' : 'lbs'

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Editar Perfil</Text>
        </View>

        <FormGroup label="Nome de Exibição">
          <StyledInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Seu nome ou apelido"
            autoCapitalize="words"
          />
        </FormGroup>

        <FormGroup label="Altura">
          <View style={styles.readOnlyContainer}>
            <Text style={styles.fixedValue}>{displayHeight}</Text>
            <Ionicons
              name="lock-closed-outline"
              size={16}
              color={theme.colors.secondary}
            />
          </View>
        </FormGroup>

        <FormGroup label={`Peso (${displayWeightUnit})`}>
          <View style={styles.sliderValueContainer}>
            <Text style={styles.value}>{weight.toFixed(1)}</Text>
          </View>
          <Slider
            value={weight}
            onValueChange={(value) =>
              setWeight(Array.isArray(value) ? value[0] : value)
            }
            minimumValue={40}
            maximumValue={150}
            step={0.5}
            thumbTintColor={theme.colors.primary}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.lightGray}
          />
        </FormGroup>

        <FormGroup label="Objetivo">
          <View style={styles.pickerInputContainer}>
            <Text style={styles.pickerInputText}>{goalMap[goal]}</Text>
            <Picker
              selectedValue={goal}
              onValueChange={(itemValue) =>
                setGoal(itemValue as keyof typeof goalMap)
              }
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              {renderPickerItems(goalMap)}
            </Picker>
          </View>
        </FormGroup>

        <FormGroup label="Nível de Experiência">
          <View style={styles.pickerInputContainer}>
            <Text style={styles.pickerInputText}>
              {experienceMap[experienceLevel]}
            </Text>
            <Picker
              selectedValue={experienceLevel}
              onValueChange={(itemValue) =>
                setExperienceLevel(itemValue as keyof typeof experienceMap)
              }
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              {renderPickerItems(experienceMap)}
            </Picker>
          </View>
        </FormGroup>

        <FormGroup label="Disponibilidade">
          <View style={styles.pickerInputContainer}>
            <Text style={styles.pickerInputText}>
              {availabilityMap[availability]}
            </Text>
            <Picker
              selectedValue={availability}
              onValueChange={(itemValue) =>
                setAvailability(itemValue as keyof typeof availabilityMap)
              }
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              {renderPickerItems(availabilityMap)}
            </Picker>
          </View>
        </FormGroup>

        <FormGroup label="Sexo">
          <View style={styles.pickerInputContainer}>
            <Text style={styles.pickerInputText}>{sexMap[sex]}</Text>
            <Picker
              selectedValue={sex}
              onValueChange={(itemValue) =>
                setSex(itemValue as keyof typeof sexMap)
              }
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              {renderPickerItems(sexMap)}
            </Picker>
          </View>
        </FormGroup>

        <FormGroup label="Data de Nascimento">
          <View style={styles.readOnlyContainer}>
            <Text style={styles.fixedValue}>{profile!.dob || 'N/A'}</Text>
            <Ionicons
              name="lock-closed-outline"
              size={16}
              color={theme.colors.secondary}
            />
          </View>
        </FormGroup>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + theme.spacing.medium },
        ]}
      >
        <StyledButton
          title="Salvar Alterações"
          onPress={handleSave}
          isLoading={isLoading}
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: theme.spacing.medium,
    paddingTop: theme.spacing.large,
    paddingBottom: theme.spacing.large * 3,
  },
  headerContainer: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
    marginBottom: theme.spacing.large,
  },
  title: {
    fontSize: theme.fontSizes.large,
    fontWeight: '600',
    color: theme.colors.text,
    paddingBottom: theme.spacing.small,
  },
  readOnlyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.medium,
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
  },
  fixedValue: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.secondary,
  },
  sliderValueContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  value: {
    fontSize: theme.fontSizes.large,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  pickerInputContainer: {
    borderColor: theme.colors.lightGray,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: theme.colors.white,
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.medium,
  },
  pickerInputText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
  },
  pickerWrapper: {
    borderColor: theme.colors.lightGray,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: theme.colors.white,
  },
  picker: {
    position: 'absolute',
    width: '120%',
    height: Platform.OS === 'ios' ? 150 : '100%',
    opacity: 0,
  },
  pickerItem: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
  },
  footer: {
    padding: theme.spacing.medium,
    paddingBottom: theme.spacing.large,
    backgroundColor: theme.colors.background,
  },
})
