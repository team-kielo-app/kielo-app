import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Search,
  Plus,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
} from "lucide-react-native";
import { Colors } from "@constants/Colors";
import { ArticleCard } from "@/components/reader/ArticleCard";
import { useRouter } from "expo-router";
import { useResponsiveDimensions } from "@hooks/useResponsiveDimensions";
import { useSelector, useDispatch } from "react-redux";
import { fetchArticles } from "@features/articles/articlesActions";
import { AppDispatch, RootState } from "@store/store";
import { selectUser } from "@features/auth/authSelectors";
import { selectPaginatedData } from "@pagination/selectors";

const CATEGORIES = [
  { id: "news", name: "News" },
  { id: "culture", name: "Culture" },
  { id: "sports", name: "Sports" },
  { id: "science", name: "Science" },
  { id: "technology", name: "Technology" },
];

export default function ReaderScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsiveDimensions();
  const dispatch = useDispatch<AppDispatch>();

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

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef(null);

  const filteredArticles =
    selectedCategory === "all"
      ? articles
      : articles.filter((article) => article.category === selectedCategory);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reader</Text>
        <View style={styles.headerRightButtons}>
          <TouchableOpacity style={styles.headerButton}>
            <Plus size={22} color={Colors.light.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchInputContainer,
            isSearchFocused && styles.searchInputFocused,
          ]}
        >
          <Search size={20} color={Colors.light.textSecondary} />
          <TextInput
            ref={searchRef}
            style={styles.searchInput}
            placeholder="Search articles..."
            placeholderTextColor={Colors.light.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContent}
        >
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === "all" && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory("all")}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === "all" && styles.categoryButtonTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category.id &&
                    styles.categoryButtonTextActive,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.articlesContainer,
          isDesktop && styles.wideScreenArticlesContainer,
        ]}
      >
        {filteredArticles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            onPress={() => router.push(`/article/${article.id}`)}
          />
        ))}
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
  headerTitle: {
    fontFamily: "Inter-Bold",
    fontSize: 24,
    color: Colors.light.text,
  },
  headerRightButtons: {
    flexDirection: "row",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.cardBackground,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  searchInputFocused: {
    borderColor: Colors.light.primary,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: Colors.light.text,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesScrollContent: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.cardBackground,
    marginHorizontal: 4,
  },
  categoryButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  categoryButtonText: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  categoryButtonTextActive: {
    color: Colors.light.white,
  },
  articlesContainer: {
    padding: 20,
    paddingTop: 8,
  },
  wideScreenArticlesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
  },
});

