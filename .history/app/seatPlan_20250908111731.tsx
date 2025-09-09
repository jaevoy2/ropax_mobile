import L2Vessel from "@/components/L2Vessel";
import SRVessel from "@/components/srVessel";
import { useTrip } from "@/context/trip";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Animated, Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

const { width, height } = Dimensions.get('window');
const deck = require('@/assets/images/deck.png');
const icon = require('@/assets/images/logo_icon.png');
const text_logo = require('@/assets/images/logo.png');

export default function SeatPlan() {
    const { trip, refNumber } = useTrip();
    const [isExpanded, setIsExpanded] = useState(false);
    const translateY = useRef(new Animated.Value(height)).current;

    const toggleSheetPartial = () => {
        const toValue = isExpanded ? height: height - 160;

        Animated.spring(translateY, {
            toValue,
            useNativeDriver: true,
        }).start();

        setIsExpanded(!isExpanded);
    }

    const handleSeatSelect = (seat: string | number) => {
        toggleSheetPartial()
    }


    return (
        <View style={{ height: '100%', position: 'relative' }}>
            <LinearGradient
                colors={[
                    'rgba(214, 48, 65, 1)',
                    'rgba(228, 80, 80, 0.8)',
                    'rgba(228, 80, 80, 0.52)', 
                    'rgba(253, 0, 0, 0.15)',
            ]} style={{ zIndex: -1, height: '100%', width: width }} />
            
            <TouchableOpacity onPress={() => router.back()} style={{ position: 'absolute', left: 20, top: 50, zIndex: 5 }}>
                <Ionicons name={'chevron-back'} size={30} color={'#fff'} />
            </TouchableOpacity>

            <View style={{  position: 'absolute', zIndex: 3, paddingTop: 50, width: width, flex: 1 }}>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 20, fontWeight: 'bold' }}>{trip.match(/\[(.*?)\]/)?.[1]}</Text>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 10 }}>Vessel Seat Plan</Text>

                <View style={{ height: '50%', paddingTop: 20, }}>
                    <ScrollView>
                        <Image source={deck} style={{ opacity: 0.5, width: '100%', marginLeft: -3, height: height + 600 }} />
                        <View style={{ height: 300, width: '90%', zIndex: 5, position: 'absolute', left: '50%', transform: [{ translateX: '-50%' }], alignItems: 'center', }}>
                            <Image source={icon} style={{ width: 41, height: 40, marginTop: 40 }} />
                            <Image source={text_logo} style={{ width: 120, height: 30, marginTop: 10 }} />
                            <Text style={{ fontSize: 12, fontWeight: '900', color: '#cf2a3a', marginTop: 20 }}>0 TOTAL PAYING PASSENGERS</Text>
                            <View style={{ width: '85%', backgroundColor: '#FAFAFA', marginTop: 20, borderRadius: 10, paddingVertical: 30, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>
                                    <Ionicons name={'boat'} size={16} color={'#fff'} style={{ padding: 3, backgroundColor: '#cf2a3a', borderRadius: 5 }} />
                                    <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{trip.split(" ")[0]}</Text>
                                </View>
                                <Ionicons name={'arrow-forward-circle'} color={'#cf2a3a'} size={25} />
                                <View style={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>
                                    <Ionicons name={'location'} size={15} color={'#cf2a3a'} style={{ padding: 3, backgroundColor: '#fff', borderRadius: 5, borderColor: '#8B8BA0', borderWidth: 1 }} />
                                    <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{trip.split(" ")[4]}</Text>
                                </View>
                            </View>
                            <View>
                                {trip.match(/\[(.*?)\]/)?.[1] == 'Sea Runner' ? (
                                    <SRVessel onSeatSelect={handleSeatSelect} />
                                ) : (
                                    <L2Vessel />
                                )}
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>

            <Animated.View style={{ position: 'absolute', bottom: 0, width: width, height, backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 15, transform: [{ translateY }] }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Seat# selected</Text>
            </Animated.View>

        </View>

    )
}