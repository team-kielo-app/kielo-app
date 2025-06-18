const teinte = {
  purple: '#7C3AED',
  blue: '#3B82F6',
  pink: '#EC4899',
  green: '#10B981',
  yellow: '#F59E0B',
  orange: '#F97316',
  red: '#EF4444'
}

const gray = {
  50: '#F9FAFB',
  100: '#F3F4F6',
  200: '#E5E7EB',
  300: '#D1D5DB',
  400: '#9CA3AF',
  500: '#6B7280',
  600: '#4B5563',
  700: '#374151',
  800: '#1F2937',
  900: '#11182C'
}

const common = {
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent'
}

const shadow = {
  subtle: `rgba(${common.black}, 0.05)`,
  soft: `rgba(${common.black}, 0.1)`,
  medium: `rgba(${common.black}, 0.15)`,
  strong: `rgba(${common.black}, 0.2)`,
  legacyDark: 'rgba(0,0,0,0.7)'
}

const teinteBackgrounds = {
  purple: '#F3E8FF',
  blue: '#DBEAFE',
  pink: '#FCE7F3',
  green: '#D1FAE5',
  yellow: '#FEF9C3',
  orange: '#FFF7ED',
  red: '#FEE2E2'
}

const lightTheme = {
  primary: teinte.green,
  primaryContent: common.white,
  primaryLight: teinteBackgrounds.green,

  secondary: teinte.blue,
  secondaryContent: common.white,
  secondaryLight: teinteBackgrounds.blue,

  accent: teinte.pink,
  accentContent: common.white,
  accentLight: teinteBackgrounds.pink,

  background: common.white,
  backgroundSecondary: gray[100],
  backgroundTertiary: gray[50],
  backgroundOverlay: `rgba(${common.black}, 0.4)`,

  text: gray[800],
  textSecondary: gray[500],
  textTertiary: gray[400],
  textPlaceholder: gray[300],
  textDisabled: gray[300],
  textInverted: common.white,
  textLink: teinte.blue,

  border: gray[200],
  borderStrong: gray[300],
  borderSubtle: gray[100],
  inputBorder: gray[300],
  inputBorderFocused: teinte.green,

  success: teinte.green,
  successContent: common.white,
  successBackground: teinteBackgrounds.green,

  warning: teinte.yellow,
  warningContent: gray[800],
  warningBackground: teinteBackgrounds.yellow,

  error: teinte.red,
  errorContent: common.white,
  errorBackground: teinteBackgrounds.red,

  info: teinte.blue,
  infoContent: common.white,
  infoBackground: teinteBackgrounds.blue,

  cardBackground: common.white,
  cardBackgroundSubtle: gray[50],
  inputBackground: common.white,
  buttonDisabledBackground: gray[200],
  buttonDisabledContent: gray[400],

  shadowSubtle: shadow.subtle,
  shadowSoft: shadow.soft,
  shadowMedium: shadow.medium,
  shadowStrong: shadow.strong,

  accentOrange: teinte.orange,
  accentOrangeLight: teinteBackgrounds.orange,
  accentYellow: teinte.yellow,
  accentYellowLight: teinteBackgrounds.yellow,
  accentBlue: teinte.blue,
  accentBlueLight: teinteBackgrounds.blue,
  accentGreen: teinte.green,
  accentGreenLight: teinteBackgrounds.green,

  screenBackgroundGradientFrom: teinteBackgrounds.purple,
  screenBackgroundGradientTo: teinteBackgrounds.blue,

  homeHeaderPoints: teinte.yellow,
  homeHeaderLives: teinte.pink,
  streakDayActive: teinte.green,
  streakDayCurrent: teinte.purple,
  streakDayFuture: gray[200],
  streakDayBroken: teinte.red,
  dailyGoalProgress: teinte.blue,
  dailyGoalTrack: gray[100],

  moduleFlashcardBg: teinteBackgrounds.pink,
  moduleQuizBg: teinteBackgrounds.green,
  moduleNewWordsBg: teinteBackgrounds.yellow,

  tabBarBackground: common.white,
  tabBarActive: teinte.purple,
  tabBarInactive: gray[500],
  tabIconBackgroundActive: teinte.purple + '1A',
  tabIconBackgroundInactive: gray[100],

  flashcardGradientFrom: teinteBackgrounds.pink,
  flashcardGradientTo: teinteBackgrounds.purple,
  flashcardProgressBarFill: teinte.pink,
  flashcardIconBgFront: teinteBackgrounds.pink,
  flashcardIconBgBack: teinteBackgrounds.blue,
  flashcardLangCircleFrBg: teinteBackgrounds.blue,
  flashcardLangCircleFrText: teinte.blue,
  flashcardLangCircleEnBg: teinteBackgrounds.red,
  flashcardLangCircleEnText: teinte.red,
  flashcardAudioButtonFrontBg: teinteBackgrounds.pink,
  flashcardAudioButtonFrontIcon: teinte.pink,
  flashcardAudioButtonBackBg: teinteBackgrounds.blue,
  flashcardAudioButtonBackIcon: teinte.blue,
  flashcardButtonHardBg: teinteBackgrounds.red,
  flashcardButtonMediumBg: teinteBackgrounds.yellow,
  flashcardButtonEasyBg: teinteBackgrounds.green,
  flashcardButtonHardIcon: teinte.red,
  flashcardButtonMediumIcon: teinte.yellow,
  flashcardButtonEasyIcon: teinte.green,
  flashcardButtonText: gray[900],
  flashcardTermText: gray[900],
  flashcardInstructionText: gray[500],
  flashcardPronunciationText: teinte.blue,
  flashcardLangCircleFI: teinte.purple + '33',
  flashcardLangTextFI: teinte.purple,
  flashcardLangCircleEN: teinte.blue + '33',
  flashcardLangTextEN: teinte.blue,
  flashcardAudioButton: teinte.purple,
  flashcardTipBackground: common.white,

  quizScreenGradientFrom: teinteBackgrounds.blue,
  quizScreenGradientTo: '#E0E7FF',
  quizQuestionCardBg: common.white,
  quizOptionBg: common.white,
  quizOptionBorder: gray[200],
  quizOptionSelectedBorder: teinte.blue,
  quizOptionSelectedBg: teinte.blue + '26',
  quizCorrectBg: teinte.green + '26',
  quizCorrectBorder: teinte.green,
  quizIncorrectBg: teinte.red + '26',
  quizIncorrectBorder: teinte.red,
  quizSubmitButtonBg: teinte.blue,
  quizNextButtonBg: teinte.green,

  fillBlankScreenGradientFrom: teinteBackgrounds.green,
  fillBlankScreenGradientTo: '#A7F3D0',
  fillBlankInputBg: common.white,
  fillBlankInputBorder: gray[200],
  fillBlankInputFocusedBorder: teinte.green,
  fillBlankOptionSelectedBorder: teinte.green,
  fillBlankOptionSelectedBg: teinte.green + '33',
  fillBlankSubmitButtonBg: teinte.green,
  fillBlankNextButtonBg: teinte.blue
}

const darkTheme = {}

export const Colors = {
  common: {
    ...common,
    gray
  },
  light: lightTheme,
  dark: darkTheme
}
