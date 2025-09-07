import { useTrip } from "@/context/trip";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

const { width, height } = Dimensions.get('window');
const deck = require('@/assets/images/deck.png');
const icon = require('@/assets/images/logo_icon.png');
const text_logo = require('@/assets/images/logo.png');

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

                <View style={{ height: '50%', paddingVertical: 20 }}>
                    <ScrollView>
                        <Image source={deck} style={{ opacity: 0.5 }} />
                        <View style={{ height: 300, width: '90%', zIndex: 5, position: 'absolute', left: '50%', transform: [{ translateX: '-50%' }], alignItems: 'center', }}>
                            <Image source={icon} style={{ width: 40, height: 40, marginTop: 40 }} />
                            <Image source={text_logo} style={{ width: 120, height: 30, marginTop: 10 }} />
                            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#cf2a3a', marginTop: 20 }}>0 TOTAL PAYING PASSENGERS</Text>
                            <View style={{ width: '85%', backgroundColor: '#ffffffd0', marginTop: 20, borderRadius: 10, paddingVertical: 30, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>
                                    <Ionicons name={'boat'} size={16} color={'#fff'} style={{ padding: 3, backgroundColor: '#cf2a3a', borderRadius: 5 }} />
                                    <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{trip.split(" ")[0]}</Text>
                                </View>
                                <Ionicons name={'arrow-forward-circle'} color={'#cf2a3a'} size={25} />
                                <View style={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>
                                    <Ionicons name={'location'} size={15} color={'#fff'} style={{ padding: 3, backgroundColor: '#cf2a3a', borderRadius: 5 }} />
                                    <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{trip.split(" ")[4]}</Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </View>

            </View>

        </View>

    )
}