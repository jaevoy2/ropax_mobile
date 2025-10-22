import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StatusBar, View } from 'react-native';

export default function TabsLayout() {
  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <Tabs
        screenOptions={{
          headerShown: false, // ✅ hides all headers inside tabs
          tabBarActiveTintColor: '#CF2A3A',
          tabBarStyle: { height: 60 },
        }}
      >
        <Tabs.Screen
          name="manual-booking"
          options={{
            tabBarLabel: 'Manual Booking',
            tabBarIcon: ({ focused }) => (
              <View style={{ justifyContent: 'center' }}>
                <Ionicons
                  name={focused ? 'ticket' : 'ticket-outline'}
                  color={focused ? '#CF2A3A' : '#696969'}
                  size={28}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="manage-booking"
          options={{
            tabBarLabel: 'Manage Booking',
            tabBarIcon: ({ focused }) => (
              <View style={{ justifyContent: 'center' }}>
                <Ionicons
                  name={focused ? 'bookmarks' : 'bookmarks-outline'}
                  color={focused ? '#CF2A3A' : '#696969'}
                  size={25}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="expenses"
          options={{
            tabBarLabel: 'Expenses',
            tabBarIcon: ({ focused }) => (
              <View style={{ justifyContent: 'center' }}>
                <MaterialCommunityIcons
                  name={'currency-php'}
                  color={focused ? '#CF2A3A' : '#696969'}
                  size={25}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            tabBarLabel: 'Settings',
            tabBarIcon: ({ focused }) => (
              <View style={{ justifyContent: 'center' }}>
                <Ionicons
                  name={focused ? 'settings' : 'settings-outline'}
                  color={focused ? '#CF2A3A' : '#696969'}
                  size={25}
                />
              </View>
            ),
          }}
        />
      </Tabs>
    </>
  );
}
