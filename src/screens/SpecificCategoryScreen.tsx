import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Dimensions ,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getProductsByCategory } from '../services/products';

type Props = {
  route: { params: { category: string } };
};

const SpecificCategoryScreen = ({ route }: Props) => {
  const { category } = route.params;

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['categoryProducts', category],
    queryFn: () => getProductsByCategory(category),
  });

  const renderItem = ({ item }: any) => (
    <View style={styles.item}>
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.category} numberOfLines={1}>{item.category}</Text>
    </View>
  );

  if (isLoading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.categoryTitle}>{category}</Text>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        numColumns={3}
        contentContainerStyle={styles.productsList}
      />
    </View>
  );
};

const itemMargin = 10;
const screenWidth =  Dimensions.get('window').width;
const numColumns = 2;
const itemWidth = (screenWidth - itemMargin * (numColumns + 1)) / numColumns;

const styles = StyleSheet.create({
  productsList: { padding: itemMargin / 2 },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  item: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 140,
    width: itemWidth,
    margin: itemMargin / 2,
    borderRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: 90,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  category: {
    fontSize: 11,
    color: '#777',
    textAlign: 'center',
  },
});

export default SpecificCategoryScreen;
