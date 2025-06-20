import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { Colors } from '@constants/Colors'

interface LearningModuleProps {
  title: string
  description: string
  iconUrl: string
  backgroundColor: string
  onPress: () => void
}

export function LearningModuleCard({
  title,
  description,
  iconUrl,
  backgroundColor,
  onPress
}: LearningModuleProps): React.ReactElement {
  return (
    <TouchableOpacity
      style={[styles.moduleCardBase, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.moduleIconContainer}>
        <Image source={{ uri: iconUrl }} style={styles.moduleIconImage} />
      </View>
      <Text style={styles.moduleTitle}>{title}</Text>
      <Text style={styles.moduleDescription} numberOfLines={2}>
        {description}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  moduleCardBase: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderStrong,
    alignItems: 'flex-start',
    width: '48%',
    marginBottom: 16,
    minHeight: 150
  },
  moduleIconContainer: {
    width: '100%',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
    overflow: 'hidden'
  },
  moduleIconImage: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
    textAlign: 'center'
  },
  moduleTitle: {
    fontFamily: 'Inter-Bold',
    color: Colors.light.text,
    fontSize: 16,
    marginBottom: 4,
    width: '100%',
    textAlign: 'center'
  },
  moduleDescription: {
    fontFamily: 'Inter-Regular',
    color: Colors.light.text,
    opacity: 0.8,
    fontSize: 12,
    lineHeight: 16,
    width: '100%',
    textAlign: 'center'
  }
})
