import { Dimensions } from 'react-native'

const { width: screenWidth } = Dimensions.get('window')

const colors = {
  primary: '#007BFF',
  secondary: '#6C757D',
  background: '#F8F9FA',
  text: '#212529',
  lightGray: '#E0E0E0',
  white: '#FFFFFF',
  darkGray: '#343A40',
  error: '#DC3545', // Cor para ações de perigo/erro
  card: '#FFFFFF',
  border: '#E0E0E0',
  textMuted: '#6C757D',
}

const fontSizes = {
  small: 12,
  medium: 16,
  large: 20,
  xlarge: 24,
}

const spacing = {
  small: 10,
  medium: 20,
  large: 30,
}

const borderRadius = {
  small: 4,
  medium: 8,
  large: 12,
}

export const theme = {
  colors,
  fontSizes,
  spacing,
  borderRadius,
  screenWidth,
}
