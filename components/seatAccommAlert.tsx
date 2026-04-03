import { useTrip } from "@/context/trip";
import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Dimensions, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { height } = Dimensions.get('window')



export default function SeatAccommAlert({ setPassengers, accommodations }: {
        setPassengers: React.Dispatch<React.SetStateAction<any[]>> 
        accommodations: any[],
    }) {

    const { tripAccom, setTripAccom } = useTrip();    
    const[loading, setLoading] = useState(false);

    const handleUpdatePassengerAccomm = () => {
        setLoading(true);

        setTimeout(() => {
            setPassengers(prev => 
                prev.map(p => {
                    const updatedAccom = accommodations.find(accom => accom.id !== p.accommodationID);

                    if(tripAccom != updatedAccom.name) {
                        setTripAccom(updatedAccom.name)
                    }

                    if(updatedAccom) {
                        return {
                            ...p,
                            accommodation: updatedAccom.name,
                            accommodationID: updatedAccom.id
                        }
                    }
    
                    return p;
                })
            )

            setLoading(false)
        }, 300);
    }


    return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#00000088', position: 'relative', top: -120 }]}>
            <View style={{ backgroundColor: '#fff',width: '95%', alignSelf: 'center', borderRadius: 20, position: 'absolute', bottom: 40 }}>
                <View style={styles.header}>
                    <Text style={{ fontSize: 19, fontWeight: '700' }}>Opps! No Available Seats</Text>
                </View>
                <View style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
                    <Text style={styles.body}>
                        The selected accommodation is already full. Please choose a different one to continue.
                    </Text>
                    <TouchableOpacity disabled={loading} onPress={() => handleUpdatePassengerAccomm()} style={{ paddingVertical: 12, backgroundColor: '#cf2a3a', borderRadius: 8, marginBottom: 5 }}>
                        {loading ? (
                            <ActivityIndicator size={'small'} color={'#fff'} style={{ alignSelf: 'center' }} />
                        ) : (
                            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 16 }}>Confirm</Text>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.back()} style={{ alignSelf: 'center', paddingHorizontal: 30 }}>
                        <Text style={{ color: '#5a5a5a', textAlign: 'center', paddingVertical: 10, fontSize: 15 }}>Decline</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        height: height + 20,
        position: 'relative',
        zIndex: 50
    },
    header: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBlockColor: '#B3B3B3',
    },
    body: {
        fontSize: 17,
        marginBottom: 20,
    },
})