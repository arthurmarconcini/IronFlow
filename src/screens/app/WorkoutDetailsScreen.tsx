import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import ScreenContainer from '../../components/ScreenContainer'
import { theme } from '../../theme'

export default function WorkoutDetailsScreen() {
  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>Detalhes do Treino</Text>
      </View>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.medium,
  },
  title: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
})
