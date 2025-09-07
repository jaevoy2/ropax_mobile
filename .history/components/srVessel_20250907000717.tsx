import React from "react";
import { StyleSheet, Text, View } from "react-native";

// Prop type
type SRVesselSeatsProps = {
  seat: number | string;
};

// Component
const SRVesselSeats = ({ seat }: SRVesselSeatsProps) => {
  return (
    <View style={styles.seatContainer}>
      <Text style={styles.seatText}>{seat}</Text>
    </View>
  );
};

export default SRVesselSeats;

// Styles
const styles = StyleSheet.create({
  seatContainer: {
    width: 50,
    height: 50,
    backgroundColor: "#FFC107",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    margin: 5,
  },
  seatText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#fff",
  },
});
