import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@constants/Colors";

type DayProgress = {
  day: string;
  minutes: number;
};

type DailyGoalChartProps = {
  data: DayProgress[];
};

export const DailyGoalChart: React.FC<DailyGoalChartProps> = ({ data }) => {
  const maxMinutes = Math.max(...data.map((day) => day.minutes));

  return (
    <View style={styles.container}>
      {data.map((day, index) => {
        const height = (day.minutes / maxMinutes) * 100;
        const isToday = index === data.length - 1;

        return (
          <View key={day.day} style={styles.barContainer}>
            <View style={styles.barWrapper}>
              <View
                style={[
                  styles.bar,
                  { height: `${height}%` },
                  isToday && styles.todayBar,
                ]}
              />
            </View>
            <Text style={styles.dayLabel}>{day.day}</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 120,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 10,
  },
  barContainer: {
    flex: 1,
    alignItems: "center",
  },
  barWrapper: {
    height: 100,
    width: 20,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  bar: {
    width: 6,
    backgroundColor: Colors.light.primary,
    borderRadius: 3,
    opacity: 0.7,
  },
  todayBar: {
    width: 10,
    backgroundColor: Colors.light.accent,
    opacity: 1,
  },
  dayLabel: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 8,
  },
});
