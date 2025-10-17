import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, View } from "react-native";
import ManageBooking from "./manage-booking";
import ManualBooking from "./manual-booking";

const Tab = createBottomTabNavigator();

export default function TabsLayout() {
  return (
    <>
      <StatusBar translucent backgroundColor={'transparent'} barStyle={ 'light-content' } />
      <Tab.Navigator 
        screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#CF2A3A',
            tabBarStyle: {
                height: 60,
            },
        }}
      >
        <Tab.Screen 
          name="manual-booking"
          component={ManualBooking}
          options={{
            tabBarLabel: 'Manual Booking',
            headerShown: false,
            tabBarIcon: ({ focused, color }) => (
                <View style={{ justifyContent: 'center' }}>
                    < Ionicons
                        name={focused ? 'ticket' : 'ticket-outline'}
                        color={color ? '#CF2A3A' : '#696969'}
                        size={28}
                    />
                </View>
            ),
          }}
        />

        <Tab.Screen 
          name="manage-booking"
          component={ManageBooking}
          options={{
            tabBarLabel: 'Manage Booking',
            headerShown: false,
            tabBarIcon: ({ focused, color }) => (
                <View style={{ justifyContent: 'center' }}>
                    < Ionicons
                        name={focused ? 'bookmarks' : 'bookmarks-outline'}
                        color={color ? '#CF2A3A' : '#696969'}
                        size={25}
                    />
                </View>
            ),
          }}
        />

      </Tab.Navigator>
    </>
  )
}