import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from 'react-native'
import { theme } from '../theme'
import { Ionicons } from '@expo/vector-icons'

export type Option = {
  label: string
  value: string
}

type StyledSelectProps = {
  label?: string
  placeholder?: string
  value: string
  options: Option[]
  onValueChange: (value: string) => void
  error?: string
  containerStyle?: object
}

const StyledSelect = ({
  label,
  placeholder = 'Selecione uma opção',
  value,
  options,
  onValueChange,
  error,
  containerStyle,
}: StyledSelectProps) => {
  const [modalVisible, setModalVisible] = useState(false)

  const selectedOption = options.find((opt) => opt.value === value)

  const handleSelect = (itemValue: string) => {
    onValueChange(itemValue)
    setModalVisible(false)
  }

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={[
          styles.selectButton,
          error ? { borderColor: theme.colors.error } : null,
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={[
            styles.valueText,
            !selectedOption && { color: theme.colors.textMuted },
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={theme.colors.textMuted}
        />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{label || placeholder}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    item.value === value && styles.selectedOptionItem,
                  ]}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item.value === value && styles.selectedOptionText,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={theme.colors.primary}
                    />
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: theme.spacing.small,
  },
  label: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xsmall,
    fontWeight: '500',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.white,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.medium,
    height: 50,
    paddingHorizontal: theme.spacing.medium,
  },
  valueText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSizes.small,
    marginTop: theme.spacing.xsmall,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.medium,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.medium,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    marginBottom: theme.spacing.medium,
    textAlign: 'center',
    color: theme.colors.text,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
  },
  selectedOptionItem: {
    backgroundColor: theme.colors.lightPrimary,
    borderRadius: theme.borderRadius.small,
    paddingHorizontal: theme.spacing.small,
    borderBottomWidth: 0,
  },
  optionText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
  },
  selectedOptionText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  closeButton: {
    marginTop: theme.spacing.medium,
    padding: theme.spacing.medium,
    alignItems: 'center',
  },
  closeButtonText: {
    color: theme.colors.error,
    fontSize: theme.fontSizes.medium,
    fontWeight: '600',
  },
})

export default StyledSelect
