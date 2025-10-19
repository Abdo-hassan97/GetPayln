import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';

const fetchCategories = async () => {
  const res = await fetch('https://dummyjson.com/products/categories');
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
};

const AllCategoriesScreen = () => {
  const navigation = useNavigation();

  const { data: categories, isLoading, isError } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const handleSelectCategory = (slug: string) => {
    navigation.navigate('SpecificCategory', { category: slug } as never);
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 10 }}>Loading categories...</Text>
      </View>
    );
  }

  if (isError || !categories) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>Failed to load categories</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item, index) => typeof item === 'string' ? item : item.slug || index.toString()}
        renderItem={({ item }) => {
          const name = typeof item === 'string' ? item : item.name || item.slug;
          const slug = typeof item === 'string' ? item : item.slug || item.name;

          return (
            <TouchableOpacity
              style={styles.categoryItem}
              onPress={() => handleSelectCategory(slug)}
            >
              <Text style={styles.categoryText}>{name}</Text>
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  categoryItem: {
    paddingVertical: 15,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  categoryText: { fontSize: 16, color: '#333', fontWeight: '500' },
  separator: { height: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default AllCategoriesScreen;
