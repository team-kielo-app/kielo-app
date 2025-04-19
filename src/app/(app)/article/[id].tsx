import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Modal,
  Animated,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Bookmark,
  Share,
  BookmarkCheck,
  X,
  CirclePlay as PlayCircle,
  Volume2,
} from "lucide-react-native";
import { Colors } from "@constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { useResponsiveDimensions } from "@hooks/useResponsiveDimensions";
import { useSelector, useDispatch } from "react-redux";
import { fetchSingleArticle } from "@features/articles/articlesActions";
import { AppDispatch, RootState } from "@store/store";
import { selectEntityById } from "@pagination/selectors";
import { useRouter } from "expo-router";

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDesktop } = useResponsiveDimensions();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const article = useSelector((state: RootState) =>
    selectEntityById("articles", id)(state)
  );

  useEffect(() => {
    if (article?.content) return;
    dispatch(fetchSingleArticle(id));
  }, [article?.content]);

  const [isSaved, setIsSaved] = useState(false);
  const [selectedText, setSelectedText] = useState<null | string>(null);
  const [translationModalVisible, setTranslationModalVisible] = useState(false);
  const translateAnimation = useRef(new Animated.Value(0)).current;

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(app)/(tabs)");
    }
  };

  if (!article) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Article not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleSaveArticle = () => {
    setIsSaved(!isSaved);
  };

  const handleTextSelection = (text: string) => {
    setSelectedText(text);
    setTranslationModalVisible(true);

    Animated.timing(translateAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeTranslationModal = () => {
    Animated.timing(translateAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setTranslationModalVisible(false);
      setSelectedText(null);
    });
  };

  const translateY = translateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const paragraphs =
    typeof article?.content === "string"
      ? [article?.content]
      : article?.content;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            isDesktop && styles.wideScreenContent,
          ]}
        >
          <View style={styles.headerImageContainer}>
            <Image
              source={{ uri: article?.imageUrl }}
              style={styles.headerImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={["rgba(0,0,0,0.7)", "transparent"]}
              style={styles.headerGradient}
            />
            <View style={styles.articleHeaderControls}>
              <TouchableOpacity
                style={styles.backButtonContainer}
                onPress={handleGoBack}
              >
                <ArrowLeft size={22} color={Colors.light.white} />
              </TouchableOpacity>
              <View style={styles.headerRightButtons}>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={toggleSaveArticle}
                >
                  {isSaved ? (
                    <BookmarkCheck size={22} color={Colors.light.white} />
                  ) : (
                    <Bookmark size={22} color={Colors.light.white} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerButton}>
                  <Share size={22} color={Colors.light.white} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.articleContainer,
              isDesktop && styles.wideScreenArticleContainer,
            ]}
          >
            <View style={styles.articleMetadata}>
              <Text style={styles.articleCategory}>
                {article?.category?.toUpperCase?.()}
              </Text>
              <Text style={styles.articleDate}>{article?.date}</Text>
            </View>

            <Text style={styles.articleTitle}>{article?.title}</Text>

            <Text style={styles.articleSubtitle}>{article?.subtitle}</Text>

            <TouchableOpacity style={styles.audioPlayerContainer}>
              <View style={styles.audioPlayerContent}>
                <PlayCircle size={24} color={Colors.light.primary} />
                <Text style={styles.audioPlayerText}>Listen to Article</Text>
              </View>
              <View style={styles.audioDuration}>
                <Text style={styles.audioDurationText}>4:32</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.articleContent}>
              {paragraphs?.map?.((paragraph, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleTextSelection(paragraph)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.paragraph}>{paragraph}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.sourceContainer}>
              <Text style={styles.sourceText}>Source: {article?.source}</Text>
            </View>
          </View>

          <View
            style={[
              styles.vocabularySection,
              isDesktop && styles.wideScreenVocabularySection,
            ]}
          >
            <Text style={styles.vocabularySectionTitle}>Key Vocabulary</Text>

            {article?.vocabulary &&
              article?.vocabulary.map((item, index) => (
                <View key={index} style={styles.vocabularyItem}>
                  <View style={styles.vocabularyWord}>
                    <Text style={styles.finnishWord}>{item.word}</Text>
                    <TouchableOpacity style={styles.audioButton}>
                      <Volume2 size={16} color={Colors.light.primary} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.englishTranslation}>
                    {item.translation}
                  </Text>
                  <Text style={styles.exampleText}>"{item.example}"</Text>
                </View>
              ))}
          </View>
        </ScrollView>

        {translationModalVisible && (
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              onPress={closeTranslationModal}
            />
            <Animated.View
              style={[
                styles.translationModal,
                { transform: [{ translateY }] },
                isDesktop && styles.wideScreenModal,
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Translation</Text>
                <TouchableOpacity onPress={closeTranslationModal}>
                  <X size={20} color={Colors.light.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.originalTextContainer}>
                <Text style={styles.originalText}>{selectedText}</Text>
                <TouchableOpacity style={styles.audioButton}>
                  <Volume2 size={18} color={Colors.light.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.translationContainer}>
                <Text style={styles.translationText}>
                  {selectedText &&
                    "This is a translated version of the selected text. In a real app, this would be the actual translation from Finnish to English."}
                </Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>
                    Save to Vocabulary
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  wideScreenContent: {
    alignItems: "center",
  },
  headerImageContainer: {
    position: "relative",
    height: 250,
    width: "100%",
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  articleHeaderControls: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerRightButtons: {
    flexDirection: "row",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  articleContainer: {
    padding: 20,
    backgroundColor: Colors.light.background,
  },
  wideScreenArticleContainer: {
    maxWidth: 760,
    width: "100%",
  },
  articleMetadata: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  articleCategory: {
    fontFamily: "Inter-SemiBold",
    fontSize: 14,
    color: Colors.light.primary,
  },
  articleDate: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  articleTitle: {
    fontFamily: "Inter-Bold",
    fontSize: 24,
    color: Colors.light.text,
    marginBottom: 8,
    lineHeight: 32,
  },
  articleSubtitle: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 20,
    lineHeight: 24,
  },
  audioPlayerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  audioPlayerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  audioPlayerText: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: Colors.light.text,
    marginLeft: 8,
  },
  audioDuration: {
    backgroundColor: Colors.light.backgroundLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  audioDurationText: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  articleContent: {
    marginBottom: 24,
  },
  paragraph: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  sourceContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: 16,
  },
  sourceText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontStyle: "italic",
  },
  vocabularySection: {
    padding: 20,
    backgroundColor: Colors.light.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  wideScreenVocabularySection: {
    maxWidth: 760,
    width: "100%",
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 40,
    borderTopWidth: 0,
  },
  vocabularySectionTitle: {
    fontFamily: "Inter-Bold",
    fontSize: 18,
    color: Colors.light.text,
    marginBottom: 16,
  },
  vocabularyItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  vocabularyWord: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  finnishWord: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    color: Colors.light.text,
    marginRight: 8,
  },
  audioButton: {
    padding: 4,
  },
  englishTranslation: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: Colors.light.primary,
    marginBottom: 4,
  },
  exampleText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontStyle: "italic",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  translationModal: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    width: "100%",
    maxHeight: "70%",
  },
  wideScreenModal: {
    maxWidth: 600,
    borderRadius: 16,
    marginBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: "Inter-SemiBold",
    fontSize: 18,
    color: Colors.light.text,
  },
  originalTextContainer: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  originalText: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: Colors.light.text,
    flex: 1,
    marginRight: 8,
    lineHeight: 24,
  },
  translationContainer: {
    backgroundColor: Colors.light.backgroundLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  translationText: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "center",
  },
  actionButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  actionButtonText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 14,
    color: Colors.light.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 18,
    color: Colors.light.text,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 14,
    color: Colors.light.white,
  },
});

