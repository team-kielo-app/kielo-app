import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronRight, Star, TrendingUp, Trophy } from "lucide-react-native";
import { DailyGoalChart } from "@components/home/DailyGoalChart";
import { ProgressCard } from "@components/home/ProgressCard";
import { ArticleThumbnail } from "@components/reader/ArticleThumbnail";
import { Colors } from "@constants/Colors";
import { useEffect, useState } from "react";
import { useResponsiveDimensions } from "@hooks/useResponsiveDimensions";
import { useSelector, useDispatch } from "react-redux";
import { fetchArticles } from "@features/articles/articlesActions";
import { AppDispatch, RootState } from "@store/store";
import { selectUser } from "@features/auth/authSelectors";
import { selectPaginatedData } from "@pagination/selectors";
import { useRouter } from "expo-router";

const weeklyProgress = [
  { day: "Mon", minutes: 12 },
  { day: "Tue", minutes: 18 },
  { day: "Wed", minutes: 8 },
  { day: "Thu", minutes: 22 },
  { day: "Fri", minutes: 15 },
  { day: "Sat", minutes: 10 },
  { day: "Sun", minutes: 5 },
];

export default function HomeScreen() {
  const [streakDays, setStreakDays] = useState(7);
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
      userState.id,
      true
    )(state)
  );

  useEffect(() => {
    if (articles.length > 5 || isLoading || error) return;
    dispatch(fetchArticles(userState.id, { reset: true }));
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop && styles.wideScreenContent,
        ]}
      >
        <View style={styles.profileSection}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Hei! 👋</Text>
            <Text style={styles.headerSubtitle}>
              Let's learn some Finnish today
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/(app)/(tabs)/profile")}
          >
            <Image
              source={{
                uri: `https://picsum.photos/seed/${userState.id}/200/200`,
              }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.streakContainer, { marginBottom: 24 }]}>
          <View style={styles.streakInfo}>
            <Trophy size={20} color={Colors.light.accent} />
            <Text style={styles.streakText}>
              {streakDays} day streak! Keep it up!
            </Text>
          </View>
          <DailyGoalChart data={weeklyProgress} />
        </View>

        {/* Progress Cards */}
        <View style={[styles.section, isDesktop && styles.wideScreenSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Progress</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>See all</Text>
              <ChevronRight size={16} color={Colors.light.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.progressCardsContainer}>
            <ProgressCard
              icon={<Star size={20} color={Colors.light.primary} />}
              title="Vocabulary"
              subtitle="145 words learned"
              progress={0.45}
              color={Colors.light.primary}
            />
            <ProgressCard
              icon={<TrendingUp size={20} color={Colors.light.accent} />}
              title="Reading"
              subtitle="12 articles completed"
              progress={0.7}
              color={Colors.light.accent}
            />
          </View>
        </View>

        {/* Featured Articles Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Articles</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>See all</Text>
              <ChevronRight size={16} color={Colors.light.textSecondary} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={articles}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => <ArticleThumbnail article={item} />}
            contentContainerStyle={styles.articleList}
            style={{ marginTop: 16 }}
          />
        </View>

        {/* Daily Challenge */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Challenge</Text>
          </View>

          <TouchableOpacity style={styles.challengeCard}>
            <View style={styles.challengeContent}>
              <View style={styles.challengeIconContainer}>
                <Trophy size={24} color={Colors.light.white} />
              </View>
              <View style={styles.challengeTextContainer}>
                <Text style={styles.challengeTitle}>
                  Complete a News Article
                </Text>
                <Text style={styles.challengeSubtitle}>
                  Read and learn 5 new words
                </Text>
              </View>
            </View>
            <View style={styles.challengeContentRight}>
              <ChevronRight size={20} color={Colors.light.textSecondary} />
            </View>
          </TouchableOpacity>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  wideScreenContent: {
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
    flexDirection: "column",
  },
  header: {
    marginBottom: 20,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 5,
  },
  profileSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerTitle: {
    fontFamily: "Inter-Bold",
    fontSize: 28,
    color: Colors.light.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  streakContainer: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  streakInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  streakText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: 8,
  },
  section: {
    marginBottom: 28,
  },
  wideScreenSection: {
    flexDirection: "column",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: 18,
    color: Colors.light.text,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginRight: 2,
  },
  progressCardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  articleList: {
    paddingRight: 20,
  },
  challengeCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    width: "100%", // Ensure it takes full width
  },
  challengeContent: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1, // Allow left side to shrink if needed
    marginRight: 8,
  },
  challengeContentRight: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
    gap: 8,
  },
  challengeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.accent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  challengeTextContainer: {
    flex: 1,
  },
  challengeTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 4,
  },
  challengeSubtitle: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
});

