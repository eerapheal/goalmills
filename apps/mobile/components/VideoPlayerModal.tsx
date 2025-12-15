import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Modal, Pressable, Platform, ActivityIndicator } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Ionicons } from '@expo/vector-icons';

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
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = getVideoId(videoUrl);

    if (!videoId) return null;

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, Platform.OS === 'web' && styles.webContainer]}>
                    <Pressable style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close" size={24} color="#FFF" />
                    </Pressable>

                    <View style={styles.videoWrapper}>
                        {loading && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#FFF" />
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
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
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
        top: -50,
        right: 20,
        width: 44,
        height: 44,
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
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
        zIndex: 1,
    },
});
