import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '../theme'
import { Exercise } from '../types/database'

type Props = {
  isVisible: boolean
  exercises: Exercise[]
  currentExerciseIndex: number
  onClose: () => void
  onSelectExercise: (index: number) => void
}

const ExerciseSelectionModal = ({
  isVisible,
  exercises,
  currentExerciseIndex,
  onClose,
  onSelectExercise,
}: Props) => {
  const renderItem = ({ item, index }: { item: Exercise; index: number }) => {
    const isCurrent = index === currentExerciseIndex
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => onSelectExercise(index)}
      >
        <Text style={[styles.itemText, isCurrent && styles.itemTextCurrent]}>
          {index + 1}. {item.name}
        </Text>
        {isCurrent && (
          <Ionicons name="play-circle" size={24} color={theme.colors.primary} />
        )}
      </TouchableOpacity>
    )
  }

  return (
    <Modal visible={isVisible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Exercícios do Treino</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={32} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={exercises}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.name}-${index}`}
          contentContainerStyle={styles.listContent}
        />
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
  },
  title: {
    fontSize: theme.fontSizes.large,
    fontWeight: '600',
  },
  closeButton: {
    padding: 5,
  },
  listContent: {
    padding: theme.spacing.medium,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
  },
  itemText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
    flex: 1,
  },
  itemTextCurrent: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
})

export default ExerciseSelectionModal
