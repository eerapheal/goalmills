import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function HighlightDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Highlight Detail</Text>
            <Text style={styles.id}>ID: {id}</Text>
            {/* Replace with real content fetching based on id */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12, color: '#001f3f' },
    id: { fontSize: 16, color: '#555' },
});
