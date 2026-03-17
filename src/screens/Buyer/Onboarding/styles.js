import { StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../../../theme';

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.large,
    backgroundColor: colors.background,
  },
  header: {
    ...fonts.header,
    color: colors.primary,
    marginBottom: spacing.small,
    marginTop:30,
  },
  subHeader: {
    ...fonts.subHeader,
    color: colors.text,
    marginBottom: spacing.medium,
  },
  description: {
    ...fonts.body,
    color: colors.textSecondary,
    marginBottom: spacing.xLarge,
  },
  formContainer: {
    marginBottom: spacing.xLarge,
  },
  submitButton: {
    marginTop: spacing.medium,
  },
});