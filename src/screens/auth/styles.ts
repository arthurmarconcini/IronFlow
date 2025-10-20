import { StyleSheet } from 'react-native'
import { theme } from '../../theme'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.medium,
    backgroundColor: theme.palette.background,
  },
  title: {
    fontSize: theme.fontSizes.large,
    textAlign: 'center',
    marginBottom: theme.spacing.large,
    color: theme.palette.text,
  },
  input: {
    height: 40,
    borderColor: theme.palette.secondary,
    borderWidth: 1,
    marginBottom: theme.spacing.medium,
    paddingHorizontal: theme.spacing.small,
    borderRadius: 4,
  },
  buttonContainer: {
    marginTop: theme.spacing.medium,
  },
})
