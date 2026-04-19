import { BleProvider } from "@/context/BLEManager";
import { CargoProvider } from "@/context/cargoProps";
import { ExpenseProvider } from "@/context/expense";
import { PassengerProvider } from "@/context/passenger";
import { PassesTypeProvider } from "@/context/passes";
import { TripProvider } from "@/context/trip";
import { Stack } from "expo-router";
import React from "react";
import { Alert, StatusBar, Text, View } from "react-native";
import { AutocompleteDropdownContextProvider } from 'react-native-autocomplete-dropdown';
import { SafeAreaProvider } from 'react-native-safe-area-context';


type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
}

type ErrorBoundaryProps = {
  children: React.ReactNode;
}
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null }; 
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    Alert.alert(
        "Debug Error",
        `Error: ${error?.message}\n\nStack: ${info?.componentStack?.slice(0, 300)}`,
        [{ text: 'OK' }]

    );

    console.error(error, info);
  }

  render() {
      if (this.state.hasError) {
          return (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'red', marginBottom: 10 }}>
                      Something went wrong
                  </Text>
                  <Text style={{ fontSize: 13, color: '#333', textAlign: 'center' }}>
                      {this.state.error?.message}
                  </Text>
              </View>
          );
      }

      return this.props.children;
  }

}



export default function RootLayout() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <TripProvider>
          <CargoProvider>
              <PassengerProvider>
                <ExpenseProvider>
                  <PassesTypeProvider>
                    <BleProvider>
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
                    </BleProvider>
                  </PassesTypeProvider>
                </ExpenseProvider>
              </PassengerProvider>
          </CargoProvider>
        </TripProvider>
      </SafeAreaProvider>
    </ErrorBoundary>

  )

}