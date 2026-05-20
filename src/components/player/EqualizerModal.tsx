import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform, Dimensions, StatusBar } from 'react-native';
import Slider from '@react-native-community/slider';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store/store';
import { setEqualizerSettings } from '../../redux/store/player/playerSlice';
import { audioPlayer } from '../../services/audio/AudioPlayerService';
import { useThemeColor, useAccentColor } from '../../hooks/use-theme-color';
import Animated, { FadeInDown, FadeIn, SlideInDown, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface EqualizerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const EqualizerModal: React.FC<EqualizerModalProps> = ({ visible, onClose }) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const accentColor = useAccentColor();
  const textColor = useThemeColor({}, 'text');
  const bgColor = useThemeColor({ dark: '#151718', light: '#FFFFFF' }, 'background');
  const isDark = useSelector((state: RootState) => state.theme.isDarkMode);

  const { enabled, bandLevels, currentPreset } = useSelector((state: RootState) => state.player.equalizerSettings);
  
  const [bands, setBands] = useState<{ freq: number }[]>([]);
  const [presets, setPresets] = useState<string[]>([]);
  const [minMax, setMinMax] = useState({ min: -1500, max: 1500 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localLevels, setLocalLevels] = useState<number[]>([]);

  // Sync local levels when Redux bandLevels change (e.g. from preset selection or restoration)
  useEffect(() => {
    if (bandLevels && bandLevels.length > 0) {
      setLocalLevels(bandLevels);
    }
  }, [bandLevels]);

  const loadData = useCallback(async () => {
    if (Platform.OS !== 'android') return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch bands
      const bandData = await audioPlayer.getEqualizerBands();
      if (bandData && bandData.count > 0) {
        setBands(bandData.bands.map(freq => ({ freq })));
        setMinMax({ min: bandData.min, max: bandData.max });
        
        // Ensure Redux has the latest levels if they're empty
        if (bandLevels.length === 0) {
          dispatch(setEqualizerSettings({ bandLevels: bandData.levels }));
        }
      } else {
        throw new Error("Failed to initialize equalizer bands.");
      }

      // Fetch presets
      const presetData = await audioPlayer.getEqualizerPresets();
      setPresets(presetData);
      setLoading(false);
    } catch (err: any) {
      console.error("Equalizer load error:", err);
      setError(err.message || "Failed to load equalizer settings");
      setLoading(false);
    }
  }, [bandLevels, dispatch]);

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible, loadData]);

  const handleToggle = async () => {
    const newState = !enabled;
    const success = await audioPlayer.setEqualizerEnabled(newState);
    if (success) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleBandChange = (index: number, value: number) => {
    audioPlayer.setEqualizerBandLevel(index, value);
  };

  const handlePresetSelect = async (index: number, name: string) => {
    await audioPlayer.applyEqualizerPreset(index, name);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (Platform.OS !== 'android') return null;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View 
          entering={FadeIn}
          style={StyleSheet.absoluteFill}
        >
          <BlurView 
            intensity={Platform.select({ ios: 30, default: 60 })} 
            tint={isDark ? 'dark' : 'light'} 
            style={StyleSheet.absoluteFill} 
          />
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={onClose} 
          />
        </Animated.View>
        
        <Animated.View 
          entering={SlideInDown.springify().damping(20).stiffness(90)}
          style={[
            styles.modalContainer, 
            { 
              backgroundColor: isDark ? '#151718' : '#FFFFFF',
              paddingBottom: Math.max(insets.bottom, 24),
              height: Dimensions.get('window').height * 0.85
            }
          ]}
        >
          <View style={styles.handle} />
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: textColor }]}>Equalizer</Text>
              <Text style={styles.subtitle}>Fine-tune your sound</Text>
            </View>
            
            <TouchableOpacity 
              onPress={handleToggle}
              style={[
                styles.toggleBtn, 
                { backgroundColor: enabled ? accentColor : (isDark ? '#2D3748' : '#E2E8F0') }
              ]}
            >
              <Text style={[styles.toggleText, { color: enabled ? '#FFF' : textColor }]}>
                {enabled ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sliders Container */}
          <View style={[styles.eqContainer, { opacity: enabled ? 1 : 0.4 }]} pointerEvents={enabled ? 'auto' : 'none'}>
            {loading ? (
              <View style={styles.placeholder}>
                <Text style={{ color: muted }}>Initializing bands...</Text>
              </View>
            ) : error ? (
              <View style={styles.placeholder}>
                <Text style={{ color: '#E53E3E', marginBottom: 12 }}>{error}</Text>
                <TouchableOpacity onPress={loadData} style={styles.retryBtn}>
                  <Text style={{ color: accentColor, fontWeight: 'bold' }}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                {bands.length > 0 ? (
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={[styles.bandsWrapper, { minWidth: '100%' }]}
                  >
                    {bands.map((band, i) => (
                      <View key={i} style={styles.bandColumn}>
                        <Text style={styles.freqText}>
                          {band.freq >= 1000 ? `${(band.freq/1000).toFixed(1)}k` : band.freq}
                        </Text>
                        <View style={styles.sliderWrapper}>
                          <Slider
                            style={styles.slider}
                            minimumValue={minMax.min}
                            maximumValue={minMax.max}
                            value={localLevels[i] ?? bandLevels[i] ?? 0}
                            onValueChange={(val) => {
                              const updated = [...localLevels];
                              updated[i] = Math.round(val);
                              setLocalLevels(updated);
                            }}
                            onSlidingComplete={(val) => {
                              handleBandChange(i, Math.round(val));
                            }}
                            step={100}
                            minimumTrackTintColor={accentColor}
                            maximumTrackTintColor={isDark ? '#2D3748' : '#CBD5E0'}
                            thumbTintColor={accentColor}
                          />
                        </View>
                        <Text style={styles.levelText}>
                          {Math.round((localLevels[i] ?? bandLevels[i] ?? 0) / 100)}dB
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                ) : (
                  <View style={styles.placeholder}>
                    <Text style={{ color: muted }}>No equalizer bands found.</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Presets */}
          <Text style={[styles.sectionLabel, { color: textColor }]}>Presets</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.presetsList}
          >
            {presets.map((name, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => handlePresetSelect(i, name)}
                style={[
                  styles.presetChip,
                  { 
                    backgroundColor: currentPreset === name ? accentColor : (isDark ? '#2D3748' : '#F7FAFC'),
                    borderColor: currentPreset === name ? accentColor : (isDark ? '#4A5568' : '#E2E8F0')
                  }
                ]}
              >
                <Text style={[
                  styles.presetText, 
                  { color: currentPreset === name ? '#FFF' : (isDark ? '#A0AEC0' : '#4A5568') }
                ]}>
                  {name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={[styles.closeBtn, { backgroundColor: isDark ? '#2D3748' : '#F7FAFC' }]} onPress={onClose}>
            <Text style={[styles.closeBtnText, { color: textColor }]}>Close</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const muted = '#718096';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    padding: 24,
    paddingTop: 12,
    width: '100%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(128, 128, 128, 0.3)',
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: muted,
    marginTop: 2,
  },
  toggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  toggleText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  eqContainer: {
    height: 220,
    marginBottom: 24,
  },
  bandsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  bandColumn: {
    alignItems: 'center',
    height: '100%',
    width: 68,
  },
  sliderWrapper: {
    height: 160,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slider: {
    width: 140, 
    height: 60,
    transform: [{ rotate: '-90deg' }],
  },
  freqText: {
    fontSize: 11,
    color: muted,
    fontWeight: '600',
    marginBottom: 8,
  },
  levelText: {
    fontSize: 10,
    color: muted,
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  presetsList: {
    paddingBottom: 20,
  },
  presetChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 13,
    fontWeight: '600',
  },
  closeBtn: {
    marginTop: 10,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  closeBtnText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  }
});
