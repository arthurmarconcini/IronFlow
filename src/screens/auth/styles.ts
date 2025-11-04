import { StyleSheet } from 'react-native'
import { theme } from '../../theme'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.large, // Increased padding
    backgroundColor: theme.colors.background,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.large,
  },
  logo: {
    fontSize: 48, // Larger font for the logo
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  title: {
    fontSize: 32, // Increased size
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: theme.spacing.large,
    color: theme.colors.primary, // Use primary color
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
    color: theme.colors.primary,
    fontSize: theme.fontSizes.medium,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.large,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  separatorText: {
    marginHorizontal: theme.spacing.medium,
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.small,
  },
})
