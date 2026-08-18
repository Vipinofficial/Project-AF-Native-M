import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { theme as Theme } from '@arli/tokens';

interface HeaderProps {
  t: any;
  langLabel: string;
  loggedIn: boolean;
  onNavigate: (screen: string) => void;
  onToggleLang: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  t,
  langLabel,
  loggedIn,
  onNavigate,
  onToggleLang,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => onNavigate('home')} style={styles.logoRow}>
          <View style={styles.logoBox}>
            <View style={styles.brandTitleRow}>
              <Text style={styles.brandName}>ARLI</Text>
              <Text style={styles.subBrand}>FASHION</Text>
            </View>
            <Text style={styles.vendorText}>by fashion vendors</Text>
          </View>
          <Text style={styles.merchantBadgeText}>MERCHANT</Text>
        </TouchableOpacity>

        <View style={styles.actions}>
          <TouchableOpacity onPress={onToggleLang} style={styles.langBtn}>
            <Text style={styles.langLabel}>{langLabel}</Text>
          </TouchableOpacity>

          {!loggedIn ? (
            <TouchableOpacity onPress={() => onNavigate('login')} style={styles.loginBtn}>
              <Text style={styles.loginText}>Sign In</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.merchantBadge}>
              <Text style={styles.merchantText}>🏪 Seller Active</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.bgPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Theme.borderColor,
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandName: {
    fontFamily: Theme.fontSerif,
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colorPrimary,
    marginRight: 4,
  },
  subBrand: {
    fontFamily: Theme.fontSansBold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: Theme.colorPrimary,
  },
  vendorText: {
    fontFamily: Theme.fontSans,
    fontSize: 7.5,
    fontStyle: 'italic',
    color: Theme.textMuted,
    marginTop: 1,
  },
  merchantBadgeText: {
    fontFamily: Theme.fontSansBold,
    fontSize: 8.5,
    color: '#A5732A',
    backgroundColor: '#EDE4CF',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Theme.borderColor,
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  langLabel: {
    fontFamily: Theme.fontSansBold,
    fontSize: 12,
    color: Theme.colorPrimary,
  },
  loginBtn: {
    backgroundColor: Theme.colorPrimary,
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  loginText: {
    fontFamily: Theme.fontSansSemiBold,
    fontSize: 12,
    color: '#FAF5EC',
  },
  merchantBadge: {
    backgroundColor: '#EDE4CF',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  merchantText: {
    fontFamily: Theme.fontSansBold,
    fontSize: 11,
    color: '#A5732A',
  },
});
