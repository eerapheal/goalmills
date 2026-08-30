import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import goalmillsApi from '../services/goalmillsApi';

export function SearchScreen() {
  const [query, setQuery] = useState('');
  const [sport, setSport] = useState('all');
  const [results, setResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // Autocomplete suggestions
  useEffect(() => {
    async function loadSuggestions() {
      if (!query.trim() || query.length < 2) {
        setSuggestions([]);
        return;
      }
      const data = await goalmillsApi.searchSuggest(query);
      setSuggestions(data || []);
    }

    const timer = setTimeout(loadSuggestions, 150);
    return () => clearTimeout(timer);
  }, [query]);

  // Execute full search
  const performSearch = async (searchTerm: string = query, selectedSport: string = sport) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setTotal(0);
      return;
    }

    try {
      setLoading(true);
      setSuggestions([]);
      const res = await goalmillsApi.search({
        query: searchTerm.trim(),
        sport: selectedSport !== 'all' ? selectedSport : undefined,
        limit: 20,
      });

      if (res && res.results) {
        setResults(res.results);
        setTotal(res.total || res.results.length);
      }
    } catch (err) {
      console.warn('Search execution failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (sug: any) => {
    setQuery(sug.title);
    performSearch(sug.title, sport);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Search Bar */}
      <View style={styles.searchHeader}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={18} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => performSearch(query, sport)}
            placeholder="Search teams, players, tournaments..."
            placeholderTextColor="#64748B"
            returnKeyType="search"
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setQuery('');
                setResults([]);
                setSuggestions([]);
              }}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => performSearch(query, sport)}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Sport Category Filter Chips */}
      <View style={styles.filterRow}>
        {[
          { id: 'all', label: 'All' },
          { id: 'football', label: '⚽ Football' },
          { id: 'cricket', label: '🏏 Cricket' },
          { id: 'basketball', label: '🏀 Basketball' },
        ].map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.filterChip, sport === item.id && styles.filterChipActive]}
            onPress={() => {
              setSport(item.id);
              if (query.trim()) performSearch(query, item.id);
            }}
          >
            <Text
              style={[
                styles.filterChipText,
                sport === item.id && styles.filterChipTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Autocomplete Dropdown List */}
      {suggestions.length > 0 && results.length === 0 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionHeader}>Suggestions</Text>
          {suggestions.map((sug) => (
            <TouchableOpacity
              key={sug.id}
              style={styles.suggestionItem}
              onPress={() => handleSelectSuggestion(sug)}
            >
              <Ionicons
                name={sug.type === 'video' ? 'play-circle' : 'newspaper'}
                size={16}
                color="#F59E0B"
              />
              <View style={styles.suggestionContent}>
                <Text style={styles.suggestionTitle} numberOfLines={1}>
                  {sug.title}
                </Text>
                {sug.subtitle && (
                  <Text style={styles.suggestionSubtitle}>{sug.subtitle}</Text>
                )}
              </View>
              <Ionicons name="arrow-forward" size={14} color="#64748B" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Results List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F59E0B" />
          <Text style={styles.loadingText}>Searching GoalMills database...</Text>
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.entityType}_${item.id}`}
          contentContainerStyle={styles.resultsList}
          ListHeaderComponent={
            <Text style={styles.resultsHeader}>
              Found {total} results for &ldquo;{query}&rdquo;
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.resultCard}>
              {item.image && (
                <Image source={{ uri: item.image }} style={styles.resultImage} />
              )}
              <View style={styles.resultDetails}>
                <View style={styles.badgeRow}>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{item.entityType}</Text>
                  </View>
                  {item.sport && (
                    <Text style={styles.sportTag}>{item.sport}</Text>
                  )}
                </View>

                <Text style={styles.resultTitle} numberOfLines={2}>
                  {item.title}
                </Text>

                <Text style={styles.resultSnippet} numberOfLines={2}>
                  {item.snippet}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : query && !loading ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color="#475569" />
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptySubtitle}>
            Try searching for another team, tournament, or player name.
          </Text>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="compass-outline" size={48} color="#475569" />
          <Text style={styles.emptyTitle}>Discover Sports Intel</Text>
          <Text style={styles.emptySubtitle}>
            Search live scores, breaking transfer news, and video highlights across all sports.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 13,
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  searchButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    textTransform: 'uppercase',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#F59E0B',
  },
  filterChipText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#F59E0B',
    fontWeight: '700',
  },
  suggestionsContainer: {
    marginHorizontal: 16,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
  },
  suggestionHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    paddingHorizontal: 6,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    gap: 8,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  suggestionSubtitle: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  resultsList: {
    padding: 16,
    gap: 12,
  },
  resultsHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 8,
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    padding: 10,
    gap: 10,
  },
  resultImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#020617',
  },
  resultDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F59E0B',
    textTransform: 'uppercase',
  },
  sportTag: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  resultTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  resultSnippet: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default SearchScreen;
