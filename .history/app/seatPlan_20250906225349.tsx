import { useTrip } from "@/context/trip";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

const { width, height } = Dimensions.get('window');
const deck = require('@/assets/images/deck.png');

export default function SeatPlan() {
    const { trip, refNumber } = useTrip();


    return (
        <View style={{ height: '100%', position: 'relative' }}>
            <LinearGradient
                colors={[
                    'rgba(214, 48, 65, 1)',
                    'rgba(228, 80, 80, 0.8)',
                    'rgba(228, 80, 80, 0.52)', 
                    'rgba(253, 0, 0, 0.15)',
            ]} style={{ zIndex: -1, height: '100%', width: width }} />
            
            <TouchableOpacity style={{ position: 'absolute', left: 20, top: 50 }}>
                <Ionicons name={'chevron-back'} size={30} color={'#fff'} />
            </TouchableOpacity>

            <View style={{  position: 'absolute', zIndex: 3, paddingTop: 50, width: width, flex: 1 }}>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 20, fontWeight: 'bold' }}>{trip.match(/\[(.*?)\]/)?.[1]}</Text>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 10 }}>Vessel Seat Plan</Text>

                <View style={{ height: '60%', marginTop: 20, paddingHorizontal: 20 }}>
                    <ScrollView>
                        <Image source={deck} style={{ opacity: 0.5 }} />
                        <View style={{ backgroundColor: '#000', height: 300, width: width, zIndex: 5 }}></View>
                    </ScrollView>
                </View>

            </View>

        </View>

    )
}