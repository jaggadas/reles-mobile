import { Image } from 'expo-image';
import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { colors, typography } from '@/constants/colors';
import { useSubscription } from '@/contexts/SubscriptionContext';

const HomeIcon = require('@/assets/icons/Home.svg');
const BookmarkIcon = require('@/assets/icons/Bookmark.svg');
const CartIcon = require('@/assets/icons/Cart.svg');
const ProfileIcon = require('@/assets/icons/Profile.svg');

export default function TabLayout() {
  const { isPro } = useSubscription();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 88,
          paddingTop: 14,
          elevation: 0,
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontFamily: typography.family.headingBold,
        },
        tabBarShowLabel: false,
        headerShown: true,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Image source={HomeIcon} style={{ width: 32, height: 32 }} tintColor={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: 'Recipes',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Image source={BookmarkIcon} style={{ width: 32, height: 32 }} tintColor={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="grocery"
        options={{
          title: 'List',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Image source={CartIcon} style={{ width: 32, height: 32 }} tintColor={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <View>
              <Image source={ProfileIcon} style={{ width: 32, height: 32 }} tintColor={color} />
              {isPro && (
                <View style={styles.proBadge}>
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  proBadge: {
    position: 'absolute',
    top: -4,
    right: -12,
    backgroundColor: '#8B1A1A',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  proBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontFamily: typography.family.bodySemibold,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

