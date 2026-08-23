import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line, Polyline } from 'react-native-svg';
import { theme as Theme } from '@arli/tokens';
import type { MerchantDictionary } from '@arli/i18n';

interface MerchantMobileBottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  t: MerchantDictionary;
}

export const MobileBottomNav: React.FC<MerchantMobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  t,
}) => {

  const tabs = [
    {
      id: 'home',
      label: t.tabHome,
      icon: (active: boolean) => (
        <Svg width="22" height="22" viewBox="0 0 24 24" fill={active ? Theme.colorNavActive : 'none'} stroke={active ? Theme.colorNavActive : Theme.colorNavInactive} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <Line x1="18" y1="20" x2="18" y2="10" />
          <Line x1="12" y1="20" x2="12" y2="4" />
          <Line x1="6" y1="20" x2="6" y2="14" />
        </Svg>
      ),
    },
    {
      id: 'orders',
      label: t.tabOrders,
      icon: (active: boolean) => (
        <Svg width="22" height="22" viewBox="0 0 24 24" fill={active ? Theme.colorNavActive : 'none'} stroke={active ? Theme.colorNavActive : Theme.colorNavInactive} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <Polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <Line x1="12" y1="22.08" x2="12" y2="12" />
        </Svg>
      ),
    },
    {
      id: 'listings',
      label: t.tabListings,
      icon: (active: boolean) => (
        <Svg width="22" height="22" viewBox="0 0 24 24" fill={active ? Theme.colorWarningText : 'none'} stroke={active ? Theme.colorWarningText : Theme.colorNavInactive} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <Line x1="7" y1="7" x2="7.01" y2="7" />
        </Svg>
      ),
    },
    {
      id: 'chats',
      label: t.tabChats,
      icon: (active: boolean) => (
        <Svg width="22" height="22" viewBox="0 0 24 24" fill={active ? Theme.colorNavActive : 'none'} stroke={active ? Theme.colorNavActive : Theme.colorNavInactive} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </Svg>
      ),
    },
    {
      id: 'more',
      label: t.moreTitle,
      icon: (active: boolean) => (
        <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? Theme.colorNavActive : Theme.colorNavInactive} strokeWidth={active ? '2.2' : '1.8'} strokeLinecap="round" strokeLinejoin="round">
          <Circle cx="12" cy="12" r="3" />
          <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </Svg>
      ),
    },
  ];

  // A hardcoded `bottom: 16` ignored the device's actual system-UI height: on
  // gesture navigation Android reserves a taller strip at the bottom for the
  // gesture handle than a fixed constant accounts for, and the pill (or its
  // labels) can end up crowded against or under it. insets.bottom is the real
  // reserved height for THIS device, so 16 stays genuine clearance above it.
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.floatingNavContainer, { bottom: 16 + insets.bottom }]}>
      <View style={styles.floatingNavPill}>
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.7}
              onPress={() => onSelectTab(tab.id)}
              style={styles.navButton}
            >
              <View style={styles.iconWrapper}>{tab.icon(isActive)}</View>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingNavContainer: {
    position: 'absolute',
    // bottom is supplied inline above (16 + the device's real safe-area inset).
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 999,
  },
  floatingNavPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 480,
    height: 60,
    backgroundColor: 'rgba(250, 245, 236, 0.95)',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(228, 219, 200, 0.9)',
    paddingHorizontal: 8,
    shadowColor: '#22201C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 10,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 9.5,
    fontFamily: 'sans-serif-medium',
    color: Theme.colorNavInactive,
    marginTop: 2,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  navLabelActive: {
    color: Theme.colorNavActive,
    fontWeight: 'bold',
  },
});
