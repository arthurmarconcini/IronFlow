import React from 'react'
import { View, ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { theme } from '../theme'

interface ScreenContainerProps {
  children: React.ReactNode
  style?: ViewStyle
}

const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  style,
}) => {
  const insets = useSafeAreaInsets()

  // Estilo base do container
  const baseStyle: ViewStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.medium, // Padding horizontal padrão
    // Aplica o padding vertical para respeitar as áreas seguras
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
  }

  return <View style={[baseStyle, style]}>{children}</View>
}

export default ScreenContainer
