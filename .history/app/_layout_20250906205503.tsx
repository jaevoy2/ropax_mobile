import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native";

export default function RootLayout() {
  return (
    <SafeAreaView style={{ flex: 1}}>
      <StatusBar style="dark"/>
      
      <Slot/>
    </SafeAreaView>
  )
}