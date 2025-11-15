import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { useAuth } from '../../hooks/useAuth'
import { theme } from '../../theme'
import ScreenContainer from '../../components/ScreenContainer'
import AvatarInput from '../../components/AvatarInput'
import { useProfileStore } from '../../state/profileStore'
import { Ionicons } from '@expo/vector-icons'
import { convertCmToFtIn, convertKgToLbs } from '../../utils/conversionUtils'
import { signOut } from 'firebase/auth'
import { auth } from '../../config/firebaseConfig'
import { AppNavigationProp } from '../../navigation/types'
import { UserProfile } from '../../types/database'
import { useSubscription } from '../../hooks/useSubscription'
import { useSubscriptionStatus } from '../../hooks/useSubscriptionStatus'
import ProfileCard from '../../components/ProfileCard'
import InfoRow from '../../components/InfoRow'
import {
  availabilityMap,
  bmiCategoryMap,
  experienceMap,
  goalMap,
  planMap,
  sexMap,
} from '../../utils/translationUtils'
import { usePremiumAction } from '../../hooks/usePremiumAction'

const ActionButton = ({
  icon,
  label,
  onPress,
  isLogout = false,
  isPremium = false,
  isActiveStatus = false, // Nova prop para o indicador
}: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  onPress: () => void
  isLogout?: boolean
  isPremium?: boolean
  isActiveStatus?: boolean
}) => (
  <TouchableOpacity
    style={[
      styles.actionButton,
      isPremium && !isActiveStatus && styles.premiumButton,
    ]}
    onPress={onPress}
    disabled={isActiveStatus} // Desabilita o toque para o indicador
  >
    <Ionicons
      name={icon}
      size={22}
      color={
        isLogout
          ? theme.colors.error
          : isPremium && !isActiveStatus
            ? theme.colors.white
            : theme.colors.primary
      }
      style={styles.actionIcon}
    />
    <Text
      style={[
        styles.actionLabel,
        isLogout && styles.logoutText,
        isPremium && !isActiveStatus && styles.premiumText,
        isActiveStatus && styles.premiumActiveText,
      ]}
    >
      {label}
    </Text>
    {!isLogout && !isActiveStatus && (
      <Ionicons
        name="chevron-forward-outline"
        size={20}
        color={isPremium ? theme.colors.white : theme.colors.secondary}
      />
    )}
  </TouchableOpacity>
)

type Props = {
  navigation: AppNavigationProp
}

const getMappedValue = <T extends string>(
  map: Record<T, string>,
  key: T | null | undefined,
): string => {
  if (key && key in map) {
    return map[key]
  }
  return 'N/A'
}

