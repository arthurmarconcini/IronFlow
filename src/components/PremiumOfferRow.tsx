import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '../theme'
import { RootNavigationProp } from '../navigation/types'

const PremiumOfferRow: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>()

  const handlePress = () => {
    navigation.navigate('Premium')
  }

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={styles.container}>
        <Ionicons
          name="sparkles-outline"
          size={24}
          color={theme.colors.gold}
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Ative o Diretor de Treino</Text>
          <Text style={styles.details}>
            Receba metas automáticas de progressão a cada sessão.
          </Text>
        </View>
        <Ionicons
          name="chevron-forward-outline"
          size={24}
          color={theme.colors.secondary}
        />
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  icon: {
    marginRight: theme.spacing.medium,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme.fontSizes.medium,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  details: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.secondary,
    marginTop: 2,
  },
})

export default PremiumOfferRow
