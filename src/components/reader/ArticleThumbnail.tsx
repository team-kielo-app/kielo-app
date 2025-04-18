import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { ArticleType } from "types/article";
import { Colors } from "@constants/Colors";
import { Bookmark, BookmarkCheck } from "lucide-react-native";

type ArticleThumbnailProps = {
  article: ArticleType;
  size?: "small" | "medium" | "large";
};

export const ArticleThumbnail: React.FC<ArticleThumbnailProps> = ({
  article,
  size = "small",
}) => {
  const { width } = useWindowDimensions();
  const isWideScreen = width > 768;
  const [isSaved, setIsSaved] = React.useState(false);

  const handlePress = () => {
    router.push(`/article/${article.id}`);
  };

  const toggleSaved = (e: any) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  // Determine dimensions based on size prop and screen width
  let thumbnailWidth = 240;
  let thumbnailHeight = 160;

  if (size === "medium") {
    thumbnailWidth = isWideScreen ? 300 : 240;
    thumbnailHeight = isWideScreen ? 200 : 160;
  } else if (size === "large") {
    thumbnailWidth = isWideScreen ? 360 : 280;
    thumbnailHeight = isWideScreen ? 240 : 180;
  }

  // Responsive width for mobile
  if (!isWideScreen && width < 350) {
    thumbnailWidth = width - 40;
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: thumbnailWidth,
          marginRight: 12,
          marginBottom: isWideScreen ? 16 : 0,
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: article.imageUrl }}
          style={[styles.image, { height: thumbnailHeight }]}
          resizeMode="cover"
        />
        <TouchableOpacity style={styles.bookmarkButton} onPress={toggleSaved}>
          {isSaved ? (
            <BookmarkCheck size={20} color={Colors.light.primary} />
          ) : (
            <Bookmark size={20} color={Colors.light.white} />
          )}
        </TouchableOpacity>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{article.category}</Text>
        </View>
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {article.title}
        </Text>
        <Text style={styles.date}>{article.date}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
  },
  bookmarkButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: Colors.light.white,
    textTransform: "uppercase",
  },
  contentContainer: {
    padding: 12,
  },
  title: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 8,
  },
  date: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
});

