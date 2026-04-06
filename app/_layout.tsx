import { CargoProvider } from "@/context/cargoProps";
import { ExpenseProvider } from "@/context/expense";
import { PassengerProvider } from "@/context/passenger";
import { PassesTypeProvider } from "@/context/passes";
import { TripProvider } from "@/context/trip";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { AutocompleteDropdownContextProvider } from 'react-native-autocomplete-dropdown';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <TripProvider>
        <CargoProvider>
            <PassengerProvider>
              <ExpenseProvider>
                <PassesTypeProvider>
                  <AutocompleteDropdownContextProvider>
                    <StatusBar barStyle={'light-content'} backgroundColor={'transparent'} translucent />
            
                    <Stack>
                        <Stack.Screen name="index" options={{ headerShown: false }} />
                        
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="seatPlan" options={{ headerShown: false }} />
                        <Stack.Screen name="generateTicket" options={{ headerShown: false }} />
                        <Stack.Screen name="summary" options={{ headerShown: false }} />
                        <Stack.Screen name="bookingInfo" options={{ headerShown: false }} />
                        <Stack.Screen name="scanner" options={{ headerShown: false }} />
                        <Stack.Screen name="bookingForm" options={{ headerShown: false }} />
                        <Stack.Screen name="addPaxCargo" options={{ headerShown: false }} />
                        
                        <Stack.Screen name="expenses" options={{ headerShown: false }} />
                        <Stack.Screen name="addExpenses" options={{ headerShown: false }} />

                    </Stack>
                  </AutocompleteDropdownContextProvider>
                </PassesTypeProvider>
              </ExpenseProvider>
            </PassengerProvider>
        </CargoProvider>
      </TripProvider>
    </SafeAreaProvider>
  )
}