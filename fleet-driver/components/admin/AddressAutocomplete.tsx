import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Search, MapPin, X } from 'lucide-react-native';
import axios from 'axios';

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;

interface AddressAutocompleteProps {
  value: string;
  placeholder: string;
  onSelect: (address: string, coordinates: [number, number]) => void;
  error?: string;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  placeholder,
  onSelect,
  error,
}) => {
  const [input, setInput] = useState(value);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    setInput(value);
  }, [value]);

  const fetchSuggestions = async (text: string) => {
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          text
        )}.json`,
        {
          params: {
            access_token: MAPBOX_TOKEN,
            autocomplete: true,
            limit: 5,
          },
        }
      );
      setSuggestions(response.data.features || []);
    } catch (error) {
      console.error('Mapbox search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Simple debounce logic
  const debounce = (func: Function, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedFetch = useCallback(debounce(fetchSuggestions, 500), []);

  const handleChangeText = (text: string) => {
    setInput(text);
    if (text.length >= 3) {
      setShowSuggestions(true);
      debouncedFetch(text);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleSelect = (item: any) => {
    const address = item.place_name;
    const coords = item.center; // [lng, lat]
    setInput(address);
    setSuggestions([]);
    setShowSuggestions(false);
    onSelect(address, coords);
  };

  const clearInput = () => {
    setInput('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <Search size={18} color="#64748b" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          value={input}
          placeholder={placeholder}
          placeholderTextColor="#64748b"
          onChangeText={handleChangeText}
          onFocus={() => input.length >= 3 && setShowSuggestions(true)}
        />
        {loading ? (
          <ActivityIndicator size="small" color="#6366f1" style={styles.rightIcon} />
        ) : input.length > 0 ? (
          <TouchableOpacity onPress={clearInput} style={styles.rightIcon}>
            <X size={18} color="#64748b" />
          </TouchableOpacity>
        ) : null}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <ScrollView
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
          >
            {suggestions.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.suggestionItem}
                onPress={() => handleSelect(item)}
              >
                <MapPin size={16} color="#6366f1" style={styles.suggestionIcon} />
                <View style={styles.suggestionTextContainer}>
                  <Text style={styles.suggestionTitle} numberOfLines={1}>
                    {item.text}
                  </Text>
                  <Text style={styles.suggestionSubtitle} numberOfLines={1}>
                    {item.place_name.replace(`${item.text}, `, '')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 10,
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 16,
    height: '100%',
  },
  rightIcon: {
    padding: 4,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    maxHeight: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 100,
  },
  suggestionsList: {
    borderRadius: 16,
  },
  suggestionItem: {
    flexDirection: 'row',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '600',
  },
  suggestionSubtitle: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    marginLeft: 4,
  },
});
