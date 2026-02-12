import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { colors, typography } from '@/constants/colors';
import { useSubscription } from '@/contexts/SubscriptionContext';

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
          paddingTop: 8,
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
            <MaterialIcons name="home" size={28} color={color} />
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
            <MaterialIcons name="bookmark" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="grocery"
        options={{
          title: 'List',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="shopping-cart" size={28} color={color} />
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
              <MaterialIcons name="person" size={28} color={color} />
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

