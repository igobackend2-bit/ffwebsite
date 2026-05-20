import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, Dimensions } from 'react-native';
import { Leaf, ShoppingCart, User, Search, Sparkles, Package } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').limit(6);
    if (data) setProducts(data);
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIconContainer}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={styles.logoImage}
            />
          </View>
          <Text style={styles.logoText}>FARMERS FACTORY</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
            <Package size={24} color="#2e7d32" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
            <ShoppingCart size={24} color="#2e7d32" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Login')}>
            <User size={20} color="#2e7d32" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#999" />
            <Text style={styles.searchText}>Search fresh products...</Text>
          </View>
        </View>

        {/* Hero Banner */}
        <View style={styles.heroContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef' }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroBadge}>100% Organic</Text>
            <Text style={styles.heroTitle}>Fresh Farm Goods</Text>
            <Text style={styles.heroSubtitle}>Delivered in 24 Hours</Text>
            <TouchableOpacity style={styles.heroBtn}>
              <Text style={styles.heroBtnText}>Shop Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
          {['Fruits', 'Vegetables', 'Valluvam'].map((cat, i) => (
            <TouchableOpacity key={i} style={styles.categoryCard}>
              <View style={[styles.categoryIcon, { backgroundColor: i === 0 ? '#fff3e0' : i === 1 ? '#e8f5e9' : '#e0f2f1' }]}>
                <Sparkles size={24} color={i === 0 ? '#ffb74d' : i === 1 ? '#2e7d32' : '#00796b'} />
              </View>
              <Text style={styles.categoryName}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Products */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Best Sellers</Text>
        </View>

        <View style={styles.productGrid}>
          {products.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.productCard}
              onPress={() => navigation.navigate('ProductDetail', { product: item })}
            >
              <Image source={{ uri: item.image_url }} style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productUnit}>1 {item.unit}</Text>
                <View style={styles.productFooter}>
                  <Text style={styles.productPrice}>₹{item.price}</Text>
                  <TouchableOpacity style={styles.addBtn}>
                    <Text style={styles.addBtnText}>ADD</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfdfb' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIconContainer: { width: 36, height: 36, borderRadius: 10, overflow: 'hidden', backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
  logoImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  logoText: { fontSize: 18, fontWeight: 'bold', color: '#1a2e1a' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  profileBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' },
  searchContainer: { paddingHorizontal: 20, marginBottom: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f1f8e9', padding: 12, borderRadius: 15 },
  searchText: { color: '#999', fontSize: 14 },
  heroContainer: { marginHorizontal: 20, height: 180, borderRadius: 25, overflow: 'hidden', marginBottom: 30 },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)', padding: 20, justifyContent: 'center' },
  heroBadge: { backgroundColor: '#ffb74d', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, fontSize: 10, fontWeight: 'bold', color: '#5d4037', marginBottom: 8 },
  heroTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  heroSubtitle: { fontSize: 14, color: '#eee', marginBottom: 15 },
  heroBtn: { backgroundColor: '#fff', alignSelf: 'flex-start', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  heroBtnText: { color: '#2e7d32', fontWeight: 'bold', fontSize: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a2e1a' },
  seeAll: { color: '#2e7d32', fontWeight: 'bold' },
  categoryList: { paddingLeft: 20, paddingBottom: 10 },
  categoryCard: { alignItems: 'center', marginRight: 20 },
  categoryIcon: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  categoryName: { fontSize: 12, fontWeight: '600', color: '#556b55' },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 15 },
  productCard: { width: (width - 50) / 2, marginHorizontal: 5, marginBottom: 20, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#eee', overflow: 'hidden' },
  productImage: { width: '100%', height: 120 },
  productInfo: { padding: 12 },
  productName: { fontSize: 14, fontWeight: 'bold', color: '#1a2e1a', marginBottom: 4 },
  productUnit: { fontSize: 11, color: '#999', marginBottom: 10 },
  productFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { fontSize: 16, fontWeight: 'bold', color: '#2e7d32' },
  addBtn: { backgroundColor: '#2e7d32', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addBtnText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
});
