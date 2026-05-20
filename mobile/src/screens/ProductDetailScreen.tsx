import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import { ChevronLeft, ShoppingCart, Star, Plus, Minus, Truck, ShieldCheck, Leaf } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }: any) {
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const addToCart = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('Please login to add to cart');
      navigation.navigate('Login');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('cart').insert({
      user_id: session.user.id,
      product_id: product.id,
      quantity: quantity
    });

    if (error) {
      // Try update if exists
      await supabase.from('cart').update({ quantity: quantity }).eq('user_id', session.user.id).eq('product_id', product.id);
    }
    
    alert('Added to cart!');
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Header */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image_url }} style={styles.image} />
          <SafeAreaView style={styles.headerActions}>
            <TouchableOpacity style={styles.circleBtn} onPress={() => navigation.goBack()}>
              <ChevronLeft size={24} color="#1a2e1a" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.circleBtn} onPress={() => navigation.navigate('Cart')}>
              <ShoppingCart size={24} color="#1a2e1a" />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        <View style={styles.content}>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryText}>{product.category}</Text>
            <View style={styles.ratingBox}>
              <Star size={14} color="#2e7d32" fill="#2e7d32" />
              <Text style={styles.ratingText}>4.8</Text>
            </View>
          </View>

          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.unit}>1 {product.unit}</Text>
          
          <Text style={styles.price}>₹{product.price}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Product Description</Text>
          <Text style={styles.description}>{product.description || 'Fresh and organic, sourced directly from our sustainable farms. Guaranteed quality and taste.'}</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Truck size={24} color="#2e7d32" />
              <Text style={styles.infoTitle}>Fast Delivery</Text>
              <Text style={styles.infoSub}>Within 24h</Text>
            </View>
            <View style={styles.infoCard}>
              <ShieldCheck size={24} color="#2e7d32" />
              <Text style={styles.infoTitle}>100% Pure</Text>
              <Text style={styles.infoSub}>Organic</Text>
            </View>
            <View style={styles.infoCard}>
              <Leaf size={24} color="#2e7d32" />
              <Text style={styles.infoTitle}>Farm Fresh</Text>
              <Text style={styles.infoSub}>Daily Stock</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <SafeAreaView style={styles.bottomBar}>
        <View style={styles.qtyContainer}>
          <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.qtyBtn}>
            <Minus size={20} color="#1a2e1a" />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{quantity}</Text>
          <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={styles.qtyBtn}>
            <Plus size={20} color="#1a2e1a" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.addBtn} onPress={addToCart} disabled={loading}>
          <Text style={styles.addBtnText}>Add to Cart • ₹{product.price * quantity}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  imageContainer: { width: width, height: width },
  image: { width: '100%', height: '100%' },
  headerActions: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
  circleBtn: { width: 45, height: 45, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 35, borderTopRightRadius: 35, marginTop: -30, padding: 30 },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  categoryText: { color: '#2e7d32', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#f1f8e9', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  ratingText: { fontWeight: 'bold', color: '#2e7d32', fontSize: 12 },
  name: { fontSize: 28, fontWeight: 'bold', color: '#1a2e1a', marginBottom: 5 },
  unit: { fontSize: 16, color: '#999', marginBottom: 15 },
  price: { fontSize: 32, fontWeight: '900', color: '#2e7d32', marginBottom: 20 },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a2e1a', marginBottom: 10 },
  description: { fontSize: 15, color: '#556b55', lineHeight: 22, marginBottom: 30 },
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  infoCard: { alignItems: 'center', backgroundColor: '#fdfdfb', borderWidth: 1, borderColor: '#f1f8e9', padding: 15, borderRadius: 20, width: (width - 90) / 3 },
  infoTitle: { fontSize: 10, fontWeight: 'bold', color: '#1a2e1a', marginTop: 10 },
  infoSub: { fontSize: 8, color: '#999' },
  bottomBar: { flexDirection: 'row', padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0', alignItems: 'center', gap: 15 },
  qtyContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f8e9', borderRadius: 15, padding: 5 },
  qtyBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  qtyText: { fontSize: 18, fontWeight: 'bold', width: 30, textAlign: 'center' },
  addBtn: { flex: 1, backgroundColor: '#2e7d32', height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
