import React, { useState } from 'react'
import { View, Text, StyleSheet, Platform, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
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
import { UserProfile } from '../../types/database'
import FormGroup from '../../components/FormGroup'

type Props = {
  navigation: AppNavigationProp
}

const ProfileEditScreen = ({ navigation }: Props) => {
  const { user } = useAuth()
  const { profile, setProfile, unitSystem } = useProfileStore()
  const [isLoading, setIsLoading] = useState(false)

  const [displayName, setDisplayName] = useState(profile?.displayName || '')
  const [weight, setWeight] = useState(profile?.currentWeightKg ?? 70)
  const [goal, setGoal] = useState<UserProfile['goal']>(
    profile?.goal || 'GAIN_MASS',
  )
  const [experienceLevel, setExperienceLevel] = useState<
    UserProfile['experienceLevel']
  >(profile?.experienceLevel || 'beginner')
  const [availability, setAvailability] = useState<UserProfile['availability']>(
    profile?.availability || '3-4',
  )
  const [sex, setSex] = useState<UserProfile['sex']>(profile?.sex || 'male')

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

      const updatedProfile = { ...profile, ...updatedFields }
      setProfile(updatedProfile)

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

  const displayHeight =
    unitSystem === 'metric'
      ? `${profile?.heightCm?.toFixed(0) ?? 'N/A'} cm`
      : `${((profile?.heightCm ?? 0) * 0.393701) / 12}'${(
          ((profile?.heightCm ?? 0) * 0.393701) %
          12
        ).toFixed(0)}"`
  const displayWeightUnit = unitSystem === 'metric' ? 'kg' : 'lbs'

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
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={goal}
              onValueChange={(itemValue) => setGoal(itemValue)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              {renderPickerItems(goalMap)}
            </Picker>
          </View>
        </FormGroup>

        <FormGroup label="Nível de Experiência">
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={experienceLevel}
              onValueChange={(itemValue) => setExperienceLevel(itemValue)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              {renderPickerItems(experienceMap)}
            </Picker>
          </View>
        </FormGroup>

        <FormGroup label="Disponibilidade">
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={availability}
              onValueChange={(itemValue) => setAvailability(itemValue)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              {renderPickerItems(availabilityMap)}
            </Picker>
          </View>
        </FormGroup>

        <FormGroup label="Sexo">
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={sex}
              onValueChange={(itemValue) => setSex(itemValue)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              {renderPickerItems(sexMap)}
            </Picker>
          </View>
        </FormGroup>

        <FormGroup label="Data de Nascimento">
          <View style={styles.readOnlyContainer}>
            <Text style={styles.fixedValue}>{profile?.dob || 'N/A'}</Text>
            <Ionicons
              name="lock-closed-outline"
              size={16}
              color={theme.colors.secondary}
            />
          </View>
        </FormGroup>
      </ScrollView>

      <View style={styles.footer}>
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
  pickerWrapper: {
    borderColor: theme.colors.lightGray,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: theme.colors.white,
  },
  picker: {
    height: Platform.OS === 'ios' ? 150 : 50,
    width: '100%',
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

export default ProfileEditScreen
