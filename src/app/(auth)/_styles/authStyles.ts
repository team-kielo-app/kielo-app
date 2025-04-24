import { StyleSheet } from 'react-native'
import { Colors } from '@constants/Colors'

export const authStyles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: Colors.light.background
  },
  innerContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    gap: 20
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40
  },
  backButton: {
    padding: 8,
    marginLeft: -8
  },
  titleContainer: {
    marginBottom: 5
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: Colors.light.text,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: Colors.light.textSecondary,
    lineHeight: 24
  },
  messageContainer: {
    minHeight: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorText: {
    color: Colors.light.error,
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    paddingHorizontal: 10
  },
  successText: {
    color: Colors.light.success,
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    paddingHorizontal: 10
  },
  formContainer: {
    gap: 15
  },
  inputGroup: {
    width: '100%'
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.light.textSecondary,
    marginBottom: 8
  },
  input: {
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: Colors.light.white,
    color: Colors.light.text,
    fontFamily: 'Inter-Regular',
    borderWidth: 1,
    borderColor: Colors.light.border
  },
  inputDisabled: {
    backgroundColor: Colors.light.backgroundLight,
    color: Colors.light.textTertiary,
    borderColor: Colors.light.border
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.white
  },
  passwordInputOnly: {
    flex: 1,
    borderWidth: 0,
    height: 50,
    backgroundColor: 'transparent'
  },
  passwordVisibilityButton: {
    padding: 14
  },
  linkText: {
    color: Colors.light.primary,
    fontSize: 14,
    fontFamily: 'Inter-Medium'
  },
  linkTextBold: {
    color: Colors.light.primary,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold'
  },
  linkDisabled: {
    opacity: 0.6
  },
  footerContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10
  },
  actionButton: {
    width: '100%',
    height: 52,
    backgroundColor: Colors.light.text,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionButtonPressed: {
    backgroundColor: '#333'
  },
  actionButtonText: {
    color: Colors.light.white,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold'
  },
  buttonDisabled: {
    opacity: 0.6
  }
})
