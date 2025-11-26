import React, { useState, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native'
import { Calendar, LocaleConfig, DateData } from 'react-native-calendars'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import Toast from 'react-native-toast-message'
import ScreenContainer from '../../components/ScreenContainer'
import { theme } from '../../theme'
import { DatabaseService } from '../../db/DatabaseService'
import { ScheduledWorkout } from '../../types/database'
import { useAuth } from '../../hooks/useAuth'
import { Ionicons } from '@expo/vector-icons'
import { AppNavigationProp } from '../../navigation/types'
import AssignWorkoutModal from '../../components/AssignWorkoutModal'
import { useWorkoutExecutionStore } from '../../state/workoutExecutionStore'

// Configuração de localidade para o calendário
LocaleConfig.locales['pt-br'] = {
  monthNames: [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ],
  monthNamesShort: [
    'Jan.',
    'Fev.',
    'Mar.',
    'Abr.',
    'Mai.',
    'Jun.',
    'Jul.',
    'Ago.',
    'Set.',
    'Out.',
    'Nov.',
    'Dez.',
  ],
  dayNames: [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ],
  dayNamesShort: ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'],
  today: 'Hoje',
}
LocaleConfig.defaultLocale = 'pt-br'

interface MarkedDateDetails {
  marked?: boolean
  dotColor?: string
  selected?: boolean
  selectedColor?: string
  disableTouchEvent?: boolean
}

export default function ScheduleScreen() {
  const { user } = useAuth()
  const navigation = useNavigation<AppNavigationProp>()
  const activeWorkout = useWorkoutExecutionStore((state) => state.workout)
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), 'yyyy-MM-dd'),
  )
  const [scheduledWorkouts, setScheduledWorkouts] = useState<
    ScheduledWorkout[]
  >([])
  const [markedDates, setMarkedDates] = useState<{
    [key: string]: MarkedDateDetails
  }>({})
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)

  const fetchScheduledWorkouts = useCallback(
    async (date: string) => {
      if (!user) return
      setIsLoading(true)
      try {
        const workouts = await DatabaseService.getScheduleForDate(
          user.uid,
          date,
        )
        setScheduledWorkouts(workouts)
      } catch (error) {
        console.error('Failed to fetch scheduled workouts:', error)
      } finally {
        setIsLoading(false)
      }
    },
    [user],
  )

  const fetchMonthSchedule = useCallback(async () => {
    if (!user) return
    try {
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
      const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd')
      const dates = await DatabaseService.getScheduledDates(
        user.uid,
        start,
        end,
      )

      const newMarkedDates: { [key: string]: MarkedDateDetails } = {}
      dates.forEach((date) => {
        newMarkedDates[date] = { marked: true, dotColor: theme.colors.primary }
      })

      // Ensure selected date is always marked as selected
      newMarkedDates[selectedDate] = {
        ...(newMarkedDates[selectedDate] || {}),
        selected: true,
        selectedColor: theme.colors.primary,
        disableTouchEvent: true,
      }

      setMarkedDates(newMarkedDates)
    } catch (error) {
      console.error('Failed to fetch month schedule:', error)
    }
  }, [user, currentMonth, selectedDate])

  useFocusEffect(
    useCallback(() => {
      fetchScheduledWorkouts(selectedDate)
      fetchMonthSchedule()
    }, [fetchScheduledWorkouts, fetchMonthSchedule, selectedDate]),
  )

  // Effect to handle selection change
  useEffect(() => {
    fetchScheduledWorkouts(selectedDate)
    fetchMonthSchedule()
  }, [selectedDate, fetchScheduledWorkouts, fetchMonthSchedule])

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString)
  }

  const handleAssignWorkout = async (workoutId: string) => {
    if (!user) return
    try {
      await DatabaseService.scheduleWorkout(user.uid, workoutId, selectedDate)
      Toast.show({
        type: 'success',
        text1: 'Treino Agendado!',
        text2: 'O treino foi adicionado à sua agenda.',
      })
      fetchScheduledWorkouts(selectedDate)
      fetchMonthSchedule()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        Toast.show({
          type: 'info',
          text1: 'Treino Duplicado',
          text2: 'Este treino já está agendado para este dia.',
        })
      } else {
        console.error('Failed to schedule workout:', error)
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Não foi possível agendar o treino.',
        })
      }
    }
  }

  const handleUnscheduleWorkout = (scheduleId: number) => {
    Alert.alert(
      'Remover Treino',
      'Tem certeza que deseja remover este treino da sua agenda?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.unscheduleWorkout(scheduleId)
              Toast.show({
                type: 'success',
                text1: 'Treino Removido!',
              })
              fetchScheduledWorkouts(selectedDate)
              fetchMonthSchedule()
            } catch (error) {
              console.error('Failed to unschedule workout:', error)
              Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: 'Não foi possível remover o treino.',
              })
            }
          },
        },
      ],
    )
  }

  const renderScheduledWorkouts = () => {
    if (isLoading) {
      return (
        <ActivityIndicator
          color={theme.colors.primary}
          style={{ marginTop: 20 }}
        />
      )
    }

    if (scheduledWorkouts.length === 0) {
      return (
        <Text style={styles.noWorkoutText}>
          Nenhum treino agendado para este dia.
        </Text>
      )
    }

    return scheduledWorkouts.map((workout) => {
      const isCompleted = workout.status === 'completed'
      const isActive = activeWorkout?.firestoreId === workout.firestoreId

      return (
        <TouchableOpacity
          key={workout.scheduleId}
          style={[
            styles.workoutCard,
            isCompleted && styles.completedCard,
            isActive && styles.activeCard,
          ]}
          onPress={() =>
            navigation.navigate('WorkoutExecution', {
              workoutId: workout.firestoreId,
            })
          }
          onLongPress={() => handleUnscheduleWorkout(workout.scheduleId)}
          disabled={isCompleted}
        >
          <View style={styles.workoutInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.workoutName}>{workout.name}</Text>
              {isActive && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Em andamento</Text>
                </View>
              )}
            </View>
            <Text style={styles.workoutMuscleGroup}>{workout.muscleGroup}</Text>
          </View>
          {isCompleted ? (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={theme.colors.primary}
            />
          ) : isActive ? (
            <Ionicons
              name="arrow-forward-circle"
              size={24}
              color={theme.colors.primary}
            />
          ) : null}
        </TouchableOpacity>
      )
    })
  }

  return (
    <ScreenContainer>
      <ScrollView>
        <Calendar
          onDayPress={onDayPress}
          onMonthChange={(date: DateData) => {
            setCurrentMonth(new Date(date.dateString))
          }}
          markedDates={markedDates}
          theme={{
            backgroundColor: theme.colors.background,
            calendarBackground: theme.colors.background,
            textSectionTitleColor: theme.colors.secondary,
            selectedDayBackgroundColor: theme.colors.primary,
            selectedDayTextColor: '#ffffff',
            todayTextColor: theme.colors.primary,
            dayTextColor: theme.colors.text,
            arrowColor: theme.colors.primary,
            monthTextColor: theme.colors.primary,
            indicatorColor: theme.colors.primary,
            dotColor: theme.colors.primary,
            selectedDotColor: '#ffffff',
          }}
        />
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            Treinos para{' '}
            {format(new Date(selectedDate + 'T00:00:00'), "dd 'de' MMMM", {
              locale: ptBR,
            })}
          </Text>
          <Text style={styles.instructionText}>
            Pressione e segure um treino para removê-lo.
          </Text>
        </View>
        <View style={styles.workoutsList}>{renderScheduledWorkouts()}</View>
      </ScrollView>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Ionicons name="add" size={32} color={theme.colors.white} />
      </TouchableOpacity>
      <AssignWorkoutModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onAssign={handleAssignWorkout}
        selectedDate={format(
          new Date(selectedDate + 'T00:00:00'),
          'dd/MM/yyyy',
        )}
      />
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  listHeader: {
    padding: theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  listTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  instructionText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.small / 2,
  },
  workoutsList: {
    paddingHorizontal: theme.spacing.medium,
    paddingBottom: 80,
  },
  workoutCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    marginTop: theme.spacing.medium,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeCard: {
    borderColor: theme.colors.primary,
    borderWidth: 1,
    backgroundColor: theme.colors.background,
  },
  completedCard: {
    backgroundColor: theme.colors.lightGray,
    opacity: 0.7,
  },
  workoutInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  workoutName: {
    fontSize: theme.fontSizes.medium,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  activeBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  activeBadgeText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  workoutMuscleGroup: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.secondary,
    marginTop: 4,
  },
  noWorkoutText: {
    textAlign: 'center',
    marginTop: theme.spacing.large,
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.medium,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: theme.colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
})
