import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { ArticleType } from "types/article";
import { Colors } from "@constants/Colors";
import { Bookmark, BookmarkCheck } from "lucide-react-native";

type ArticleCardProps = {
  article: ArticleType;
  onPress: () => void;
};

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onPress,
}) => {
  const { width } = useWindowDimensions();
  const isWideScreen = width > 768;
  const [isSaved, setIsSaved] = React.useState(false);

  const toggleSaved = (e: any) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  return (
    <TouchableOpacity
      style={[styles.container, isWideScreen && styles.wideScreenContainer]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.contentContainer,
          isWideScreen && styles.wideScreenContentContainer,
        ]}
      >
        <View style={styles.textContainer}>
          <View style={styles.metadataContainer}>
            <Text style={styles.category}>
              {article?.category?.toUpperCase()}
            </Text>
            <Text style={styles.date}>{article?.date}</Text>
          </View>

          <Text style={styles.title} numberOfLines={isWideScreen ? 2 : 3}>
            {article?.title}
          </Text>

          {isWideScreen && (
            <Text style={styles.subtitle} numberOfLines={2}>
              {article?.subtitle}
            </Text>
          )}
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={{ uri: article?.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity style={styles.bookmarkButton} onPress={toggleSaved}>
            {isSaved ? (
              <BookmarkCheck size={18} color={Colors.light.primary} />
            ) : (
              <Bookmark size={18} color={Colors.light.white} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  wideScreenContainer: {
    width: "48%",
  },
  contentContainer: {
    flexDirection: "row",
    padding: 16,
  },
  wideScreenContentContainer: {
    flexDirection: "column-reverse",
    height: 280,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  metadataContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  category: {
    fontFamily: "Inter-SemiBold",
    fontSize: 12,
    color: Colors.light.primary,
  },
  date: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  title: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 4,
    lineHeight: 22,
  },
  subtitle: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  imageContainer: {
    position: "relative",
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  bookmarkButton: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
});

