import { usePassengers } from "@/context/passenger";
import { useTrip } from "@/context/trip";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Dimensions, Modal, Text, TouchableOpacity, View } from "react-native";

const trips = ['HILONGOS  >  UBAY 9AM [Sea Runner]', 'HILONGOS  >  UBAY 12PM [Leopards 2]', 'UBAY  >  HILONGOS 9AM [Sea Runner]', 'UBAY  >  HILONGOS 12PM [Leopards 2]'];
const { height, width } = Dimensions.get('screen');

export default function ManualBooking() {
    const { trip, setTrip, refNumber, setRefNumber } = useTrip();
    const { clearPassengers } = usePassengers();
    const [loading, setLoading] = useState(true);

    const handleSaveTrip = (selectedTrip: string) => {
        // setTimeout(() => )

        if(trip != selectedTrip) {
            setTrip('');
            clearPassengers();
        }

        setRefNumber(prev => prev + 1);    
        setTrip(selectedTrip);
        router.push('/seatPlan');
    }


    return (
        <View style={{ backgroundColor: '#f1f1f1' }}>
            <View style={{ paddingTop: 30, height: 100, backgroundColor: '#cf2a3a', paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Manual Booking</Text>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                    <TouchableOpacity>
                        <Ionicons name="boat" size={25} color={'#FFC107'} />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Ionicons name="calendar" size={25} color={'#FFC107'} />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ padding: 20 }}>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Select Trip</Text>
                    <Modal visible={loading} transparent animationType="fade">
                        <View style={{ backgroundColor: '#00000048', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ height: 120, width: width - 100, backgroundColor: '#fff', borderRadius: 10, justifyContent :'center' }}>
                                <ActivityIndicator size={'large'} color={'#cf2a3a'} />
                            </View>
                        </View>
                    </Modal>
                </View>
                <View>
                    {trips.map((trip) => (
                        <TouchableOpacity onPress={() => handleSaveTrip(trip)} key={trip} style={{ paddingHorizontal: 15, paddingVertical: 25, backgroundColor: '#fff', borderRadius: 10, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 13 }}>{trip}</Text>
                            <Ionicons name="chevron-forward" size={18} />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    )
}