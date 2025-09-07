import { useTrip } from "@/context/trip";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get('window');

export default function SeatPlan() {
    const { trip, refNumber } = useTrip();


    return (
        <View style={{ height: '100%', position: 'relative' }}>
            <LinearGradient
                colors={[
                    'rgba(214, 48, 65, 1)',
                    'rgba(228, 80, 80, 0.8)',
                    'rgba(228, 80, 80, 0.28)', 
                    'rgba(253, 0, 0, 0.08)',
            ]} style={{ zIndex: -1, height: '100%', width: width }} />
            
            <TouchableOpacity style={{ position: 'absolute', left: 20, top: 50 }}>
                <Ionicons name={'chevron-back'} size={30} color={'#fff'} />
            </TouchableOpacity>

            <View style={{  position: 'absolute', zIndex: 3, paddingTop: 50, width: width }}>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 18, fontWeight: 'bold' }}>{trip.match(/\[(.*?)\]/)?.[1]}</Text>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 13 }}>Vessel Seat Plan</Text>
            </View>

        </View>

    )
}