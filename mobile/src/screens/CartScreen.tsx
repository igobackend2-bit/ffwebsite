import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { ChevronLeft, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

export default function CartScreen({ navigation }: any) {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  async function fetchCart() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('cart')
      .select('*, products(*)')
      .eq('user_id', session.user.id);

    if (data) setCartItems(data);
    setLoading(false);
  }

  const updateQuantity = async (id: string, newQty: number) => {
    if (newQty < 1) return;
    const { error } = await supabase.from('cart').update({ quantity: newQty }).eq('id', id);
    if (!error) {
      setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: newQty } : item));
    }
  };

  const removeItem = async (id: string) => {
    const { error } = await supabase.from('cart').delete().eq('id', id);
    if (!error) {
      setCartItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.products.price * item.quantity), 0);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#1a2e1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        <View style={{ width: 44 }} />
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ShoppingBag size={80} color="#e0e0e0" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.shopBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.cartCard}>
                <Image source={{ uri: item.products.image_url }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>{item.products.name}</Text>
                    <TouchableOpacity onPress={() => removeItem(item.id)}>
                      <Trash2 size={18} color="#ff5252" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.itemUnit}>1 {item.products.unit}</Text>
                  <View style={styles.itemFooter}>
                    <Text style={styles.itemPrice}>₹{item.products.price * item.quantity}</Text>
                    <View style={styles.qtyBox}>
                      <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity - 1)} style={styles.qtyBtn}>
                        <Minus size={16} color="#1a2e1a" />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{item.quantity}</Text>
                      <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)} style={styles.qtyBtn}>
                        <Plus size={16} color="#1a2e1a" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            )}
          />

          <View style={styles.footer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{subtotal}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery</Text>
              <Text style={[styles.summaryValue, { color: '#2e7d32' }]}>FREE</Text>
            </View>
            <View style={[styles.summaryRow, { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0' }]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{subtotal}</Text>
            </View>

            <TouchableOpacity style={styles.checkoutBtn}>
              <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
              <ArrowRight size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfdfb' },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 },
  backBtn: { padding: 10 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a2e1a' },
  list: { padding: 20 },
  cartCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#eee' },
  itemImage: { width: 80, height: 80, borderRadius: 15 },
  itemInfo: { flex: 1, marginLeft: 15 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#1a2e1a' },
  itemUnit: { fontSize: 12, color: '#999', marginBottom: 10 },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemPrice: { fontSize: 18, fontWeight: 'bold', color: '#2e7d32' },
  qtyBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f8e9', borderRadius: 10, padding: 5 },
  qtyBtn: { padding: 5 },
  qtyText: { fontSize: 14, fontWeight: 'bold', width: 25, textAlign: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#ccc', marginTop: 20, marginBottom: 30 },
  shopBtn: { backgroundColor: '#2e7d32', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 15 },
  shopBtnText: { color: '#fff', fontWeight: 'bold' },
  footer: { backgroundColor: '#fff', padding: 25, borderTopLeftRadius: 30, borderTopRightRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { color: '#556b55', fontSize: 14 },
  summaryValue: { fontWeight: 'bold', color: '#1a2e1a', fontSize: 14 },
  totalLabel: { fontSize: 18, fontWeight: 'bold', color: '#1a2e1a' },
  totalValue: { fontSize: 22, fontWeight: '900', color: '#2e7d32' },
  checkoutBtn: { backgroundColor: '#2e7d32', height: 60, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 20 },
  checkoutBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
