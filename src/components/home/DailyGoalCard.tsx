import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useSelector } from 'react-redux'
import { Colors } from '@constants/Colors'
import { selectProgressSummary } from '@features/progress/progressSlice'
import { ProgressSummary } from '@features/progress/types'
import { FlameIcon } from '@/assets/svgs/streak-flame'

function getTodayDayName():
  | 'Mon'
  | 'Tue'
  | 'Wed'
  | 'Thu'
  | 'Fri'
  | 'Sat'
  | 'Sun' {
  const days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] = [
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat'
  ]
  const jsDayIndex = new Date().getDay()
  const dayMap: {
    [key: number]: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
  } = {
    0: 'Sun',
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat'
  }
  return dayMap[jsDayIndex]
}

export function DailyGoalCard(): React.ReactElement | null {
  const progressSummary: ProgressSummary | null = useSelector(
    selectProgressSummary
  )

  if (!progressSummary) {
    return (
      <View style={styles.cardBase}>
        <Text style={styles.dailyGoalTitle}>Daily Study Goal</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `0%` }]} />
        </View>
        <View style={styles.progressTextsContainer}>
          <Text style={styles.progressTextMain}>0 / 0 min today</Text>
          <Text style={styles.progressTextPercent}>0%</Text>
        </View>
      </View>
    )
  }

  const todayDayName = getTodayDayName()
  const todayActivity = progressSummary.weekly_activity.find(
    activity => activity.day === todayDayName
  )
  const timeStudiedTodayMinutes = todayActivity ? todayActivity.minutes : 0

  const averageDailyGoalMinutes = Math.max(
    1,
    Math.round(progressSummary.total_study_time_minutes / 7) || 20
  )

  let progressPercentRaw = 0
  if (averageDailyGoalMinutes > 0) {
    progressPercentRaw =
      (timeStudiedTodayMinutes / averageDailyGoalMinutes) * 100
  }

  const displayProgressPercent = Math.min(progressPercentRaw, 100)
  const hasExceededGoal = progressPercentRaw > 100
  const showFireEmoji = progressPercentRaw >= 80

  return (
    <View style={styles.cardBase}>
      <Text style={styles.dailyGoalTitle}>Daily Study Goal</Text>
      <View style={styles.progressBarOuterWrapper}>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${displayProgressPercent}%` },
              hasExceededGoal && {
                backgroundColor: Colors.light.accentYellow,
                opacity: 0.4
              }
            ]}
          />
          {hasExceededGoal && (
            <View style={styles.brokenBarEndContainer}>
              <FlameIcon
                width={24}
                height={24}
                color={Colors.light.accentOrange}
              />
            </View>
          )}
        </View>
      </View>
      <View style={styles.progressTextsContainer}>
        <Text style={styles.progressTextMain}>
          {timeStudiedTodayMinutes} / {averageDailyGoalMinutes} min today
        </Text>
        <View style={styles.percentAndEmojiContainer}>
          <Text style={styles.progressTextPercent}>
            {Math.round(progressPercentRaw)}%
          </Text>
          {showFireEmoji && !hasExceededGoal && (
            <FlameIcon
              width={18}
              height={18}
              color={Colors.light.accentOrange}
            />
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  cardBase: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: Colors.light.shadowSoft,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 24
  },
  dailyGoalTitle: {
    fontFamily: 'Inter-Bold',
    color: Colors.light.text,
    marginBottom: 12,
    fontSize: 18,
    textAlign: 'left'
  },
  progressBarOuterWrapper: {
    marginBottom: 8
  },
  progressBarContainer: {
    width: '100%',
    backgroundColor: Colors.light.dailyGoalTrack,
    borderRadius: 10,
    height: 12,
    overflow: 'visible',
    position: 'relative'
  },
  progressBar: {
    backgroundColor: Colors.light.dailyGoalProgress,
    height: '100%',
    borderRadius: 10,
    zIndex: 1
  },
  brokenBarEndContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: -6,
    marginTop: -4,
    zIndex: 2
  },
  brokenBarSegment: {
    width: 6,
    height: '120%',
    backgroundColor: Colors.light.dailyGoalProgress,
    transform: [{ skewX: '-15deg' }],
    marginRight: -2
  },
  brokenBarSegmentOffset: {
    height: '80%',
    transform: [{ skewX: '10deg' }]
  },
  progressTextsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6
  },
  progressTextMain: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: Colors.light.textSecondary
  },
  percentAndEmojiContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  progressTextPercent: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: Colors.light.text
  }
})
