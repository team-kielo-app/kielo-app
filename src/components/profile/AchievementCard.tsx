import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@constants/Colors";
import { CircleCheck } from "lucide-react-native";

type AchievementProps = {
  id: string;
  title: string;
  description: string;
  progress: number;
  total: number;
  color: string;
  earned: boolean;
};

type AchievementCardProps = {
  achievement: AchievementProps;
};

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
}) => {
  const progressPercent = Math.min(
    100,
    Math.round((achievement.progress / achievement.total) * 100)
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: achievement.earned
                ? achievement.color
                : Colors.light.backgroundLight,
            },
          ]}
        >
          {achievement.earned && (
            <CircleCheck size={16} color={Colors.light.white} />
          )}
        </View>
        <Text
          style={[
            styles.title,
            achievement.earned ? styles.earnedTitle : styles.unearnedTitle,
          ]}
        >
          {achievement.title}
        </Text>
      </View>

      <Text style={styles.description}>{achievement.description}</Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${progressPercent}%`,
                backgroundColor: achievement.color,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {achievement.progress}/{achievement.total}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  title: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
  },
  earnedTitle: {
    color: Colors.light.text,
  },
  unearnedTitle: {
    color: Colors.light.textSecondary,
  },
  description: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.light.backgroundLight,
    borderRadius: 3,
    marginRight: 8,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
});
