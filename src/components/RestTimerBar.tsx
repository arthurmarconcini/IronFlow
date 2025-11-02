import React, { useEffect, useRef } from 'react'
import {
  View,
  StyleSheet,
  Animated,
  Text,
  TouchableOpacity,
} from 'react-native'
import { theme } from '../theme'

type RestTimerBarProps = {
  duration: number
  isActive: boolean
  onFinish: () => void
}

const RestTimerBar = ({ duration, isActive, onFinish }: RestTimerBarProps) => {
  const progress = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (isActive) {
      progress.setValue(0)
      Animated.timing(progress, {
        toValue: 1,
        duration: duration * 1000,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          onFinish()
        }
      })
    } else {
      progress.stopAnimation()
      progress.setValue(0)
    }
  }, [isActive, duration, progress, onFinish])

  const widthInterpolated = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  })

  if (!isActive) {
    return null
  }

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>Descanso</Text>
        <TouchableOpacity onPress={onFinish}>
          <Text style={styles.skipButton}>Pular</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.barBackground}>
        <Animated.View
          style={[styles.barForeground, { width: widthInterpolated }]}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.small,
    marginBottom: theme.spacing.medium,
    paddingHorizontal: theme.spacing.medium,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.small / 2,
  },
  label: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.secondary,
  },
  skipButton: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  barBackground: {
    height: 10,
    backgroundColor: theme.colors.lightGray,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barForeground: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 5,
  },
})

export default RestTimerBar
