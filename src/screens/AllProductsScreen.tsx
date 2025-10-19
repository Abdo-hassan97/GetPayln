import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import {
  getAllProducts,
  getProductsByCategory,
  getCategories,
  deleteProduct as deleteApiProduct,
} from '../services/products';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const filterIcon = require('../assets/images/filter.png');
const deleteIcon = require('../assets/images/delete.png'); // 🗑️ أيقونة الحذف

const numColumns = 3;
const screenWidth = Dimensions.get('window').width;
const itemMargin = 10;
const itemWidth = (screenWidth - itemMargin * (numColumns + 1)) / numColumns;

const AllProductsScreen = () => {
  const isSuperadmin = useSelector((state: RootState) => state.session.isSuperadmin);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const {
    data: products,
    isLoading: isLoadingProducts,
    refetch,
  } = useQuery({
    queryKey: ['products', selectedCategory],
    queryFn: () =>
      selectedCategory ? getProductsByCategory(selectedCategory) : getAllProducts(),
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const deleteProduct = async (id: number) => {
    try {
      await deleteApiProduct(id);
      Alert.alert('Deleted', `Product ${id} deleted`);
      refetch();
    } catch {
      Alert.alert('Error', 'Failed to delete product');
    }
  };

  const handleCategorySelect = (slug: string | null) => {
    setSelectedCategory(slug);
    setModalVisible(false);
  };

  const formatData = (data: any[], numColumns: number) => {
    const numberOfFullRows = Math.floor(data.length / numColumns);
    let numberOfElementsLastRow = data.length - numberOfFullRows * numColumns;

    while (
      numberOfElementsLastRow !== numColumns &&
      numberOfElementsLastRow !== 0
    ) {
      data.push({ id: `blank-${numberOfElementsLastRow}`, empty: true });
      numberOfElementsLastRow++;
    }
    return data;
  };

  const renderProduct = ({ item }: any) => {
    if (item.empty) {
      return <View style={[styles.item, styles.invisibleItem]} />;
    }

    return (
      <View style={styles.item}>
        {/* 🗑️ زر الحذف في الأعلى يمين الصورة */}
        {isSuperadmin && (
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => deleteProduct(item.id)}
          >
            <Image source={deleteIcon} style={styles.deleteIcon} />
          </TouchableOpacity>
        )}

        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.category} numberOfLines={1}>{item.category}</Text>
      </View>
    );
  };

  const renderCategory = ({ item }: any) => {
    const slug = typeof item === 'string' ? item : item.slug || item.name;
    const name = typeof item === 'string' ? item : item.name || item.slug;

    return (
      <TouchableOpacity
        style={[
          styles.categoryItem,
          slug === selectedCategory && styles.selectedCategoryItem,
        ]}
        onPress={() => handleCategorySelect(slug)}
      >
        <Text
          style={[
            styles.categoryText,
            slug === selectedCategory && styles.selectedCategoryText,
          ]}
        >
          {name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Remove Header */}

      {/* Floating Filter Icon */}
      <View style={{ flex: 1 }}>
        {selectedCategory && (
          <Text style={styles.selectedCategory}>Category: {selectedCategory}</Text>
        )}

        {isLoadingProducts ? (
          <ActivityIndicator size="large" style={{ flex: 1 }} />
        ) : (
          <FlatList
            data={formatData(products || [], numColumns)}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderProduct}
            numColumns={numColumns}
            contentContainerStyle={styles.productsList}
          />
        )}

        {/* Floating Filter Button */}
        <TouchableOpacity
          style={styles.floatingFilterBtn}
          onPress={() => setModalVisible(true)}
        >
          <Image source={filterIcon} style={styles.floatingFilterIcon} />
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            {isLoadingCategories ? (
              <ActivityIndicator size="large" />
            ) : (
              <FlatList
                data={['All', ...(categories || [])]}
                keyExtractor={(item, index) =>
                  typeof item === 'string'
                    ? item + index
                    : item.slug || item.name || index.toString()
                }
                renderItem={({ item }) => {
                  if (item === 'All') {
                    return (
                      <TouchableOpacity
                        style={[
                          styles.categoryItem,
                          selectedCategory === null && styles.selectedCategoryItem,
                        ]}
                        onPress={() => handleCategorySelect(null)}
                      >
                        <Text
                          style={[
                            styles.categoryText,
                            selectedCategory === null && styles.selectedCategoryText,
                          ]}
                        >
                          All
                        </Text>
                      </TouchableOpacity>
                    );
                  }
                  return renderCategory({ item });
                }}
              />
            )}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  selectedCategory: {
    fontSize: 16,
    color: '#555',
    paddingHorizontal: 15,
    marginBottom: 5,
  },
  productsList: {
    padding: itemMargin / 2,
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
  invisibleItem: {
    backgroundColor: 'transparent',
    elevation: 0,
    borderWidth: 0,
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

  // 🗑️ Delete icon style
  deleteBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 5,
    borderRadius: 50,
    zIndex: 1,
  },
  deleteIcon: {
    width: 16,
    height: 16,
    tintColor: '#fff',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  categoryItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  selectedCategoryItem: {
    backgroundColor: '#33333336',
  },
  categoryText: { fontSize: 16, color: '#333' },
  selectedCategoryText: { color: '#000000ff', fontWeight: 'bold' },
  closeBtn: {
    marginTop: 10,
    backgroundColor: '#000000ff',
    padding: 10,
    borderRadius: 8,
  },
  closeText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },

  // Floating filter button styles
  floatingFilterBtn: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#fff',
    borderRadius: 30,
    elevation: 5,
    padding: 12,
    zIndex: 10,
  },
  floatingFilterIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
    tintColor: '#333',
  },
});

export default AllProductsScreen;
