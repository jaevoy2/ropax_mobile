import { PassengerProvider } from "@/context/passenger";
import { TripProvider } from "@/context/trip";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";

export default function RootLayout() {
  return (
    <TripProvider>
        <PassengerProvider>
            <StatusBar barStyle={'light-content'} backgroundColor={'transparent'} translucent />

            <Stack>
                <Stack.Screen name="(tabs)/index" options={{ headerShown: false }} />
                
                <Stack.Screen name="manual-booking" options={{ headerShown: false }} />
                <Stack.Screen name="seatPlan" options={{ headerShown: false }} />
            </Stack>
        </PassengerProvider>
    </TripProvider>
  )
}