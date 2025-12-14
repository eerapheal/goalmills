import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '@goalmills/ui';
import { SportType } from '@goalmills/types';
import { SportTabs } from '../../../components/SportTabs';
import { FootballScreen } from '../../../screens/FootballScreen';
import { CricketScreen } from '../../../screens/CricketScreen';

export default function HomeScreen() {
    const [selectedSport, setSelectedSport] = useState<SportType>('football');

    const renderSportContent = () => {
        switch (selectedSport) {
            case 'football':
                return <FootballScreen />;

            case 'cricket':
                return <CricketScreen />;

            case 'tennis':
            case 'basketball':
            case 'baseball':
            case 'hockey':
                return (
                    <View style={styles.comingSoonContainer}>
                        <Text style={styles.comingSoonEmoji}>
                            {selectedSport === 'tennis' && '🎾'}
                            {selectedSport === 'basketball' && '🏀'}
                            {selectedSport === 'baseball' && '⚾'}
                            {selectedSport === 'hockey' && '🏒'}
                        </Text>
                        <Text style={styles.comingSoonTitle}>
                            {selectedSport.charAt(0).toUpperCase() + selectedSport.slice(1)}
                        </Text>
                        <Text style={styles.comingSoonText}>Coming Soon!</Text>
                        <Text style={styles.comingSoonSubtext}>
                            We're working hard to bring you the best {selectedSport} experience.
                        </Text>
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>

            {/* Sport Category Tabs */}
            <SportTabs selectedSport={selectedSport} onSelectSport={setSelectedSport} />

            {/* Sport Content */}
            <View style={styles.contentContainer}>
                {renderSportContent()}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundDark,
    },
    appHeader: {
        paddingTop: SPACING.xl,
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
        backgroundColor: 'rgba(0, 31, 63, 0.9)',
        borderBottomWidth: 3,
        borderBottomColor: COLORS.secondary,
    },
    appTitle: {
        fontSize: FONT_SIZES.xxl + 4,
        fontWeight: '900',
        color: COLORS.background,
        marginBottom: SPACING.xs,
        letterSpacing: 1,
    },
    appSubtitle: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textLight,
        fontWeight: '600',
    },
    contentContainer: {
        flex: 1,
    },
    comingSoonContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xxl,
    },
    comingSoonEmoji: {
        fontSize: 80,
        marginBottom: SPACING.lg,
    },
    comingSoonTitle: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: '800',
        color: COLORS.background,
        marginBottom: SPACING.sm,
        textTransform: 'capitalize',
    },
    comingSoonText: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '700',
        color: COLORS.secondary,
        marginBottom: SPACING.md,
        textTransform: 'capitalize',
    },
    comingSoonSubtext: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textLight,
        textAlign: 'center',
        lineHeight: 24,
    },
});
