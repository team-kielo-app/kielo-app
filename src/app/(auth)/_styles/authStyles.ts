import { StyleSheet, Platform } from 'react-native'
import { Colors } from '@constants/Colors'

const authStyles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: Colors.light.background
  },
  innerContainer: {
    paddingHorizontal: 24,
    paddingVertical: Platform.OS === 'ios' ? 20 : 30,
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
  titleContainer: {},
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: Colors.light.text,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 17,
    fontFamily: 'Inter-Regular',
    color: Colors.light.textSecondary,
    lineHeight: 24
  },
  messageContainer: {
    minHeight: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10
  },
  errorText: {
    color: Colors.light.error,
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    lineHeight: 18
  },
  successText: {
    color: Colors.light.success,
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    lineHeight: 18
  },
  formContainer: {
    gap: 18
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
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: Colors.light.inputBackground,
    color: Colors.light.text,
    fontFamily: 'Inter-Regular',
    borderWidth: 1,
    borderColor: Colors.light.inputBorder
  },
  inputFocused: {
    borderColor: Colors.light.inputBorderFocused
  },
  inputDisabled: {
    backgroundColor: Colors.light.backgroundSecondary,
    color: Colors.light.textTertiary,
    borderColor: Colors.light.borderSubtle
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    backgroundColor: Colors.light.inputBackground
  },
  passwordInputWrapperFocused: {
    borderColor: Colors.light.inputBorderFocused
  },
  passwordInputOnly: {
    flex: 1,
    borderWidth: 0,
    height: 50,
    backgroundColor: Colors.common.transparent,
    paddingLeft: 16,
    paddingRight: 0
  },
  passwordVisibilityButton: {
    padding: 14
  },
  linkText: {
    color: Colors.light.textLink,
    fontSize: 14,
    fontFamily: 'Inter-Medium'
  },
  linkTextBold: {
    color: Colors.light.textLink,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold'
  },
  linkDisabled: {
    opacity: 0.6
  },
  footerContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 15,
    gap: 15
  },
  actionButton: {
    width: '100%',
    height: 52,
    backgroundColor: Colors.common.gray[900],
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.shadowSoft,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2
  },
  actionButtonPressed: {
    backgroundColor: Colors.common.gray[800]
  },
  actionButtonText: {
    color: Colors.light.primaryContent,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold'
  },
  buttonDisabled: {
    backgroundColor: Colors.light.buttonDisabledBackground,
    shadowOpacity: 0,
    elevation: 0
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  orSeparatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 10
  },
  orSeparatorLine: { flex: 1, height: 1, backgroundColor: Colors.light.border },
  orSeparatorText: {
    marginHorizontal: 12,
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: Colors.light.textSecondary
  }
})

export default authStyles
