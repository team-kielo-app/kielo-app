import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { AlertCircle } from 'lucide-react-native'
import { Colors } from '@constants/Colors'

interface ErrorMessageProps {
  message: string | null
  title?: string
  style?: object
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  title = 'Error',
  style
}) => {
  if (!message) return null
  return (
    <View style={[styles.errorContainer, style]}>
      <AlertCircle size={20} color={Colors.light.error} style={styles.icon} />
      <View>
        <Text style={styles.errorTitle}>{title}</Text>
        <Text style={styles.errorMessageText}>{message}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  errorContainer: {
    backgroundColor: Colors.light.errorLight,
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.error
  },
  icon: {
    marginRight: 10
  },
  errorTitle: {
    color: Colors.light.error,
    fontWeight: 'bold',
    fontSize: 15
  },
  errorMessageText: {
    color: Colors.light.error,
    fontSize: 14
  }
})