export default function ProfileScreen({ navigation }: Props) {
  const { user } = useAuth()
  const { profile, unitSystem, setUnitSystem } = useProfileStore()
  const { planType } = useSubscription()
  const { isPremium } = useSubscriptionStatus()
  const { handlePremiumAction } = usePremiumAction()

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const syncStatusMap: Record<
    UserProfile['syncStatus'],
    {
      text: string
      color: string
      icon: keyof typeof Ionicons.glyphMap
    }
  > = {
    synced: {
      text: 'Sincronizado',
      color: theme.colors.primary,
      icon: 'checkmark-circle-outline',
    },
    dirty: {
      text: 'Aguardando Sinc.',
      color: theme.colors.secondary,
      icon: 'time-outline',
    },
    syncing: {
      text: 'Sincronizando...',
      color: theme.colors.primary,
      icon: 'sync-circle-outline',
    },
    error: {
      text: 'Falha na Sinc.',
      color: theme.colors.error,
      icon: 'alert-circle-outline',
    },
  }

  if (!profile) {
    return (
      <ScreenContainer
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ScreenContainer>
    )
  }

  const currentSyncStatus = profile.syncStatus
  const syncDisplay = syncStatusMap[currentSyncStatus]

  const displayHeight =
    unitSystem === 'metric'
      ? `${profile.heightCm?.toFixed(0) ?? 'N/A'} cm`
      : convertCmToFtIn(profile.heightCm ?? 0)
  const displayWeight =
    unitSystem === 'metric'
      ? `${profile.currentWeightKg?.toFixed(1) ?? 'N/A'} kg`
      : `${convertKgToLbs(profile.currentWeightKg ?? 0).toFixed(1)} lbs`

  const BmiInfo = () => {
    if (!profile.bmi || !profile.bmiCategory) return null
    const category = getMappedValue(bmiCategoryMap, profile.bmiCategory)
    return (
      <View style={styles.bmiContainer}>
        <Text style={styles.bmiValue}>{profile.bmi.toFixed(1)}</Text>
        <Text style={styles.bmiCategory}>({category})</Text>
      </View>
    )
  }

  const SyncStatusInfo = () => (
    <View style={styles.statusContainer}>
      <Ionicons name={syncDisplay.icon} size={18} color={syncDisplay.color} />
      <Text
        style={[styles.dataValue, { color: syncDisplay.color, marginLeft: 6 }]}
      >
        {syncDisplay.text}
      </Text>
    </View>
  )

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <AvatarInput />
          <Text style={styles.displayName}>
            {profile.displayName || user?.email}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <ProfileCard title="Métricas Corporais">
          <View style={styles.cardHeader}>
            <Text style={styles.cardSubtitle}>Unidades</Text>
            <View style={styles.unitSelector}>
              <TouchableOpacity
                onPress={() => setUnitSystem('metric')}
                style={[
                  styles.unitButton,
                  unitSystem === 'metric' && styles.unitButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.unitText,
                    unitSystem === 'metric' && styles.unitTextActive,
                  ]}
                >
                  Métrico
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setUnitSystem('imperial')}
                style={[
                  styles.unitButton,
                  unitSystem === 'imperial' && styles.unitButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.unitText,
                    unitSystem === 'imperial' && styles.unitTextActive,
                  ]}
                >
                  Imperial
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <InfoRow label="Altura" value={displayHeight} icon="body-outline" />
          <InfoRow label="Peso" value={displayWeight} icon="barbell-outline" />
          <InfoRow label="IMC" value={<BmiInfo />} icon="calculator-outline" />
        </ProfileCard>

        <ProfileCard title="Meu Plano de Treino">
          <InfoRow
            label="Objetivo"
            value={getMappedValue(goalMap, profile.goal)}
            icon="trophy-outline"
          />
          <InfoRow
            label="Nível"
            value={getMappedValue(experienceMap, profile.experienceLevel)}
            icon="analytics-outline"
          />
          <InfoRow
            label="Disponibilidade"
            value={getMappedValue(availabilityMap, profile.availability)}
            icon="calendar-outline"
          />
        </ProfileCard>

        <ProfileCard title="Minha Conta">
          <InfoRow
            label="Plano"
            value={getMappedValue(planMap, planType)}
            icon="ribbon-outline"
          />
          <InfoRow
            label="Status"
            value={<SyncStatusInfo />}
            icon="sync-outline"
          />
          <InfoRow
            label="Sexo"
            value={getMappedValue(sexMap, profile.sex)}
            icon="transgender-outline"
          />
          <InfoRow
            label="Data de Nasc."
            value={profile.dob}
            icon="calendar-number-outline"
          />
        </ProfileCard>

        <ProfileCard title="Ações">
          {isPremium ? (
            <ActionButton
              icon="shield-checkmark-outline"
              label="Plano Premium Ativo"
              onPress={() => {}}
              isActiveStatus // Passa a nova prop
            />
          ) : (
            <ActionButton
              icon="sparkles-outline"
              label="Fazer Upgrade para Premium"
              onPress={() => handlePremiumAction(() => {})}
              isPremium
            />
          )}
          <ActionButton
            icon="create-outline"
            label="Editar Perfil"
            onPress={() => navigation.navigate('ProfileEdit')}
          />
          <ActionButton
            icon="stats-chart-outline"
            label="Estatísticas"
            onPress={() =>
              navigation.navigate('AppTabs', { screen: 'StatsTab' })
            }
          />
          <ActionButton
            icon="settings-outline"
            label="Configurações"
            onPress={() => {}}
          />
          <ActionButton
            icon="log-out-outline"
            label="Sair"
            onPress={handleLogout}
            isLogout
          />
        </ProfileCard>
      </ScrollView>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingVertical: theme.spacing.medium,
  },
  displayName: {
    fontSize: theme.fontSizes.xlarge,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.medium,
  },
  email: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.secondary,
    marginTop: theme.spacing.small / 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
    paddingBottom: theme.spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
  },
  cardSubtitle: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.secondary,
  },
  unitSelector: {
    flexDirection: 'row',
    backgroundColor: theme.colors.lightGray,
    borderRadius: 8,
  },
  unitButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  unitButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  unitText: {
    color: theme.colors.secondary,
    fontWeight: '600',
    fontSize: 12,
  },
  unitTextActive: {
    color: theme.colors.white,
  },
  dataValue: {
    fontSize: theme.fontSizes.medium,
    fontWeight: '500',
    color: theme.colors.text,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bmiContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bmiValue: {
    fontSize: theme.fontSizes.medium,
    fontWeight: '500',
    color: theme.colors.text,
  },
  bmiCategory: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.secondary,
    marginLeft: theme.spacing.small,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.small,
    borderRadius: theme.borderRadius.medium,
  },
  premiumButton: {
    backgroundColor: theme.colors.primary, // Usa a cor primária
    marginVertical: theme.spacing.small / 2,
  },
  actionIcon: {
    marginRight: theme.spacing.medium,
  },
  actionLabel: {
    flex: 1,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
  },
  logoutText: {
    color: theme.colors.error,
    fontWeight: '600',
  },
  premiumText: {
    color: theme.colors.white, // Texto branco para o botão de upgrade
    fontWeight: '600',
  },
  premiumActiveText: {
    color: theme.colors.primary, // Texto primário para o indicador
    fontWeight: '600',
  },
})
