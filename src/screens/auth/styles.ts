import { StyleSheet } from 'react-native'
import { theme } from '../../theme'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.large, // Increased padding
    backgroundColor: theme.palette.background,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.large,
  },
  logo: {
    fontSize: 48, // Larger font for the logo
    fontWeight: 'bold',
    color: theme.palette.primary,
  },
  title: {
    fontSize: theme.fontSizes.large,
    textAlign: 'center',
    marginBottom: theme.spacing.large,
    color: theme.palette.text,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: theme.spacing.medium,
  },
  navLinkContainer: {
    marginTop: theme.spacing.medium,
    alignItems: 'center',
  },
  navLinkText: {
    color: theme.palette.primary,
    fontSize: theme.fontSizes.medium,
  },
})
