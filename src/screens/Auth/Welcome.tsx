import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  StatusBar,
  Image,
  SafeAreaView
} from 'react-native';
import { useDispatch } from 'react-redux';
import { setFirstLaunch } from '../../redux/store/auth/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useAccentColor, useThemeColor } from '../../hooks/use-theme-color';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing
} from 'react-native-reanimated';
import { useEffect } from 'react';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = () => {
  const dispatch = useDispatch();
  const floatAnim = useSharedValue(0);
  const accentColor = useAccentColor();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const mutedTextColor = useThemeColor(
    { light: "#64748B", dark: "#94A3B8" },
    "text",
  );
  const heroBackground = useThemeColor(
    { light: "#F8FAFC", dark: "#1E2022" },
    "surface",
  );
  const badgeBackground = useThemeColor(
    { light: "#FCE8E2", dark: "rgba(179, 74, 48, 0.18)" },
    "surface",
  );
  const badgeTextColor = useThemeColor(
    { light: accentColor, dark: accentColor },
    "text",
  );

  useEffect(() => {
    floatAnim.value = withRepeat(
      withTiming(-15, { 
        duration: 2500, 
        easing: Easing.inOut(Easing.sin) 
      }),
      -1, 
      true
    );
  }, []);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatAnim.value }],
  }));

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('@is_first_launch', 'false');
      dispatch(setFirstLaunch(false));
    } catch (error) {
      console.error("Error setting first launch:", error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={backgroundColor === "#151718" ? "light-content" : "dark-content"}
      />
      
      {/* Background Content */}
      <Animated.View 
        entering={ZoomIn.duration(1500)}
        style={[styles.imageContainer, { backgroundColor: heroBackground }]}
      >
        {/* Spongebob Floating Image */}
        <Animated.View style={[styles.characterContainer, floatStyle]}>
          <Image 
            source={require('../../../assets/Spongpop.png')}
            style={styles.characterImage}
            resizeMode="contain"
          />
        </Animated.View>

        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.5)', '#FFFFFF']}
          style={styles.overlay}
        />
      </Animated.View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Animated.View 
            entering={FadeInDown.delay(400).duration(1000)}
            style={styles.textGroup}
          >
            <View style={[styles.badge, { backgroundColor: badgeBackground }]}>
              <Text style={[styles.badgeText, { color: badgeTextColor }]}>
                PREMIUM MUSIC PLAYER
              </Text>
            </View>
            <Text style={[styles.title, { color: textColor }]}>GiG Player</Text>
            <Text style={[styles.subtitle, { color: mutedTextColor }]}>
              Immerse yourself in high-fidelity sound. Explore millions of tracks with our unbounded carousel experience.
            </Text>
          </Animated.View>

          <Animated.View 
            entering={FadeInUp.delay(800).duration(1000)}
            style={styles.buttonContainer}
          >
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={handleGetStarted}
              style={[styles.button, { shadowColor: accentColor }]}
            >
              <LinearGradient
                colors={[accentColor, '#D86345']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
              >
                <Text style={styles.buttonText}>Get Started</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View 
            entering={FadeInUp.delay(1000).duration(1000)}
            style={styles.footer}
          >
            <Text style={[styles.footerText, { color: mutedTextColor }]}>
              Discover your sound, anytime, anywhere.
            </Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    width: width,
    height: height * 0.65,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  textGroup: {
    marginBottom: 40,
  },
  badge: {
    backgroundColor: '#FCE8E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    marginBottom: 12,
    letterSpacing: -1.5,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    maxWidth: '90%',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 30,
  },
  button: {
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    fontWeight: '500',
  },
  characterContainer: {
    position: 'absolute',
    top: height * 0.15,
    alignSelf: 'center',
    width: width * 0.7,
    height: width * 0.7,
    zIndex: 5,
  },
  characterImage: {
    width: '100%',
    height: '100%',
  },
});

export default WelcomeScreen;
