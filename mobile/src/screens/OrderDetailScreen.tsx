'use client';

import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  SafeAreaView, Image, Dimensions, Animated, Platform,
  Linking, Share
} from 'react-native';
import { 
  ChevronLeft, Package, MapPin, CreditCard, Clock, 
  CheckCircle2, Truck, ShoppingBag, Star, ChevronRight,
  Phone, MessageSquare, Download, Share2, Info, AlertCircle,
  RotateCcw, Map as MapIcon, Leaf, ShieldCheck, HelpCircle
} from 'lucide-react-native';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');

const STATUS_STEPS = [
  { key: 'pending',    label: 'Placed',       icon: ShoppingBag },
  { key: 'confirmed', label: 'Confirmed',    icon: CheckCircle2 },
  { key: 'processing',label: 'Prepared',     icon: Package },
  { key: 'shipped',   label: 'Out',          icon: Truck },
  { key: 'delivered', label: 'Delivered',    icon: CheckCircle2 },
];

const STATUS_ORDER = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderDetailScreen({ route, navigation }: any) {
  const { order } = route.params;
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollY = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    const { data } = await supabase
      .from('order_items')
      .select('*, products(*)')
      .eq('order_id', order.id);
    if (data) setItems(data);
    setLoading(false);
  }

  const currentStep = STATUS_ORDER.indexOf(order.status.toLowerCase());
  const headerHeight = 220;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, headerHeight - 100],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });

  const bannerTranslate = scrollY.interpolate({
    inputRange: [-headerHeight, 0, headerHeight],
    outputRange: [headerHeight / 2, 0, -headerHeight / 1.5],
    extrapolate: 'clamp'
  });

  const onShare = async () => {
    try {
      await Share.share({
        message: `Check out my order FF-${order.id.slice(0, 8).toUpperCase()} from Farmers Factory!`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Dynamic Header */}
      <Animated.View style={[styles.navHeader, { opacity: headerOpacity }]}>
        <Text style={styles.navTitle}>FF-{order.id.slice(0, 8).toUpperCase()}</Text>
      </Animated.View>

      <TouchableOpacity 
        style={styles.backBtn} 
        onPress={() => navigation.goBack()}
      >
        <ChevronLeft size={24} color="#fff" />
      </TouchableOpacity>

      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Section */}
        <Animated.View style={[styles.banner, { transform: [{ translateY: bannerTranslate }] }]}>
          <View style={styles.bannerContent}>
            <View style={styles.statusRow}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
              </View>
              <Text style={styles.orderDate}>{new Date(order.created_at).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.orderId}>Order #FF-{order.id.slice(0, 8).toUpperCase()}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total Paid</Text>
              <Text style={styles.totalValue}>₹{order.total_amount}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Content Body */}
        <View style={styles.body}>
          {/* Tracking Timeline */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Truck size={20} color="#2e7d32" />
              <Text style={styles.cardTitle}>Delivery Progress</Text>
            </View>
            <View style={styles.timeline}>
              <View style={styles.timelineTrack} />
              <View 
                style={[
                  styles.timelineProgress, 
                  { height: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }
                ]} 
              />
              {STATUS_STEPS.map((step, idx) => {
                const isCompleted = idx <= currentStep;
                const isCurrent = idx === currentStep;
                return (
                  <View key={step.key} style={styles.timelineStep}>
                    <View style={[
                      styles.dot, 
                      isCompleted ? styles.dotCompleted : styles.dotPending,
                      isCurrent && styles.dotCurrent
                    ]}>
                      {isCompleted ? <CheckCircle2 size={12} color="#fff" /> : null}
                    </View>
                    <View style={styles.stepInfo}>
                      <Text style={[
                        styles.stepLabel, 
                        isCompleted ? styles.textBlack : styles.textGrey
                      ]}>{step.label}</Text>
                      {isCurrent && <Text style={styles.currentStatus}>Live</Text>}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Delivery Partner */}
            <View style={styles.driverCard}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d' }} 
                style={styles.driverAvatar} 
              />
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>Arjun Kumar</Text>
                <Text style={styles.driverSub}>Farmer Partner • 4.9 ★</Text>
              </View>
              <View style={styles.driverActions}>
                <TouchableOpacity style={styles.actionCircle}>
                  <MessageSquare size={18} color="#2e7d32" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionCircle, styles.actionGreen]}>
                  <Phone size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Items List */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Package size={20} color="#2e7d32" />
              <Text style={styles.cardTitle}>Order Items</Text>
              <Text style={styles.itemCount}>{items.length}</Text>
            </View>
            {items.map((item, idx) => (
              <View key={item.id} style={[styles.itemRow, idx === items.length - 1 && styles.lastItem]}>
                <Image source={{ uri: item.products.image_url }} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.products.name}</Text>
                  <Text style={styles.itemSub}>{item.quantity} x {item.products.unit || 'kg'}</Text>
                </View>
                <Text style={styles.itemPrice}>₹{item.price_at_purchase * item.quantity}</Text>
              </View>
            ))}
            <View style={styles.priceBreakdown}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Subtotal</Text>
                <Text style={styles.breakdownValue}>₹{order.total_amount}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Delivery</Text>
                <Text style={styles.freeText}>FREE</Text>
              </View>
              <View style={[styles.breakdownRow, styles.totalRow]}>
                <Text style={styles.totalText}>Grand Total</Text>
                <Text style={styles.totalAmount}>₹{order.total_amount}</Text>
              </View>
            </View>
          </View>

          {/* Logistics & Payment */}
          <View style={styles.infoRow}>
            <View style={[styles.card, { flex: 1, marginRight: 10 }]}>
              <MapPin size={20} color="#2e7d32" style={{ marginBottom: 10 }} />
              <Text style={styles.infoTitle}>Delivery Address</Text>
              <Text style={styles.infoValue} numberOfLines={3}>{order.delivery_address}</Text>
            </View>
            <View style={[styles.card, { flex: 1 }]}>
              <CreditCard size={20} color="#2e7d32" style={{ marginBottom: 10 }} />
              <Text style={styles.infoTitle}>Payment</Text>
              <Text style={styles.infoValue}>{order.payment_method}</Text>
              <View style={styles.paidBadge}>
                <Text style={styles.paidText}>PAID</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.gridAction}>
              <RotateCcw size={20} color="#2e7d32" />
              <Text style={styles.actionLabel}>Reorder</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gridAction} onPress={onShare}>
              <Share2 size={20} color="#2e7d32" />
              <Text style={styles.actionLabel}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gridAction}>
              <Download size={20} color="#2e7d32" />
              <Text style={styles.actionLabel}>Invoice</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gridAction}>
              <HelpCircle size={20} color="#2e7d32" />
              <Text style={styles.actionLabel}>Help</Text>
            </TouchableOpacity>
          </View>

          {/* Satisfaction Guarantee */}
          <View style={styles.guaranteeCard}>
            <ShieldCheck size={32} color="#2e7d32" />
            <View style={styles.guaranteeInfo}>
              <Text style={styles.guaranteeTitle}>Farmers Factory Trust</Text>
              <Text style={styles.guaranteeSub}>100% Organic • Direct Farm Sourced • Quality Checked</Text>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfdfb' },
  navHeader: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 90,
    backgroundColor: '#111', justifyContent: 'center', alignItems: 'center',
    paddingTop: 40, zIndex: 100
  },
  navTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  backBtn: {
    position: 'absolute', top: 50, left: 20, width: 44, height: 44,
    borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center', alignItems: 'center', zIndex: 110
  },
  scrollContent: { paddingTop: 0 },
  banner: { height: 280, backgroundColor: '#111', padding: 30, paddingTop: 100 },
  bannerContent: { flex: 1 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  statusBadge: { backgroundColor: '#2e7d32', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  orderDate: { color: 'rgba(255,255,255,0.4)', marginLeft: 15, fontSize: 12, fontWeight: 'bold' },
  orderId: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 'bold' },
  totalValue: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  body: { paddingHorizontal: 20, marginTop: -40 },
  card: { backgroundColor: '#fff', borderRadius: 25, padding: 20, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#111', textTransform: 'uppercase', letterSpacing: 1 },
  timeline: { paddingLeft: 10, marginVertical: 10 },
  timelineTrack: { position: 'absolute', left: 4, top: 10, bottom: 10, width: 2, backgroundColor: '#f0f0f0' },
  timelineProgress: { position: 'absolute', left: 4, top: 10, width: 2, backgroundColor: '#2e7d32' },
  timelineStep: { flexDirection: 'row', alignItems: 'center', marginBottom: 25, height: 20 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 20, zIndex: 10 },
  dotCompleted: { backgroundColor: '#2e7d32' },
  dotPending: { backgroundColor: '#f0f0f0' },
  dotCurrent: { borderWidth: 4, borderColor: '#e8f5e9' },
  stepInfo: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepLabel: { fontSize: 14, fontWeight: 'bold' },
  currentStatus: { fontSize: 10, fontWeight: 'bold', color: '#2e7d32', backgroundColor: '#e8f5e9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  textBlack: { color: '#111' },
  textGrey: { color: '#ccc' },
  driverCard: { flexDirection: 'row', alignItems: 'center', marginTop: 10, backgroundColor: '#f9f9f9', padding: 15, borderRadius: 20 },
  driverAvatar: { width: 50, height: 50, borderRadius: 15 },
  driverInfo: { flex: 1, marginLeft: 15 },
  driverName: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  driverSub: { fontSize: 12, color: '#999' },
  driverActions: { flexDirection: 'row', gap: 10 },
  actionCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  actionGreen: { backgroundColor: '#2e7d32', borderColor: '#2e7d32' },
  itemCount: { marginLeft: 'auto', fontSize: 12, fontWeight: 'bold', color: '#2e7d32', backgroundColor: '#e8f5e9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  lastItem: { borderBottomWidth: 0 },
  itemImage: { width: 60, height: 60, borderRadius: 15, backgroundColor: '#f5f5f5' },
  itemDetails: { flex: 1, marginLeft: 15 },
  itemName: { fontSize: 15, fontWeight: 'bold', color: '#111' },
  itemSub: { fontSize: 12, color: '#999', marginTop: 4 },
  itemPrice: { fontSize: 16, fontWeight: 'bold', color: '#2e7d32' },
  priceBreakdown: { marginTop: 20, padding: 15, backgroundColor: '#fdfdfb', borderRadius: 20 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  breakdownLabel: { color: '#999', fontSize: 13, fontWeight: 'bold' },
  breakdownValue: { color: '#111', fontSize: 13, fontWeight: 'bold' },
  freeText: { color: '#2e7d32', fontSize: 13, fontWeight: 'bold' },
  totalRow: { marginTop: 10, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#eee' },
  totalText: { color: '#111', fontSize: 16, fontWeight: 'bold' },
  totalAmount: { color: '#2e7d32', fontSize: 20, fontWeight: 'bold' },
  infoRow: { flexDirection: 'row', marginBottom: 15 },
  infoTitle: { fontSize: 10, fontWeight: 'bold', color: '#999', textTransform: 'uppercase', marginBottom: 5 },
  infoValue: { fontSize: 13, fontWeight: 'bold', color: '#111' },
  paidBadge: { alignSelf: 'flex-start', marginTop: 10, backgroundColor: '#e8f5e9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 },
  paidText: { fontSize: 9, fontWeight: 'bold', color: '#2e7d32' },
  actionGrid: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  gridAction: { flex: 1, backgroundColor: '#fff', borderRadius: 20, padding: 15, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  actionLabel: { fontSize: 10, fontWeight: 'bold', color: '#111', marginTop: 8, textTransform: 'uppercase' },
  guaranteeCard: { backgroundColor: '#e8f5e9', borderRadius: 25, padding: 25, flexDirection: 'row', alignItems: 'center' },
  guaranteeInfo: { flex: 1, marginLeft: 20 },
  guaranteeTitle: { fontSize: 16, fontWeight: 'bold', color: '#2e7d32', marginBottom: 4 },
  guaranteeSub: { fontSize: 10, color: '#558b2f', lineHeight: 14 }
});
