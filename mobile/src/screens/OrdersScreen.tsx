import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { ChevronLeft, Package, Clock, CheckCircle2, Truck } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

export default function OrdersScreen({ navigation }: any) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (data) setOrders(data);
    setLoading(false);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return '#4caf50';
      case 'shipped': return '#2196f3';
      case 'processing': return '#ff9800';
      default: return '#999';
    }
  };

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
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 44 }} />
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Package size={80} color="#e0e0e0" />
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.shopBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.orderCard}
              onPress={() => navigation.navigate('OrderDetail', { order: item })}
            >
              <View style={styles.orderHeader}>
                <View style={styles.idBox}>
                  <Package size={16} color="#2e7d32" />
                  <Text style={styles.orderId}>#{item.id.slice(0, 8)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                </View>
              </View>

              <View style={styles.itemsList}>
                {item.order_items.map((oi: any, idx: number) => (
                  <Text key={idx} style={styles.itemText} numberOfLines={1}>
                    • {oi.products.name} ({oi.quantity}x)
                  </Text>
                ))}
              </View>

              <View style={styles.orderFooter}>
                <View>
                  <Text style={styles.dateLabel}>Amount Paid</Text>
                  <Text style={styles.totalAmount}>₹{item.total_amount}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.trackBtn} 
                  onPress={() => navigation.navigate('OrderDetail', { order: item })}
                >
                  <Text style={styles.trackBtnText}>Track</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
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
  orderCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#eee' },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  idBox: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  orderId: { fontSize: 14, fontWeight: 'bold', color: '#1a2e1a' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  itemsList: { marginBottom: 15, paddingLeft: 5 },
  itemText: { fontSize: 13, color: '#556b55', marginBottom: 2 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 15, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  dateLabel: { fontSize: 10, color: '#999', marginBottom: 2 },
  totalAmount: { fontSize: 18, fontWeight: 'bold', color: '#2e7d32' },
  trackBtn: { backgroundColor: '#f1f8e9', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  trackBtnText: { color: '#2e7d32', fontWeight: 'bold', fontSize: 12 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#ccc', marginTop: 20, marginBottom: 30 },
  shopBtn: { backgroundColor: '#2e7d32', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 15 },
  shopBtnText: { color: '#fff', fontWeight: 'bold' },
});
