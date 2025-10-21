import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { theme } from '../theme'

const AVATAR_STORAGE_KEY = 'user_avatar_uri'

const AvatarInput: React.FC = () => {
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [modalVisible, setModalVisible] = useState(false)

  // Load saved avatar on component mount
  useEffect(() => {
    const loadAvatar = async () => {
      const savedUri = await AsyncStorage.getItem(AVATAR_STORAGE_KEY)
      if (savedUri) {
        setImageUri(savedUri)
      }
    }
    loadAvatar()
  }, [])

  const handlePress = () => {
    if (imageUri) {
      setModalVisible(true)
    } else {
      pickImage()
    }
  }

  const pickImage = async () => {
    // Request permissions
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (permissionResult.granted === false) {
      Alert.alert(
        'Permissão necessária',
        'É preciso permitir o acesso à galeria!',
      )
      return
    }

    // Launch image library
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    })

    if (pickerResult.canceled) {
      return
    }

    // Manipulate the image
    if (pickerResult.assets && pickerResult.assets[0].uri) {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        pickerResult.assets[0].uri,
        [{ resize: { width: 200, height: 200 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
      )

      // Save and set the new image
      await AsyncStorage.setItem(AVATAR_STORAGE_KEY, manipulatedImage.uri)
      setImageUri(manipulatedImage.uri)
    }
  }

  return (
    <>
      <TouchableOpacity style={styles.avatarContainer} onPress={handlePress}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.avatar} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>👤</Text>
            <Text style={styles.placeholderText}>Adicionar Foto</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Image
            source={{ uri: imageUri || '' }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.large,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.palette.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 50,
  },
  placeholderText: {
    fontSize: theme.fontSizes.small,
    color: '#FFFFFF',
    marginTop: 5,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    borderRadius: 20,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
})

export default AvatarInput
