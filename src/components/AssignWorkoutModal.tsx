import React from 'react'
import {
  Modal,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native'
import { useWorkouts } from '../db/useWorkouts'
import { theme } from '../theme'
import { Ionicons } from '@expo/vector-icons'

interface AssignWorkoutModalProps {
  isVisible: boolean
  onClose: () => void
  onAssign: (workoutId: string) => void
  selectedDate: string
}

export default function AssignWorkoutModal({
  isVisible,
  onClose,
  onAssign,
  selectedDate,
}: AssignWorkoutModalProps) {
  const { workouts } = useWorkouts()

  const handleAssign = (workoutId: string) => {
    onAssign(workoutId)
    onClose()
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <Text style={styles.title}>Agendar Treino</Text>
                <Text style={styles.subtitle}>
                  Selecione um treino para {selectedDate}
                </Text>
              </View>
              <FlatList
                data={workouts}
                keyExtractor={(item) => item.firestoreId}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.workoutItem}
                    onPress={() => handleAssign(item.firestoreId)}
                  >
                    <View>
                      <Text style={styles.workoutName}>{item.name}</Text>
                      <Text style={styles.workoutMuscleGroup}>
                        {item.muscleGroup}
                      </Text>
                    </View>
                    <Ionicons
                      name="add-circle-outline"
                      size={24}
                      color={theme.colors.primary}
                    />
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>
                    Você ainda não criou nenhum treino.
                  </Text>
                }
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.large,
    borderTopRightRadius: theme.borderRadius.large,
    padding: theme.spacing.medium,
    height: '60%',
  },
  header: {
    marginBottom: theme.spacing.large,
    alignItems: 'center',
  },
  title: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.small,
  },
  workoutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.small,
  },
  workoutName: {
    fontSize: theme.fontSizes.medium,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  workoutMuscleGroup: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.secondary,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    marginTop: theme.spacing.large,
  },
})
