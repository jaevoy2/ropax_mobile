import { TripProvider } from "@/context/trip";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";

export default function RootLayout() {
  return (
    <TripProvider>
        <StatusBar barStyle={'light-content'} backgroundColor={'transparent'} translucent />

        <Stack>
            <Stack.Screen name="(tabs)/_layout" options={{ headerShown: false }} />
            <Stack.Screen name="manual-booking" options={{ title: "Manual Booking" }} />
        </Stack>

    </TripProvider>
  )
}