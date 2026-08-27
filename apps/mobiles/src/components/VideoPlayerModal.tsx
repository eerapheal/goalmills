import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
  ActivityIndicator,
  Text,
  Image,
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '@goalmills/ui';

interface VideoPlayerModalProps {
  visible: boolean;
  videoUrl: string | null;
  onClose: () => void;
}

export const VideoPlayerModal = ({ visible, videoUrl, onClose }: VideoPlayerModalProps) => {
  const [playing, setPlaying] = useState(true);
  const [loading, setLoading] = useState(true);

  const onStateChange = useCallback((state: string) => {
    if (state === 'ended') {
      setPlaying(false);
    }
    if (state === 'playing') {
      setLoading(false);
    }
  }, []);

  const getVideoId = (url: string | null) => {
    if (!url) return null;
    // Handle various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getVideoId(videoUrl);

  if (!videoId) return null;

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Header Branding */}
        <View style={[styles.brandingContainer, Platform.OS === 'web' && styles.webBranding]}>
          <Image source={require('../assets/icon.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.appName}>GoalMills</Text>
        </View>

        <View style={[styles.container, Platform.OS === 'web' && styles.webContainer]}>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#FFF" />
          </Pressable>

          <View style={styles.videoWrapper}>
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.secondary} />
              </View>
            )}
            <YoutubePlayer
              height={Platform.OS === 'web' ? '100%' : 240} // 16:9 aspect ratio approximation or full height
              play={playing}
              videoId={videoId}
              onChangeState={onStateChange}
              onReady={() => setLoading(false)}
              webViewStyle={{ opacity: 0.99 }} // Hack to prevent some rendering issues
              webViewProps={{
                allowsFullscreenVideo: true,
                androidLayerType: 'hardware',
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 31, 63, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  brandingContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    gap: SPACING.sm,
  },
  webBranding: {
    top: 20,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  appName: {
    color: '#FFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  webContainer: {
    width: '80%',
    maxHeight: '80%',
    maxWidth: 1000,
    borderRadius: 12,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: -60,
    right: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 22,
  },
  videoWrapper: {
    width: '100%',
    // On mobile, the height is controlled by the player prop, but we wrap it to ensure layout stability
  },
  loadingContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    zIndex: 1,
  },
});
