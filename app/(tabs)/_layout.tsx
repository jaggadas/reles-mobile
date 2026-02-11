import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { Tabs } from 'expo-router';
import { HapticTab } from '@/components/haptic-tab';
import { colors, shadows, typography } from '@/constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          height: 88,
          paddingTop: 8,
          ...shadows.md,
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
          headerTitle: () => (
            <Image
              source={require('@/assets/images/Reles.svg')}
              style={{ width: 80, height: 28 }}
              contentFit="contain"
            />
          ),
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="search" size={28} color={color} />
          ),
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
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="menu-book" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person-outline" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

