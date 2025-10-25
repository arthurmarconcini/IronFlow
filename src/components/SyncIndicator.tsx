import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated, Easing } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSyncStore } from '../state/syncStore'
import { theme } from '../theme'

const SyncIndicator: React.FC = () => {
  const isSyncing = useSyncStore((state) => state.isSyncing)
  const rotation = useRef(new Animated.Value(0)).current

  const startRotation = () => {
    rotation.setValue(0)
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start()
  }

  useEffect(() => {
    if (isSyncing) {
      startRotation()
    } else {
      rotation.stopAnimation()
    }
  }, [isSyncing])

  if (!isSyncing) {
    return null
  }

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Ionicons
          name="sync-circle-outline"
          size={24}
          color={theme.colors.primary}
        />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
  },
})

export default SyncIndicator
