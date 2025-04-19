import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Settings,
  BookOpen,
  CircleCheck as CheckCircle,
  ChartBar as BarChart,
  Award,
  Calendar,
} from "lucide-react-native";
import { Colors } from "@constants/Colors";
import { ArticleThumbnail } from "@/components/reader/ArticleThumbnail";
import { ProgressRing } from "@/components/profile/ProgressRing";
import { AchievementCard } from "@/components/profile/AchievementCard";
import { useResponsiveDimensions } from "@hooks/useResponsiveDimensions";
import { useSelector, useDispatch } from "react-redux";
import { fetchArticles } from "@features/articles/articlesActions";
import { AppDispatch, RootState } from "@store/store";
import { selectUser } from "@features/auth/authSelectors";
import { selectPaginatedData } from "@pagination/selectors";
import { useRouter } from "expo-router";

// Stats data
const stats = [
  {
    id: "words",
    label: "Words Learned",
    value: 145,
    icon: <CheckCircle size={18} color={Colors.light.primary} />,
  },
  {
    id: "articles",
    label: "Articles Read",
    value: 12,
    icon: <BookOpen size={18} color={Colors.light.accent} />,
  },
  {
    id: "streak",
    label: "Day Streak",
    value: 7,
    icon: <Calendar size={18} color={Colors.light.warning} />,
  },
];

// Achievements data
const achievements = [
  {
    id: "1",
    title: "First Steps",
    description: "Complete your first article",
    progress: 1,
    total: 1,
    color: Colors.light.success,
    earned: true,
  },
  {
    id: "2",
    title: "Word Collector",
    description: "Learn 100 Finnish words",
    progress: 145,
    total: 100,
    color: Colors.light.primary,
    earned: true,
  },
  {
    id: "3",
    title: "Dedicated Reader",
    description: "Read articles for 5 days in a row",
    progress: 7,
    total: 5,
    color: Colors.light.accent,
    earned: true,
  },
  {
    id: "4",
    title: "Vocabulary Master",
    description: "Learn 500 Finnish words",
    progress: 145,
    total: 500,
    color: Colors.light.warning,
    earned: false,
  },
];

export default function ProfileScreen() {
  const { isDesktop } = useResponsiveDimensions();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter(); // Get router instance

  const userState = useSelector((state: RootState) => selectUser(state));

  const {
    data: articles,
    pagination: { isLoading, error },
  } = useSelector((state: RootState) =>
    selectPaginatedData(
      "articles",
      "articlePagination",
      userState?.id,
      true
    )(state)
  );

  useEffect(() => {
    if (articles.length > 5 || isLoading || error) return;
    dispatch(fetchArticles(userState?.id, { reset: true }));
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push("/(app)/settings")}
        >
          <Settings size={22} color={Colors.light.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop && styles.wideScreenContent,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile info */}
        <View style={styles.profileSection}>
          <Image
            source={{
              uri: `https://picsum.photos/seed/${userState?.id}/200/200`,
            }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Duy Khanh Le</Text>
            <Text style={styles.profileSubtitle}>
              Learning Finnish • Beginner
            </Text>

            <View style={styles.learningStatus}>
              <View style={styles.progressContainer}>
                <ProgressRing
                  progress={0.32}
                  size={60}
                  strokeWidth={6}
                  color={Colors.light.primary}
                />
                <View style={styles.progressTextContainer}>
                  <Text style={styles.progressPercentage}>32%</Text>
                  <Text style={styles.progressLabel}>Level 1</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.streakContainer}>
                <Award size={24} color={Colors.light.accent} />
                <Text style={styles.streakValue}>7</Text>
                <Text style={styles.streakLabel}>Day Streak</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          {stats.map((stat) => (
            <View key={stat.id} style={styles.statItem}>
              <View style={styles.statIconContainer}>{stat.icon}</View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Saved Articles Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Saved Articles</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          {isDesktop ? (
            <View style={styles.wideScreenArticles}>
              {articles.map((article) => (
                <ArticleThumbnail
                  key={article.id}
                  article={article}
                  size="medium"
                />
              ))}
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.savedArticlesScrollContent}
            >
              {articles.map((article) => (
                <ArticleThumbnail key={article.id} article={article} />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Vocabulary Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Vocabulary</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.vocabularyCard}>
            <View style={styles.vocabularyHeader}>
              <View style={styles.vocabularyInfo}>
                <Text style={styles.vocabularyTitle}>Collected Words</Text>
                <Text style={styles.vocabularyCount}>145 words</Text>
              </View>
              <BarChart size={24} color={Colors.light.primary} />
            </View>

            <TouchableOpacity style={styles.practiceButton}>
              <Text style={styles.practiceButtonText}>Practice Vocabulary</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.achievementsContainer,
              isDesktop && styles.wideScreenAchievements,
            ]}
          >
            {achievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  screenTitle: {
    fontFamily: "Inter-Bold",
    fontSize: 24,
    color: Colors.light.text,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.cardBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  wideScreenContent: {
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
  },
  profileSection: {
    flexDirection: "row",
    marginBottom: 24,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
    justifyContent: "center",
  },
  profileName: {
    fontFamily: "Inter-Bold",
    fontSize: 22,
    color: Colors.light.text,
    marginBottom: 4,
  },
  profileSubtitle: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 12,
  },
  learningStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressTextContainer: {
    marginLeft: 12,
  },
  progressPercentage: {
    fontFamily: "Inter-Bold",
    fontSize: 16,
    color: Colors.light.primary,
  },
  progressLabel: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.light.border,
    marginHorizontal: 16,
  },
  streakContainer: {
    alignItems: "center",
  },
  streakValue: {
    fontFamily: "Inter-Bold",
    fontSize: 18,
    color: Colors.light.text,
    marginTop: 4,
  },
  streakLabel: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontFamily: "Inter-Bold",
    fontSize: 18,
    color: Colors.light.text,
  },
  statLabel: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: 18,
    color: Colors.light.text,
  },
  viewAllText: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: Colors.light.primary,
  },
  savedArticlesScrollContent: {
    paddingRight: 20,
  },
  wideScreenArticles: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  vocabularyCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  vocabularyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  vocabularyInfo: {},
  vocabularyTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 4,
  },
  vocabularyCount: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  practiceButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  practiceButtonText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 14,
    color: Colors.light.white,
  },
  achievementsContainer: {
    flexDirection: "column",
  },
  wideScreenAchievements: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});

