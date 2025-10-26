import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { useAuth } from '../../hooks/useAuth'
import { theme } from '../../theme'
import ScreenContainer from '../../components/ScreenContainer'
import AvatarInput from '../../components/AvatarInput'
import { useProfileStore } from '../../state/profileStore'
import { Ionicons } from '@expo/vector-icons'
import { convertCmToFtIn, convertKgToLbs } from '../../utils/conversionUtils'
import { AppNavigationProp } from '../../navigation/types'

const DataRow = ({
  label,
  value,
}: {
  label: string
  value: string | number | null | undefined
}) => (
  <View style={styles.dataRow}>
    <Text style={styles.dataLabel}>{label}</Text>
    <Text style={styles.dataValue}>{value || 'N/A'}</Text>
  </View>
)

const ActionButton = ({
  icon,
  label,
  onPress,
  isLogout = false,
}: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  onPress: () => void
  isLogout?: boolean
}) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <Ionicons
      name={icon}
      size={22}
      color={isLogout ? theme.colors.error : theme.colors.primary}
      style={styles.actionIcon}
    />
    <Text style={[styles.actionLabel, isLogout && styles.logoutText]}>
      {label}
    </Text>
    {!isLogout && (
      <Ionicons
        name="chevron-forward-outline"
        size={20}
        color={theme.colors.secondary}
      />
    )}
  </TouchableOpacity>
)

type Props = {
  navigation: AppNavigationProp
}

export default function ProfileScreen({ navigation }: Props) {
  const { user, logout } = useAuth()
  const { profile, unitSystem, setUnitSystem } = useProfileStore()

  const goalMap = {
    GAIN_MASS: 'Ganhar Massa',
    LOSE_FAT: 'Perder Gordura',
    MAINTAIN: 'Manter a Forma',
  }

  const bmiCategoryMap = {
    UNDERWEIGHT: 'Abaixo do Peso',
    HEALTHY_WEIGHT: 'Peso Saudável',
    OVERWEIGHT: 'Sobrepeso',
    OBESITY: 'Obesidade',
  }

  const syncStatusMap = {
    synced: {
      text: 'Sincronizado',
      color: theme.colors.primary,
      icon: 'checkmark-circle-outline' as const,
    },
    dirty: {
      text: 'Aguardando Sinc.',
      color: theme.colors.secondary,
      icon: 'time-outline' as const,
    },
    syncing: {
      text: 'Sincronizando...',
      color: theme.colors.primary,
      icon: 'sync-circle-outline' as const,
    },
    error: {
      text: 'Falha na Sinc.',
      color: theme.colors.error,
      icon: 'alert-circle-outline' as const,
    },
  }

  const currentSyncStatus = profile?.syncStatus ?? 'dirty'
  const syncDisplay = syncStatusMap[currentSyncStatus]

  const displayHeight =
    unitSystem === 'metric'
      ? `${profile?.heightCm?.toFixed(0) ?? 'N/A'} cm`
      : convertCmToFtIn(profile?.heightCm ?? 0)
  const displayWeight =
    unitSystem === 'metric'
      ? `${profile?.currentWeightKg?.toFixed(1) ?? 'N/A'} kg`
      : `${convertKgToLbs(profile?.currentWeightKg ?? 0).toFixed(1)} lbs`

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <AvatarInput />
          <Text style={styles.displayName}>
            {user?.displayName || 'Usuário'}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Meu Perfil</Text>
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
          <DataRow
            label="Objetivo"
            value={
              profile?.goal
                ? goalMap[profile.goal as keyof typeof goalMap]
                : null
            }
          />
          <DataRow label="Altura" value={displayHeight} />
          <DataRow label="Peso Atual" value={displayWeight} />
          <DataRow
            label="IMC"
            value={
              profile?.bmi && profile.bmiCategory
                ? `${profile.bmi.toFixed(1)} (${bmiCategoryMap[profile.bmiCategory as keyof typeof bmiCategoryMap]})`
                : null
            }
          />
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Status</Text>
            <View style={styles.statusContainer}>
              <Ionicons
                name={syncDisplay.icon}
                size={18}
                color={syncDisplay.color}
              />
              <Text
                style={[
                  styles.dataValue,
                  { color: syncDisplay.color, marginLeft: 6 },
                ]}
              >
                {syncDisplay.text}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ações</Text>
          <ActionButton
            icon="create-outline"
            label="Editar Perfil"
            onPress={() => navigation.navigate('ProfileEdit')}
          />
          <ActionButton
            icon="stats-chart-outline"
            label="Estatísticas"
            onPress={() => {}}
          />
          <ActionButton
            icon="settings-outline"
            label="Configurações"
            onPress={() => {}}
          />
          <ActionButton
            icon="log-out-outline"
            label="Sair"
            onPress={logout}
            isLogout
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingVertical: theme.spacing.medium,
    // O paddingHorizontal agora é gerenciado pelo ScreenContainer
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
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.large,
    // O marginHorizontal foi removido para alinhar com o padding do ScreenContainer
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
  },
  cardTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: '600',
    color: theme.colors.text,
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
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
  },
  dataLabel: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.secondary,
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.small,
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
})
