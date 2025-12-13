import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

// Mock highlight data
const highlightItems = [
    { id: '1', title: 'Highlight of the Week', summary: 'Best moments from the matches...' },
    { id: '2', title: 'Top Goal', summary: 'Spectacular strike...' },
    { id: '3', title: 'Amazing Save', summary: 'Goalkeeper brilliance...' },
];

export default function HighlightScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Highlights</Text>
            <FlatList
                data={highlightItems}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <Link href={{ pathname: '/highlight/[id]', params: { id: item.id } }} asChild>
                        <TouchableOpacity style={styles.item}>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.summary}>{item.summary}</Text>
                        </TouchableOpacity>
                    </Link>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 16 },
    heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 12, color: '#001f3f' },
    item: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
    title: { fontSize: 18, fontWeight: '600', color: '#001f3f' },
    summary: { fontSize: 14, color: '#555' },
});
