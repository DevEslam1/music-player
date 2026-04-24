import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  LayoutAnimation, 
  Platform, 
  UIManager 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useThemeColor } from "../../hooks/use-theme-color";



const FAQItem = ({ question, answer, textColor }: { question: string, answer: string, textColor: string }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.faqItem}>
      <TouchableOpacity style={styles.questionContainer} onPress={toggleExpand} activeOpacity={0.7}>
        <Text style={[styles.question, { color: textColor }]}>{question}</Text>
        <Ionicons 
          name={expanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#B34A30" 
        />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.answerContainer}>
          <Text style={[styles.answer, { color: textColor + 'CC' }]}>{answer}</Text>
        </View>
      )}
    </View>
  );
};

export default function FAQScreen() {
  const navigation = useNavigation<any>();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  const faqs = [
    {
      question: "How do I create a playlist?",
      answer: "Open the Drawer Menu, go to 'Playlist', and tap the '+' icon or 'Create New Playlist' button. Give your playlist a name and you're ready to add songs!"
    },
    {
      question: "How can I find my favorite songs?",
      answer: "Every time you love a track, tap the heart icon. Those tracks will be saved in your 'Liked Songs' section in the Drawer for quick access."
    },
    {
      question: "What is Hybrid Search?",
      answer: "GIG's Hybrid Search combines your local library and the cloud. It searches your Liked Songs and Playlists first, ensuring they appear at the top of the results."
    },
    {
      question: "How do I toggle Dark Mode?",
      answer: "Simply open the Drawer Menu and tap the Moon icon in the top right corner. The app will instantly switch between Light and Dark mode."
    },
    {
      question: "Can I use GIG offline?",
      answer: "Currently, GIG requires an active internet connection to stream music from our cloud library. Offline mode is a featured planned for future updates!"
    },
    {
      question: "How do I contacted support?",
      answer: "If you encounter any issues, you can navigate to 'Contact us' in the Drawer Menu to reach out to our team."
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>FAQs</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>Frequently Asked Questions</Text>
        <Text style={[styles.description, { color: textColor + '99' }]}>
          Find quick answers to common questions about using GIG Music Player.
        </Text>

        <View style={styles.faqContainer}>
          {faqs.map((faq, index) => (
            <FAQItem 
              key={index}
              question={faq.question}
              answer={faq.answer}
              textColor={textColor}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: textColor + '99' }]}>Still need help?</Text>
          <TouchableOpacity style={styles.contactButton}>
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#B34A30",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#94A3B8",
    marginBottom: 30,
    lineHeight: 22,
  },
  faqContainer: {
    marginBottom: 40,
  },
  faqItem: {
    marginBottom: 16,
    backgroundColor: 'rgba(241, 245, 249, 0.3)',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.5)',
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
  },
  answerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  answer: {
    fontSize: 15,
    color: "#64748B",
    lineHeight: 22,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 16,
    color: "#94A3B8",
    marginBottom: 16,
  },
  contactButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#B34A30',
  },
  contactButtonText: {
    color: '#B34A30',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
