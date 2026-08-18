import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, StyleSheet, Switch, Image } from 'react-native';
import { type ListingCategory, type Order, type OrderStatus, ORDER_STATUS } from '@arli/contracts';
import { getMerchantDictionary, type Lang, type MerchantDictionary } from '@arli/i18n';
import { api } from '../api';
import { MobileBottomNav } from '../components/MobileBottomNav';
import type { Message } from '../types';
import { theme as Theme } from '@arli/tokens';

interface BizDashboardProps {
  t: any;
  lang: 'en' | 'hi';
  isRegistered: boolean;
  onRegister: (shopName: string, pin: string) => void;
}

interface BizListing {
  id: number;
  name: { en: string; hi: string };
  price: number;
  cat: string;
  pincode: string;
  views?: number;
  stock?: string;
  base?: string;
  acc?: string;
}

interface LocalDesign {
  name: { en: string; hi: string };
  base: string;
  acc: string;
}

interface DesignRequest {
  cust: { en: string; hi: string };
  note: { en: string; hi: string };
  accepted: boolean;
  base: string;
}



export const BizDashboard: React.FC<BizDashboardProps> = ({
  lang,
  isRegistered,
  onRegister,
}) => {
  const currentT: MerchantDictionary = getMerchantDictionary(lang);

  // Local Onboarding Screens State
  const [localScreen, setLocalScreen] = useState<'onb' | 'submitted'>('onb');
  const [step, setStep] = useState(1);
  const [bizType, setBizType] = useState<string | null>(null);

  // Shop Details
  const [shopName, setShopName] = useState('');
  const [shopDesc, setShopDesc] = useState('');
  const [shopAddr, setShopAddr] = useState('');
  const [shopPin, setShopPin] = useState('');

  // Gov Info
  const [gstin, setGstin] = useState('');
  const [noGst, setNoGst] = useState(false);
  const [pan, setPan] = useState('');
  const [bizStruct, setBizStruct] = useState('prop');
  const [udyam, setUdyam] = useState('');

  // Bank Info
  const [acctName, setAcctName] = useState('');
  const [acctNum, setAcctNum] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [upi, setUpi] = useState('');

  const [declare, setDeclare] = useState(false);

  // Dashboard Navigation state
  const [activeTab, setActiveTab] = useState<'home' | 'orders' | 'listings' | 'chats' | 'more' | 'designs' | 'ads' | 'stats' | 'compliance'>('home');
  const [listings, setListings] = useState<BizListing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Forms and Modals
  const [newLName, setNewLName] = useState('');
  const [newLPrice, setNewLPrice] = useState('');
  const [newLCat, setNewLCat] = useState<ListingCategory>('fabric');

  const [chats, setChats] = useState<Message[]>([
    { align: 'flex-start', bg: '#fff', fg: Theme.textPrimary, text: 'Hi tailor! Can I get the status of Varanasi Kurta?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Local designs
  const [bizDesigns, setBizDesigns] = useState<LocalDesign[]>([
    { name: { en: 'Anarkali suit', hi: 'अनारकली सूट' }, base: '#7A2E4D', acc: '#935071' },
    { name: { en: 'Sherwani', hi: 'शेरवानी' }, base: '#2A3B66', acc: '#3A4E82' },
    { name: { en: 'Lehenga', hi: 'लहंगा' }, base: '#B0473A', acc: '#C0574A' },
  ]);
  const [newDesignName, setNewDesignName] = useState('');

  const [designRequests, setDesignRequests] = useState<DesignRequest[]>([
    { cust: { en: 'Priya S.', hi: 'प्रिया S.' }, note: { en: 'Kurta like the attached photo, chest 38"', hi: 'भेजी गई फोटो जैसा कुर्ता, छाती 38"' }, accepted: false, base: '#9D9077' }
  ]);

  // Ads Campaign Budget
  const [adBudget, setAdBudget] = useState(200);
  const [adActive, setAdActive] = useState(false);

  // Invoicing overlay
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [invoiceType, setInvoiceType] = useState<'invoice' | 'slip'>('invoice');

  const fallbackOrders: Order[] = [
    { id: 'ARL-2412', cust: { en: 'Priya S.', hi: 'प्रिया S.' }, item: { en: 'Custom Kurta Stitching', hi: 'कस्टम कुर्ता सिलाई' }, qty: 1, amt: 1200, meas: true, status: 0 },
    { id: 'ARL-2409', cust: { en: 'Sneha D.', hi: 'स्नेहा D.' }, item: { en: 'Anarkali suit (custom)', hi: 'अनारकली सूट (कस्टम)' }, qty: 1, amt: 2400, meas: true, status: 1 },
  ];

  useEffect(() => {
    if (isRegistered) {
      loadListings();
      loadOrders();
    }
  }, [isRegistered]);

  const loadListings = () => {
    api.listings
      .list()
      .then((data) => {
        // Demo-only view/stock metadata; not yet stored server-side.
        setListings(data.map((item, i) => ({
          ...item,
          views: 105 + i * 35,
          stock: item.cat === 'fabric' ? '30 m' : '—',
        })));
      })
      .catch(() => setListings([]));
  };

  const loadOrders = () => {
    api.orders
      .list()
      .then((data) => setOrders(data.length === 0 ? fallbackOrders : data))
      .catch(() => setOrders(fallbackOrders));
  };

  const mask = (v: string) => (v.length > 4 ? '••••' + v.slice(-4) : v);
  const handleGoTab = (tab: any) => {
    setActiveTab(tab);
  };
  const handleAcceptDesignReq = (index: number) => {
    setDesignRequests((prev) =>
      prev.map((r, i) => (i === index ? { ...r, accepted: true } : r))
    );
  };

  const gstinOk = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/.test(gstin.trim());
  const panOk = /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.trim());
  const ifscOk = /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.trim());

  const handleNext = () => {
    if (step === 1 && !bizType) {
      Alert.alert('Error', lang === 'hi' ? 'व्यवसाय का प्रकार चुनें' : 'Please select a business type');
      return;
    }
    if (step === 2) {
      if (!shopName.trim()) {
        Alert.alert('Error', lang === 'hi' ? 'दुकान का नाम डालें' : 'Enter your shop name');
        return;
      }
      if (shopPin.trim().length !== 6) {
        Alert.alert('Error', lang === 'hi' ? '6 अंकों का पिनकोड डालें' : 'Enter a 6-digit pincode');
        return;
      }
    }
    if (step === 3) {
      if (!noGst && !gstinOk) {
        Alert.alert('Error', lang === 'hi' ? 'सही GSTIN डालें या GSTIN नहीं है चुनें' : 'Enter a valid GSTIN or select GST-exempt option');
        return;
      }
      if (!panOk) {
        Alert.alert('Error', lang === 'hi' ? 'सही PAN डालें (जैसे ABCDE1234F)' : 'Enter a valid PAN (e.g. ABCDE1234F)');
        return;
      }
    }
    if (step === 4) {
      if (!acctName.trim()) {
        Alert.alert('Error', lang === 'hi' ? 'खाताधारक का नाम डालें' : 'Enter bank account holder name');
        return;
      }
      if (acctNum.trim().length < 9) {
        Alert.alert('Error', lang === 'hi' ? 'सही खाता संख्या डालें' : 'Enter a valid account number');
        return;
      }
      if (!ifscOk) {
        Alert.alert('Error', lang === 'hi' ? 'सही IFSC कोड डालें' : 'Enter a valid IFSC code (e.g. HDFC0001234)');
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleLaunch = () => {
    if (!declare) {
      Alert.alert('Error', lang === 'hi' ? 'घोषणा स्वीकार करें' : 'Please accept the declaration');
      return;
    }
    setLocalScreen('submitted');
  };

  const handleGoDash = () => {
    onRegister(shopName, shopPin);
  };

  const handleAddListing = () => {
    if (!newLName.trim() || !newLPrice.trim()) {
      Alert.alert('Error', lang === 'hi' ? 'नाम और दाम डालें' : 'Please enter listing name and price');
      return;
    }
    const priceVal = Number(newLPrice);
    if (isNaN(priceVal) || priceVal <= 0) {
      Alert.alert('Error', lang === 'hi' ? 'सही दाम दर्ज करें' : 'Please enter a valid price');
      return;
    }

    const payload = {
      name: { en: newLName, hi: newLName },
      shop: { en: shopName || 'My Tailor Shop', hi: shopName || 'मीरा दर्जी' },
      price: priceVal,
      cat: newLCat,
      base: '#39597B',
      acc: '#48688A',
      sponsored: false,
      rating: '5.0',
      reviews: 0,
      pincode: shopPin || '221001',
      measurable: newLCat === 'service',
      desc: { en: 'Bespoke tailor collection', hi: 'दर्जी कलेक्शन' }
    };

    api.listings
      .create(payload)
      .then(() => {
        Alert.alert('Success', 'Listing added successfully');
        setNewLName('');
        setNewLPrice('');
        loadListings();
      })
      .catch(() => {
        // Local fallback
        const localItem: BizListing = {
          id: Math.random(),
          name: payload.name,
          price: payload.price,
          cat: payload.cat,
          pincode: payload.pincode,
          views: 0,
          stock: '—',
          base: payload.base,
          acc: payload.acc
        };
        setListings((prev) => [localItem, ...prev]);
        setNewLName('');
        setNewLPrice('');
        Alert.alert('Success', 'Listing added (local mode)');
      });
  };

  const handleAddDesign = () => {
    if (!newDesignName.trim()) {
      Alert.alert('Error', lang === 'hi' ? 'डिज़ाइन का नाम डालें' : 'Enter a design name');
      return;
    }
    setBizDesigns((prev) => [
      ...prev,
      { name: { en: newDesignName, hi: newDesignName }, base: '#5B6B4E', acc: '#6B7B5E' }
    ]);
    setNewDesignName('');
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const msg: Message = { align: 'flex-end', bg: Theme.colorPrimary, fg: '#FAF5EC', text: chatInput };
    setChats((prev) => [...prev, msg]);
    setChatInput('');
  };

  const handleAdvanceOrderStatus = (orderId: string) => {
    const next = (st: OrderStatus): OrderStatus =>
      (Math.min(ORDER_STATUS.Delivered, st + 1) as OrderStatus);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: next(o.status) } : o))
    );
  };

  const businessTypes = [
    { k: 'tailor', icon: '✂️', label: currentT.typeTailor },
    { k: 'wholesaler', icon: '🧵', label: currentT.typeWholesaler },
    { k: 'boutique', icon: '👗', label: currentT.typeBoutique },
    { k: 'designer', icon: '✏️', label: currentT.typeDesigner },
    { k: 'garment', icon: '🏬', label: currentT.typeGarment },
    { k: 'warehouse', icon: '📦', label: currentT.typeWarehouse },
  ];

  const selectedBizTypeObj = businessTypes.find((b) => b.k === bizType) || businessTypes[0];

  if (!isRegistered) {
    if (localScreen === 'submitted') {
      return (
        <View style={[styles.container, { justifyContent: 'center', padding: 24 }]}>
          <View style={styles.card}>
            <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: Theme.colorSuccess, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16 }}>
              <Text style={{ color: '#fff', fontSize: 26, fontWeight: 'bold' }}>✓</Text>
            </View>
            <Text style={[styles.header, { textAlign: 'center' }]}>{currentT.submittedTitle}</Text>
            <Text style={[styles.sub, { textAlign: 'center' }]}>{currentT.submittedSub}</Text>
            <Text style={{ fontSize: 12, color: '#A5732A', fontWeight: 'bold', alignSelf: 'center', marginBottom: 24 }}>⏳ {currentT.verify24}</Text>
            <TouchableOpacity onPress={handleGoDash} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>{currentT.goDash}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', gap: 4, marginBottom: 8 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <View key={n} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: n <= step ? Theme.colorPrimary : Theme.borderColor }} />
              ))}
            </View>
            <Text style={styles.stepTitle}>
              {lang === 'hi' ? `चरण ${step} / 5` : `STEP ${step} OF 5`}
            </Text>

            {step === 1 && (
              <View>
                <Text style={styles.header}>{currentT.onbQ1}</Text>
                <View style={styles.grid}>
                  {businessTypes.map((type) => {
                    const isSelected = bizType === type.k;
                    return (
                      <TouchableOpacity
                        key={type.k}
                        onPress={() => setBizType(type.k)}
                        style={[styles.typeBtn, isSelected && styles.typeBtnActive]}
                      >
                        <Text style={{ fontSize: 20, marginBottom: 4 }}>{type.icon}</Text>
                        <Text style={[styles.typeBtnText, isSelected && styles.typeBtnTextActive]}>{type.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <TouchableOpacity onPress={handleNext} style={styles.primaryBtn}>
                  <Text style={styles.primaryBtnText}>{currentT.continueBtn}</Text>
                </TouchableOpacity>
              </View>
            )}

            {step === 2 && (
              <View>
                <Text style={styles.header}>{currentT.onbQ2}</Text>
                <Text style={styles.label}>{currentT.shopNameLabel}</Text>
                <TextInput value={shopName} onChangeText={setShopName} placeholder={currentT.shopNamePh} style={styles.input} />
                
                <Text style={styles.label}>{currentT.shopDescPh}</Text>
                <TextInput value={shopDesc} onChangeText={setShopDesc} placeholder={currentT.shopDescPh} style={styles.input} />

                <Text style={styles.label}>{currentT.shopAddrPh}</Text>
                <TextInput value={shopAddr} onChangeText={setShopAddr} placeholder={currentT.shopAddrPh} style={styles.input} />

                <Text style={styles.label}>{currentT.pincodePh}</Text>
                <TextInput value={shopPin} onChangeText={setShopPin} placeholder={currentT.pincodePh} keyboardType="numeric" style={styles.input} />
                
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity onPress={handleBack} style={[styles.primaryBtn, { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: Theme.borderColor }]}>
                    <Text style={[styles.primaryBtnText, { color: Theme.textSecondary }]}>{currentT.backBtn}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleNext} style={[styles.primaryBtn, { flex: 2 }]}>
                    <Text style={styles.primaryBtnText}>{currentT.continueBtn}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {step === 3 && (
              <View>
                <Text style={styles.header}>{currentT.onbQ3}</Text>
                
                <Text style={styles.label}>GSTIN</Text>
                <TextInput
                  value={gstin}
                  onChangeText={(val) => setGstin(val.toUpperCase())}
                  placeholder="22AAAAA0000A1Z5"
                  editable={!noGst}
                  style={[styles.input, noGst && { opacity: 0.5 }]}
                />
                
                <TouchableOpacity onPress={() => setNoGst(!noGst)} style={styles.checkboxRow}>
                  <View style={[styles.checkbox, noGst && styles.checkboxActive]} />
                  <Text style={styles.checkboxLabel}>{currentT.noGstLabel}</Text>
                </TouchableOpacity>

                {noGst && (
                  <View style={{ backgroundColor: '#FBF3E0', padding: 10, borderRadius: 8, marginBottom: 12 }}>
                    <Text style={{ fontSize: 11, color: '#7A5A1E', lineHeight: 15 }}>ℹ️ {currentT.noGstNote}</Text>
                  </View>
                )}

                <Text style={styles.label}>PAN *</Text>
                <TextInput
                  value={pan}
                  onChangeText={(val) => setPan(val.toUpperCase())}
                  placeholder="ABCDE1234F"
                  style={styles.input}
                />

                <Text style={styles.label}>{currentT.bizStructLabel}</Text>
                <View style={{ borderWidth: 1, borderColor: Theme.borderColor, borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
                  <TouchableOpacity
                    onPress={() => Alert.alert('Business Structure', 'Please select structure', [
                      { text: currentT.structProp, onPress: () => setBizStruct('prop') },
                      { text: currentT.structPartner, onPress: () => setBizStruct('partner') },
                      { text: currentT.structPvt, onPress: () => setBizStruct('pvtltd') },
                      { text: currentT.structSelf, onPress: () => setBizStruct('self') }
                    ])}
                    style={{ padding: 12, backgroundColor: '#fff' }}
                  >
                    <Text style={{ fontSize: 13.5 }}>{bizStruct === 'prop' ? currentT.structProp : bizStruct === 'partner' ? currentT.structPartner : bizStruct === 'pvtltd' ? currentT.structPvt : currentT.structSelf} ▾</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>{currentT.udyamLabel}</Text>
                <TextInput value={udyam} onChangeText={(val) => setUdyam(val.toUpperCase())} placeholder="UDYAM-XX-00-0000000" style={styles.input} />

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity onPress={handleBack} style={[styles.primaryBtn, { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: Theme.borderColor }]}>
                    <Text style={[styles.primaryBtnText, { color: Theme.textSecondary }]}>{currentT.backBtn}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleNext} style={[styles.primaryBtn, { flex: 2 }]}>
                    <Text style={styles.primaryBtnText}>{currentT.continueBtn}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {step === 4 && (
              <View>
                <Text style={styles.header}>{currentT.onbQ4}</Text>
                
                <Text style={styles.label}>{currentT.acctNameLabel}</Text>
                <TextInput value={acctName} onChangeText={setAcctName} placeholder={currentT.acctNamePh} style={styles.input} />

                <Text style={styles.label}>{currentT.acctNumLabel}</Text>
                <TextInput value={acctNum} onChangeText={(val) => setAcctNum(val.replace(/\D/g, ''))} placeholder="000012345678" keyboardType="numeric" style={styles.input} />

                <Text style={styles.label}>IFSC Code</Text>
                <TextInput value={ifsc} onChangeText={(val) => setIfsc(val.toUpperCase())} placeholder="HDFC0001234" style={styles.input} />

                <Text style={styles.label}>{currentT.upiLabel}</Text>
                <TextInput value={upi} onChangeText={setUpi} placeholder="shop@upi" style={styles.input} />

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity onPress={handleBack} style={[styles.primaryBtn, { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: Theme.borderColor }]}>
                    <Text style={[styles.primaryBtnText, { color: Theme.textSecondary }]}>{currentT.backBtn}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleNext} style={[styles.primaryBtn, { flex: 2 }]}>
                    <Text style={styles.primaryBtnText}>{currentT.continueBtn}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {step === 5 && (
              <View>
                <Text style={styles.header}>{currentT.onbQ5}</Text>
                
                <View style={{ backgroundColor: '#FAF5EC', padding: 12, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: Theme.borderColor }}>
                  <Text style={{ fontSize: 12, marginVertical: 4 }}>🏠 {selectedBizTypeObj.label}</Text>
                  <Text style={{ fontSize: 12, marginVertical: 4 }}>🏪 {shopName} · {shopPin}</Text>
                  <Text style={{ fontSize: 12, marginVertical: 4 }}>🏛️ GSTIN: {noGst ? currentT.gstPending : gstin}</Text>
                  <Text style={{ fontSize: 12, marginVertical: 4 }}>💼 PAN: {mask(pan)}</Text>
                  <Text style={{ fontSize: 12, marginVertical: 4 }}>💳 Acct: {mask(acctNum)} · {ifsc}</Text>
                </View>

                <TouchableOpacity onPress={() => setDeclare(!declare)} style={styles.checkboxRow}>
                  <View style={[styles.checkbox, declare && styles.checkboxActive]} />
                  <Text style={[styles.checkboxLabel, { flex: 1 }]}>{currentT.declaration}</Text>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity onPress={handleBack} style={[styles.primaryBtn, { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: Theme.borderColor }]}>
                    <Text style={[styles.primaryBtnText, { color: Theme.textSecondary }]}>{currentT.backBtn}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleLaunch} style={[styles.primaryBtn, { flex: 2, backgroundColor: Theme.colorAccent }]}>
                    <Text style={styles.primaryBtnText}>{currentT.submitBtn}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  // Dashboard calculations
  const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);
  const totalRevenue = orders.reduce((sum, o) => sum + o.amt, 0);
  const activeOrdersCount = orders.filter(o => o.status < 4).length;

  return (
    <View style={styles.container}>
      {/* Top Header Banner */}
      <View style={styles.dashboardHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 22 }}>{selectedBizTypeObj.icon}</Text>
          <Text style={styles.shopTitle}>{shopName || 'My Shop'}</Text>
        </View>
        <Text style={styles.shopSub}>{selectedBizTypeObj.label} · {shopPin || '221001'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Verification Pending Banner */}
        {activeTab === 'home' && (
          <View style={{ backgroundColor: '#FBF3E0', padding: 12, borderRadius: 12, marginVertical: 12, borderWidth: 1, borderColor: '#E9A23B' }}>
            <Text style={{ fontSize: 11.5, color: '#7A5A1E', fontWeight: 'bold' }}>⏳ {currentT.pendingTitle}</Text>
            <Text style={{ fontSize: 11, color: '#7A5A1E', marginTop: 2 }}>{currentT.pendingNote}</Text>
          </View>
        )}

        {/* 1. HOME TAB */}
        {activeTab === 'home' && (
          <View>
            {/* Numerical Stats */}
            <View style={{ flexDirection: 'row', gap: 8, marginVertical: 10 }}>
              <View style={[styles.statCard, { flex: 1 }]}>
                <Text style={styles.statVal}>{activeOrdersCount}</Text>
                <Text style={styles.statLabel}>{currentT.ordersToday}</Text>
              </View>
              <View style={[styles.statCard, { flex: 1 }]}>
                <Text style={styles.statVal}>{totalViews}</Text>
                <Text style={styles.statLabel}>{currentT.statViews}</Text>
              </View>
              <View style={[styles.statCard, { flex: 1 }]}>
                <Text style={[styles.statVal, { color: Theme.colorSuccess }]}>₹{totalRevenue}</Text>
                <Text style={styles.statLabel}>{currentT.statRevenue}</Text>
              </View>
            </View>

            {/* Quick Actions Grid */}
            <Text style={styles.sectionHeader}>Quick Actions</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 8 }}>
              {[
                { label: currentT.tabListings, icon: '🏷️', id: 'listings' },
                { label: currentT.dashAds, icon: '⚡', id: 'ads' },
                { label: currentT.dashDesigns, icon: '✂️', id: 'designs' },
                { label: currentT.complianceTitle, icon: '🏛️', id: 'compliance' }
              ].map((act) => (
                <TouchableOpacity
                  key={act.id}
                  onPress={() => setActiveTab(act.id as any)}
                  style={{ width: '48%', backgroundColor: '#fff', borderWidth: 1, borderColor: Theme.borderColor, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}
                >
                  <Text style={{ fontSize: 18 }}>{act.icon}</Text>
                  <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{act.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Recent Orders Shortlist */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, marginBottom: 8 }}>
              <Text style={styles.sectionHeader}>{currentT.recentOrders}</Text>
              <TouchableOpacity onPress={() => setActiveTab('orders')}>
                <Text style={{ color: Theme.colorAccent, fontWeight: 'bold', fontSize: 13 }}>View all →</Text>
              </TouchableOpacity>
            </View>
            {orders.slice(0, 2).map((o) => (
              <View key={o.id} style={styles.listingRow}>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontWeight: 'bold', color: '#A5732A', fontSize: 12 }}>{o.id}</Text>
                    <Text style={{ fontSize: 9, fontWeight: 'bold', backgroundColor: o.status === 4 ? '#E2F0D9' : '#FBF3E0', color: o.status === 4 ? '#2E7D5B' : '#A5732A', paddingVertical: 1, paddingHorizontal: 6, borderRadius: 4 }}>
                      {o.status === 4 ? currentT.stDelivered : currentT.stPlaced}
                    </Text>
                  </View>
                  <Text style={{ fontWeight: 'bold', fontSize: 13.5, marginVertical: 2 }}>{o.item[lang]}</Text>
                  <Text style={{ fontSize: 11, color: Theme.textMuted }}>{o.cust[lang]} · Qty: {o.qty}</Text>
                </View>
                <Text style={{ fontWeight: 'bold', color: Theme.colorPrimary }}>₹{o.amt}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 2. ORDERS TAB */}
        {activeTab === 'orders' && (
          <View style={{ gap: 10 }}>
            {orders.map((o) => (
              <View key={o.id} style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: Theme.borderColor, borderRadius: 14, padding: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#A5732A' }}>{o.id}</Text>
                    <Text style={{ fontSize: 9, fontWeight: 'bold', backgroundColor: o.status === 4 ? '#E2F0D9' : '#FBF3E0', color: o.status === 4 ? '#2E7D5B' : '#A5732A', paddingVertical: 1, paddingHorizontal: 6, borderRadius: 4 }}>
                      {o.status === 0 ? currentT.stPlaced : o.status === 1 ? currentT.stAccepted : o.status === 2 ? currentT.stProgress : o.status === 3 ? currentT.stReady : currentT.stDelivered}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: 'bold', color: Theme.colorPrimary }}>₹{o.amt}</Text>
                </View>

                <Text style={{ fontSize: 14, fontWeight: 'bold', marginVertical: 4 }}>{o.item[lang]}</Text>
                <Text style={{ fontSize: 11.5, color: Theme.textMuted }}>Cust: {o.cust[lang]} · Qty: {o.qty}</Text>
                {o.meas && <Text style={{ fontSize: 11, color: Theme.colorPrimary, fontWeight: 'bold', marginTop: 2 }}>📏 {currentT.measAttached}</Text>}

                {/* Progress Indicators */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10, gap: 12 }}>
                  <View style={{ flexDirection: 'row', gap: 4, flex: 1 }}>
                    {[0, 1, 2, 3, 4].map((stepIdx) => (
                      <View key={stepIdx} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: stepIdx <= o.status ? Theme.colorSuccess : Theme.borderColor }} />
                    ))}
                  </View>
                  {o.status < 4 && (
                    <TouchableOpacity
                      onPress={() => handleAdvanceOrderStatus(o.id)}
                      style={{ backgroundColor: Theme.colorPrimary, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 }}
                    >
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>
                        → {o.status === 0 ? currentT.stAccepted : o.status === 1 ? currentT.stProgress : o.status === 2 ? currentT.stReady : currentT.stDelivered}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={{ flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: Theme.borderColor, paddingTop: 10, marginTop: 4 }}>
                  <TouchableOpacity
                    onPress={() => { setInvoiceOrder(o); setInvoiceType('invoice'); }}
                    style={{ flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: Theme.borderColor, padding: 8, borderRadius: 8, alignItems: 'center' }}
                  >
                    <Text style={{ fontSize: 11.5, fontWeight: 'bold', color: Theme.textSecondary }}>🧾 {currentT.invoiceBtn}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => { setInvoiceOrder(o); setInvoiceType('slip'); }}
                    style={{ flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: Theme.borderColor, padding: 8, borderRadius: 8, alignItems: 'center' }}
                  >
                    <Text style={{ fontSize: 11.5, fontWeight: 'bold', color: Theme.textSecondary }}>📦 {currentT.slipBtn}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 3. LISTINGS TAB */}
        {activeTab === 'listings' && (
          <View style={{ gap: 12 }}>
            <View style={styles.card}>
              <Text style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 8 }}>➕ {currentT.addListing}</Text>
              <TextInput value={newLName} onChangeText={setNewLName} placeholder={currentT.listingNamePh} style={styles.input} />
              <TextInput value={newLPrice} onChangeText={setNewLPrice} placeholder={currentT.priceLabel} keyboardType="numeric" style={styles.input} />
              <TouchableOpacity onPress={handleAddListing} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Publish</Text>
              </TouchableOpacity>
            </View>

            {listings.map((l) => (
              <View key={l.id} style={styles.listingRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 34, height: 34, borderRadius: 6, backgroundColor: l.base || '#5B6B4E' }} />
                  <View>
                    <Text style={styles.listingName}>{l.name[lang] || l.name.en}</Text>
                    <Text style={styles.listingPin}>👁 {l.views || 0} views · {l.stock || '—'} stock</Text>
                  </View>
                </View>
                <Text style={styles.listingPrice}>₹{l.price}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 4. CHAT TAB */}
        {activeTab === 'chats' && (
          <View style={styles.chatArea}>
            <ScrollView contentContainerStyle={styles.chatScroll}>
              {chats.map((c, i) => (
                <View key={i} style={[styles.chatBubble, c.align === 'flex-end' ? styles.chatUser : styles.chatShop]}>
                  <Text style={[styles.chatText, c.align === 'flex-end' && { color: '#fff' }]}>{c.text}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.chatInputRow}>
              <TextInput value={chatInput} onChangeText={setChatInput} placeholder="Type message to client…" style={styles.chatInput} />
              <TouchableOpacity onPress={handleSendChat} style={styles.chatSendBtn}>
                <Text style={styles.chatSendText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 5. MORE TAB */}
        {activeTab === 'more' && (
          <View style={{ gap: 8 }}>
            {[
              { icon: '✂️', label: currentT.dashDesigns, id: 'designs' },
              { icon: '⚡', label: currentT.dashAds, id: 'ads' },
              { icon: '📊', label: currentT.dashStats, id: 'stats' },
              { icon: '🏛️', label: currentT.complianceTitle, id: 'compliance' }
            ].map((menu) => (
              <TouchableOpacity
                key={menu.id}
                onPress={() => setActiveTab(menu.id as any)}
                style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: Theme.borderColor, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={{ fontSize: 18 }}>{menu.icon}</Text>
                  <Text style={{ fontSize: 13.5, fontWeight: 'bold' }}>{menu.label}</Text>
                </View>
                <Text style={{ color: Theme.textMuted }}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 5A. DESIGNS SUBTAB */}
        {activeTab === 'designs' && (
          <View style={{ gap: 12 }}>
            <TouchableOpacity onPress={() => setActiveTab('more')}>
              <Text style={{ color: Theme.textMuted, fontSize: 13, fontWeight: 'bold' }}>← Back to More</Text>
            </TouchableOpacity>

            <Text style={styles.sectionHeader}>{currentT.custRequests}</Text>
            {designRequests.map((r, i) => (
              <View key={i} style={[styles.listingRow, { backgroundColor: '#fff' }]}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 13 }}>{r.cust[lang]}</Text>
                  <Text style={{ fontSize: 11, color: Theme.textMuted }}>{r.note[lang]}</Text>
                </View>
                {r.accepted ? (
                  <Text style={{ color: Theme.colorSuccess, fontWeight: 'bold', fontSize: 12 }}>✓ Accepted</Text>
                ) : (
                  <TouchableOpacity
                    onPress={() => handleAcceptDesignReq(i)}
                    style={{ backgroundColor: Theme.colorSuccess, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 }}
                  >
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Accept</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <View style={styles.card}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>Add Catalog Design</Text>
              <TextInput value={newDesignName} onChangeText={setNewDesignName} placeholder="Design name" style={styles.input} />
              <TouchableOpacity onPress={handleAddDesign} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>+ Add Design</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionHeader}>Designs Catalog</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {bizDesigns.map((d, i) => (
                <View key={i} style={{ width: '31%', backgroundColor: '#fff', borderWidth: 1, borderColor: Theme.borderColor, borderRadius: 8, overflow: 'hidden' }}>
                  <View style={{ height: 60, backgroundColor: d.base }} />
                  <Text style={{ fontSize: 10.5, fontWeight: 'bold', padding: 6 }}>{d.name[lang]}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 5B. ADS SUBTAB */}
        {activeTab === 'ads' && (
          <View style={{ gap: 12 }}>
            <TouchableOpacity onPress={() => setActiveTab('more')}>
              <Text style={{ color: Theme.textMuted, fontSize: 13, fontWeight: 'bold' }}>← Back to More</Text>
            </TouchableOpacity>

            <View style={styles.card}>
              <Text style={styles.header}>{currentT.adsTitle}</Text>
              <Text style={[styles.sub, { marginBottom: 14 }]}>{currentT.adsSub}</Text>
              
              <Text style={{ fontSize: 12.5, fontWeight: 'bold', color: Theme.textSecondary }}>
                Daily Budget: <Text style={{ color: Theme.colorPrimary, fontWeight: 'bold' }}>₹{adBudget}</Text>
              </Text>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 10 }}>
                <TouchableOpacity
                  onPress={() => setAdBudget((prev) => Math.max(100, prev - 50))}
                  style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: Theme.borderColor, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ fontSize: 20, fontWeight: 'bold' }}>-</Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 16, fontWeight: 'bold', width: 60, textAlign: 'center' }}>₹{adBudget}</Text>
                <TouchableOpacity
                  onPress={() => setAdBudget((prev) => Math.min(1000, prev + 50))}
                  style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: Theme.borderColor, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ fontSize: 20, fontWeight: 'bold' }}>+</Text>
                </TouchableOpacity>
              </View>

              <Text style={{ fontSize: 11, color: '#A5732A', fontWeight: 'bold', marginBottom: 16 }}>
                ≈ {adBudget * 12} {currentT.estReach}
              </Text>

              <TouchableOpacity
                onPress={() => { setAdActive(!adActive); Alert.alert('Campaign Status', adActive ? 'Campaign Stopped' : 'Campaign Started'); }}
                style={[styles.primaryBtn, { backgroundColor: Theme.colorAccent }]}
              >
                <Text style={styles.primaryBtnText}>{adActive ? currentT.stopAd : currentT.startAd}</Text>
              </TouchableOpacity>

              {adActive && (
                <View style={{ marginTop: 12, backgroundColor: '#FBF3E0', padding: 8, borderRadius: 8 }}>
                  <Text style={{ fontSize: 11.5, color: '#A5732A', fontWeight: 'bold', textAlign: 'center' }}>⚡ Live Campaign Active</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* 5C. ANALYTICS SUBTAB */}
        {activeTab === 'stats' && (
          <View style={{ gap: 12 }}>
            <TouchableOpacity onPress={() => setActiveTab('more')}>
              <Text style={{ color: Theme.textMuted, fontSize: 13, fontWeight: 'bold' }}>← Back to More</Text>
            </TouchableOpacity>

            <Text style={styles.header}>{currentT.dashStats}</Text>
            <Text style={{ fontSize: 11, color: Theme.textMuted, marginTop: -8, marginBottom: 4 }}>{currentT.last30}</Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <View style={[styles.statCard, { width: '48%' }]}>
                <Text style={styles.statVal}>{totalViews}</Text>
                <Text style={styles.statLabel}>{currentT.statViews}</Text>
              </View>
              <View style={[styles.statCard, { width: '48%' }]}>
                <Text style={styles.statVal}>{orders.length}</Text>
                <Text style={styles.statLabel}>{currentT.statOrders}</Text>
              </View>
              <View style={[styles.statCard, { width: '48%' }]}>
                <Text style={[styles.statVal, { color: Theme.colorSuccess }]}>₹{totalRevenue}</Text>
                <Text style={styles.statLabel}>{currentT.statRevenue}</Text>
              </View>
              <View style={[styles.statCard, { width: '48%' }]}>
                <Text style={styles.statVal}>36</Text>
                <Text style={styles.statLabel}>{currentT.statChats}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={{ fontSize: 13, fontWeight: 'bold', marginBottom: 12 }}>{currentT.viewsPerListing}</Text>
              {listings.map((l) => {
                const maxViews = Math.max(...listings.map((x) => x.views || 1), 1);
                const pct = ((l.views || 0) / maxViews) * 100;
                return (
                  <View key={l.id} style={{ marginVertical: 6 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                      <Text style={{ fontSize: 12, fontWeight: '600' }}>{l.name[lang] || l.name.en}</Text>
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#A5732A' }}>{l.views || 0}</Text>
                    </View>
                    <View style={{ height: 6, backgroundColor: '#F0E8D6', borderRadius: 3, overflow: 'hidden' }}>
                      <View style={{ height: '100%', width: `${pct}%`, backgroundColor: Theme.colorPrimary }} />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* 5D. COMPLIANCE SUBTAB */}
        {activeTab === 'compliance' && (
          <View style={{ gap: 12 }}>
            <TouchableOpacity onPress={() => setActiveTab('more')}>
              <Text style={{ color: Theme.textMuted, fontSize: 13, fontWeight: 'bold' }}>← Back to More</Text>
            </TouchableOpacity>

            <Text style={styles.header}>{currentT.complianceTitle}</Text>

            <View style={styles.card}>
              {[
                { k: 'PAN', v: '✓ ' + mask(pan || 'ABCDE1234F'), color: Theme.colorSuccess },
                { k: 'GSTIN', v: (noGst || !gstin) ? currentT.gstPending : '✓ ' + gstin, color: (noGst || !gstin) ? '#A5732A' : Theme.colorSuccess },
                { k: currentT.acctNumLabel, v: '✓ ' + mask(acctNum || '000012345678'), color: Theme.colorSuccess },
                { k: 'Udyam / MSME', v: udyam ? '✓ ' + udyam : '—', color: udyam ? Theme.colorSuccess : Theme.textMuted },
                { k: currentT.pendingTitle, v: '⏳ ' + currentT.pendingWord, color: '#A5732A' }
              ].map((row, idx) => (
                <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: idx < 4 ? 1 : 0, borderBottomColor: Theme.borderColor }}>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: Theme.textMuted }}>{row.k}</Text>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: row.color }}>{row.v}</Text>
                </View>
              ))}
            </View>

            <View style={{ backgroundColor: '#FBF3E0', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E9A23B' }}>
              <Text style={{ fontSize: 11.5, color: '#7A5A1E', lineHeight: 16 }}>ℹ️ {currentT.complianceNote}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Floating glass nav — the app's design language. Its tab ids match
          activeTab, and 'more' stays lit for the sections it groups. */}
      <MobileBottomNav
        currentTab={
          ['designs', 'ads', 'stats', 'compliance'].includes(activeTab) ? 'more' : activeTab
        }
        onSelectTab={(tab) => handleGoTab(tab as any)}
        t={currentT}
      />

      {/* Absolute Invoice Modal Overlay */}
      {invoiceOrder && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#22201C', paddingBottom: 8, marginBottom: 12 }}>
              <Image
                source={require('../../assets/arli_serif_logo_thin_tall.png')}
                style={{ width: 48, height: 24, resizeMode: 'contain', borderRadius: 2 }}
              />
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: Theme.colorAccent }}>
                {invoiceType === 'slip' ? currentT.slipTitle : currentT.invoiceTitle}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <View>
                <Text style={{ fontWeight: 'bold', fontSize: 12 }}>{shopName || 'Meera Tailors'}</Text>
                <Text style={{ fontSize: 9.5, color: Theme.textMuted, marginTop: 2 }}>
                  {!noGst && gstin ? `GSTIN: ${gstin}` : `GST pending · PAN: ${mask(pan || 'ABCDE1234F')}`}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 11 }}>{invoiceOrder.id}</Text>
                <Text style={{ fontSize: 10, color: Theme.textMuted }}>6 Jul 2026</Text>
              </View>
            </View>

            <View style={{ backgroundColor: Theme.bgPrimary, padding: 8, borderRadius: 8, marginBottom: 12 }}>
              <Text style={{ fontSize: 9, fontWeight: 'bold', color: Theme.textMuted, textTransform: 'uppercase', marginBottom: 2 }}>
                {invoiceType === 'slip' ? currentT.deliverTo : currentT.billedTo}
              </Text>
              <Text style={{ fontWeight: 'bold', fontSize: 12 }}>{invoiceOrder.cust[lang]}</Text>
              {invoiceType === 'slip' && (
                <Text style={{ fontSize: 10.5, color: Theme.textSecondary, marginTop: 2 }}>
                  12, Gandhi Road, Karol Bagh, Delhi
                </Text>
              )}
            </View>

            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: Theme.borderColor, paddingBottom: 4, marginBottom: 6 }}>
              <Text style={{ fontSize: 9, fontWeight: 'bold', color: Theme.textMuted }}>Item</Text>
              <Text style={{ fontSize: 9, fontWeight: 'bold', color: Theme.textMuted }}>Amount</Text>
            </View>

            {(() => {
              const hasGstInvoice = !noGst && !!gstin;
              const invBase = hasGstInvoice ? Math.round(invoiceOrder.amt / 1.05) : invoiceOrder.amt;
              const invGstHalf = hasGstInvoice ? Math.round((invoiceOrder.amt - invBase) / 2) : 0;
              return (
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 }}>
                    <Text style={{ fontSize: 11 }}>{invoiceOrder.item[lang]} × {invoiceOrder.qty}</Text>
                    <Text style={{ fontSize: 11, fontWeight: 'bold' }}>₹{invBase}</Text>
                  </View>
                  {hasGstInvoice && invoiceType !== 'slip' && (
                    <View style={{ borderBottomWidth: 1, borderBottomColor: Theme.borderColor, borderStyle: 'dashed', paddingBottom: 6, marginVertical: 4 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 1 }}>
                        <Text style={{ fontSize: 10, color: Theme.textMuted }}>CGST 2.5%</Text>
                        <Text style={{ fontSize: 10, color: Theme.textMuted }}>₹{invGstHalf}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 1 }}>
                        <Text style={{ fontSize: 10, color: Theme.textMuted }}>SGST 2.5%</Text>
                        <Text style={{ fontSize: 10, color: Theme.textMuted }}>₹{invGstHalf}</Text>
                      </View>
                    </View>
                  )}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 2, borderTopColor: '#22201C', paddingTop: 8, marginTop: 4 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 14 }}>{currentT.total}</Text>
                    <Text style={{ fontWeight: 'bold', fontSize: 14, color: Theme.colorPrimary }}>₹{invoiceOrder.amt}</Text>
                  </View>
                </View>
              );
            })()}

            <Text style={{ fontSize: 9.5, color: Theme.textMuted, marginTop: 10 }}>🏪 {currentT.payAtShopNote}</Text>

            {invoiceType === 'slip' && (
              <View style={{ marginTop: 14 }}>
                <View style={{ borderBottomWidth: 1, borderBottomColor: '#22201C', width: 100, height: 16 }} />
                <Text style={{ fontSize: 8.5, color: Theme.textMuted, marginTop: 2 }}>{currentT.signature}</Text>
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
              <TouchableOpacity
                onPress={() => Alert.alert('Doc Downloaded', currentT.docDownloaded)}
                style={[styles.primaryBtn, { flex: 1, marginTop: 0 }]}
              >
                <Text style={styles.primaryBtnText}>Download</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setInvoiceOrder(null)}
                style={[styles.primaryBtn, { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: Theme.borderColor, marginTop: 0 }]}
              >
                <Text style={[styles.primaryBtnText, { color: Theme.textSecondary }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.bgPrimary,
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Theme.borderColor,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
  },
  stepTitle: {
    fontFamily: Theme.fontSansBold,
    fontSize: 11,
    color: '#A5732A',
    marginBottom: 8,
  },
  header: {
    fontFamily: Theme.fontSerif,
    fontSize: 24,
    color: Theme.textPrimary,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  typeBtn: {
    width: '31%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Theme.borderColor,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 76,
  },
  typeBtnActive: {
    backgroundColor: Theme.colorPrimary,
    borderColor: Theme.colorPrimary,
  },
  typeBtnText: {
    fontFamily: Theme.fontSansBold,
    fontSize: 10.5,
    color: Theme.textPrimary,
    textAlign: 'center',
  },
  typeBtnTextActive: {
    color: '#FAF5EC',
  },
  label: {
    fontSize: 11.5,
    fontWeight: 'bold',
    color: Theme.textSecondary,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: Theme.borderColor,
    borderRadius: 10,
    padding: 10,
    fontSize: 13.5,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  primaryBtn: {
    backgroundColor: Theme.colorPrimary,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  primaryBtnText: {
    fontFamily: Theme.fontSansBold,
    fontSize: 13.5,
    color: '#FAF5EC',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: Theme.colorPrimary,
    borderRadius: 4,
  },
  checkboxActive: {
    backgroundColor: Theme.colorPrimary,
  },
  checkboxLabel: {
    fontFamily: Theme.fontSans,
    fontSize: 12.5,
    color: Theme.textSecondary,
  },
  dashboardHeader: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Theme.borderColor,
  },
  shopTitle: {
    fontFamily: Theme.fontSerif,
    fontSize: 24,
    color: Theme.textPrimary,
  },
  shopSub: {
    fontFamily: Theme.fontSans,
    fontSize: 11.5,
    color: Theme.textMuted,
    marginTop: 2,
  },
  scroll: {
    paddingHorizontal: 16,
    // Clears the floating nav pill (bottom: 16 + height: 60).
    paddingBottom: 96,
  },
  listingRow: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Theme.borderColor,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  listingName: {
    fontFamily: Theme.fontSansBold,
    fontSize: 13,
    color: Theme.textPrimary,
  },
  listingPin: {
    fontFamily: Theme.fontSans,
    fontSize: 11,
    color: Theme.textMuted,
    marginTop: 2,
  },
  listingPrice: {
    fontFamily: Theme.fontSansBold,
    fontSize: 14,
    color: Theme.colorPrimary,
  },
  statCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Theme.borderColor,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statVal: {
    fontFamily: Theme.fontSansBold,
    fontSize: 22,
    color: Theme.colorPrimary,
  },
  statLabel: {
    fontFamily: Theme.fontSansBold,
    fontSize: 9.5,
    color: Theme.textMuted,
    textTransform: 'uppercase',
    marginTop: 2,
    textAlign: 'center',
  },
  chatArea: {
    height: 380,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Theme.borderColor,
    borderRadius: 12,
    overflow: 'hidden',
  },
  chatScroll: {
    padding: 12,
    gap: 8,
    paddingBottom: 96,
  },
  chatBubble: {
    padding: 8,
    borderRadius: 10,
    maxWidth: '75%',
    marginVertical: 2,
  },
  chatUser: {
    alignSelf: 'flex-end',
    backgroundColor: Theme.colorPrimary,
  },
  chatShop: {
    alignSelf: 'flex-start',
    backgroundColor: '#FAF5EC',
    borderWidth: 1,
    borderColor: Theme.borderColor,
  },
  chatText: {
    fontFamily: Theme.fontSans,
    fontSize: 13,
    color: Theme.textPrimary,
  },
  chatInputRow: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: Theme.borderColor,
    gap: 8,
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Theme.borderColor,
    borderRadius: 20,
    paddingHorizontal: 12,
    fontSize: 13,
    backgroundColor: '#FAF5EC',
    height: 38,
  },
  chatSendBtn: {
    backgroundColor: Theme.colorAccent,
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
    height: 38,
  },
  chatSendText: {
    color: '#fff',
    fontFamily: Theme.fontSansBold,
    fontSize: 12,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Theme.textPrimary,
    marginTop: 14,
    marginBottom: 6,
  },
  sub: {
    fontSize: 12,
    color: Theme.textMuted,
    marginBottom: 8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(34,32,28,0.55)',
    justifyContent: 'center',
    padding: 16,
    zIndex: 100,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
  },
});
