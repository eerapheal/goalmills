import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

// Mock news data
const newsItems = [
  { id: '1', title: 'GoalMills Launches New Feature', summary: 'We are excited to announce...' },
  { id: '2', title: 'Championship Finals Recap', summary: 'An amazing showdown...' },
  { id: '3', title: 'Player of the Week', summary: 'Highlighting top performer...' },
];

export default function NewsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>News</Text>
      <FlatList
        data={newsItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={{ pathname: '/news/[id]', params: { id: item.id } }} asChild>
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
