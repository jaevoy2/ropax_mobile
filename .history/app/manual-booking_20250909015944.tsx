import { usePassengers } from "@/context/passenger";
import { useTrip } from "@/context/trip";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

const trips = ['HILONGOS  >  UBAY [Sea Runner]', 'HILONGOS  >  UBAY [Leopards 2]', 'UBAY  >  HILONGOS [Sea Runner]', 'UBAY  >  HILONGOS [Leopards 2]'];


export default function ManualBooking() {
    const { trip, setTrip, refNumber, setRefNumber } = useTrip();
    const { clearPassengers } = usePassengers();

    const handleSaveTrip = (selectedTrip: string) => {
    const oldBracket = trip.match(/\[(.*?)\]/)?.[1] ?? null;
    const newBracket = selectedTrip.match(/\[(.*?)\]/)?.[1] ?? null;

    const oldPrefix = trip.split(" ")[0] ?? null;
    const newPrefix = selectedTrip.split(" ")[0] ?? null;

    if (
        oldBracket !== null &&
        newBracket !== null &&
        oldPrefix !== null &&
        newPrefix !== null &&
        oldBracket !== newBracket &&
        oldPrefix !== newPrefix
    ) {
        setTrip('');
        clearPassengers();
    }

    setRefNumber(prev => prev + 1);    
    setTrip(selectedTrip);

    router.push('/seatPlan');
};



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
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Select Trip</Text>
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