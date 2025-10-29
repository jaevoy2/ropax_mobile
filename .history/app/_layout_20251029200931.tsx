import { ExpenseProvider } from "@/context/expense";
import { PassengerProvider } from "@/context/passenger";
import { TripProvider } from "@/context/trip";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";

export default function RootLayout() {
  return (
    <TripProvider>
        <PassengerProvider>
          <ExpenseProvider>
            <PassengerProvider>
                <StatusBar barStyle={'light-content'} backgroundColor={'transparent'} translucent />
        
                <Stack>
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="seatPlan" options={{ headerShown: false }} />
                    <Stack.Screen name="generateTicket" options={{ headerShown: false }} />
                    <Stack.Screen name="summary" options={{ headerShown: false }} />
                    
                    <Stack.Screen name="expenses" options={{ headerShown: false }} />
                    <Stack.Screen name="addExpenses" options={{ headerShown: false }} />

                    <Stack.Screen name="login" options={{ headerShown: false }} />
                </Stack>
            </PassengerProvider>
          </ExpenseProvider>
        </PassengerProvider>
    </TripProvider>
  )
}