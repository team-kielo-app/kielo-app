import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Check, Clock } from 'lucide-react-native'
import { FlameIcon } from '@/assets/svgs/streak-flame'
import { Colors } from '@constants/Colors'
import { ProgressSummary } from '@features/progress/types'

interface StreakCardProps {
  progressSummary: ProgressSummary | null
}

export const StreakCard: React.FC<StreakCardProps> = ({ progressSummary }) => {
  const currentStreak = progressSummary?.streak.current_streak_days || 0
  const weeklyActivity = progressSummary?.weekly_activity || []
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const getDayStatus = (dayName: string, index: number) => {
    const activityDay = weeklyActivity.find(d => d.day === dayName)
    const isToday = index === (new Date().getDay() + 6) % 7
    if (isToday && currentStreak > 0) return Colors.light.streakDayCurrent
    if (activityDay && activityDay.minutes > 0)
      return Colors.light.streakDayActive
    return Colors.light.streakDayFuture
  }

  return (
    <View style={styles.cardBase}>
      <View style={styles.streakHeader}>
        <View>
          <Text style={styles.streakTitle}>Current Streak</Text>
          <Text style={styles.streakSubtitle}>Keep it going!</Text>
        </View>
        <View style={styles.streakValueContainer}>
          <FlameIcon width={24} height={24} color={Colors.light.accentOrange} />
          <Text style={styles.streakValue}>{currentStreak}</Text>
          <Text style={styles.streakDaysText}>days</Text>
        </View>
      </View>
      <View style={styles.streakDaysContainer}>
        {days.map((day, index) => (
          <View key={day} style={styles.streakDayItem}>
            <View
              style={[
                styles.streakDayCircle,
                { backgroundColor: getDayStatus(day, index) }
              ]}
            >
              {getDayStatus(day, index) === Colors.light.streakDayActive && (
                <Check size={16} color={Colors.light.primaryContent} />
              )}
              {getDayStatus(day, index) === Colors.light.streakDayCurrent && (
                <Clock size={16} color={Colors.light.primaryContent} />
              )}
            </View>
            <Text style={styles.streakDayLabel}>{day}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  cardBase: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 20,
    padding: 18,
    shadowColor: Colors.light.shadowSoft,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 24
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  streakTitle: {
    fontFamily: 'Inter-Bold',
    color: Colors.light.text,
    fontSize: 17
  },
  streakSubtitle: {
    fontFamily: 'Inter-Regular',
    color: Colors.light.textSecondary,
    fontSize: 12
  },
  streakValueContainer: { flexDirection: 'row', alignItems: 'flex-end' },
  streakValue: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginLeft: 6,
    color: Colors.light.text,
    lineHeight: 28
  },
  streakDaysText: {
    fontSize: 13,
    marginLeft: 4,
    color: Colors.light.textSecondary,
    fontFamily: 'Inter-Medium',
    paddingBottom: 2
  },
  streakDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16
  },
  streakDayItem: { alignItems: 'center' },
  streakDayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  streakDayLabel: {
    fontSize: 11,
    marginTop: 6,
    color: Colors.light.textSecondary,
    fontFamily: 'Inter-Medium'
  }
})

export default StreakCard
