import React, { Component, ErrorInfo, ReactNode } from 'react'
import { View, Text, StyleSheet, Button } from 'react-native'
import { Colors } from '@constants/Colors'

interface Props {
  children: ReactNode
  fallbackUI?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
    // You could log this to an error reporting service (Sentry, Bugsnag)
  }

  private handleResetError = () => {
    this.setState({ hasError: false, error: null })
    // Optionally, try to navigate home or refresh
    // Be careful with this, as the underlying issue might persist.
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallbackUI) {
        return this.props.fallbackUI
      }
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Oops! Something went wrong.</Text>
          <Text style={styles.message}>
            We're sorry for the inconvenience. Please try again.
            {__DEV__ &&
              this.state.error &&
              `\n\nError: ${this.state.error.toString()}`}
          </Text>
          <Button
            title="Try Again"
            onPress={this.handleResetError}
            color={Colors.light.primary}
          />
        </View>
      )
    }

    return this.props.children
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.light.background
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 15
  },
  message: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 20
  }
})

export default ErrorBoundary
