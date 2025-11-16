import React from 'react'
import {
  Modal,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
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

const AssignWorkoutModal: React.FC<AssignWorkoutModalProps> = ({
  isVisible,
  onClose,
  onAssign,
  selectedDate,
}) => {
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
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Agendar Treino</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>
            Selecione um treino para agendar em {selectedDate}
          </Text>
          <FlatList
            data={workouts}
            keyExtractor={(item) => item.firestoreId}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.workoutItem}
                onPress={() => handleAssign(item.firestoreId)}
              >
                <Text style={styles.workoutName}>{item.name}</Text>
                <Text style={styles.workoutMuscleGroup}>
                  {item.muscleGroup}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Nenhum treino encontrado.</Text>
            }
          />
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: theme.spacing.medium,
    height: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.medium,
  },
  title: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.secondary,
    marginVertical: theme.spacing.medium,
  },
  workoutItem: {
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.small,
  },
  workoutName: {
    fontSize: theme.fontSizes.medium,
    fontWeight: '600',
    color: theme.colors.text,
  },
  workoutMuscleGroup: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.secondary,
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    marginTop: theme.spacing.large,
  },
})

export default AssignWorkoutModal
