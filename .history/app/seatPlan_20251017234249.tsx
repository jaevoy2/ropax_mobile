import { FetchBookedPassengers } from "@/api/bookedPassengers";
import L2Vessel from "@/components/L2Vessel";
import SRVessel from "@/components/srVessel";
import Forms from "@/context/forms";
import { usePassengers } from "@/context/passenger";
import { useTrip } from "@/context/trip";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

const { width, height } = Dimensions.get('window');
const deck = require('@/assets/images/deck.png');
const icon = require('@/assets/images/logo_icon.png');
const text_logo = require('@/assets/images/logo.png');

export default function SeatPlan() {
    const { id, trip, destination, origin, setTotalFare, totalFare } = useTrip();
    const translateY = useRef(new Animated.Value(height)).current;
    const passessFormAnim = useRef(new Animated.Value(height)).current;
    const { passengers, setPassengers } = usePassengers();
    const [totalBookings, setTotalBookings] = useState<number>(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [contentHeight, setContentHeight] = useState(height);
    const [sheetHeight, setSheetHeight] = useState(0);
    const [saveloading, setSaveLoading] = useState(false);
    const [errorForm, setErrorForm] = useState<(string | number)[]>([])

    useEffect(() => {
        if(passengers.length > 0 && isExpanded == false) {
            toggleSheetPartial();
        }

        const fetchTripBookings = async () => {
            try {
                const bookedPassengers = await FetchBookedPassengers(id);
    
                if(!bookedPassengers.error) {
                    const passengers = bookedPassengers.data.length;
                    setTotalBookings(passengers);
                }
            }catch(error: any) {
                Alert.alert('Error', error.message);
            }
        }

        fetchTripBookings();
    }, []);

    useEffect(() => {
        let sHeight = 210;

        for(let i = 1; i <= passengers.length; i++) {
            let cycle = i % 7;

            if(cycle == 0) {
                Animated.spring(translateY, {
                    toValue: height - sHeight,
                    useNativeDriver: true,
                }).start();
                setSheetHeight(height - sHeight);

                sHeight += 50;
            }
        }

        computeTotalFare();
    }, [passengers]);

    const computeTotalFare = () => {
        const totolFare = passengers.reduce((sum, p) => {
            return sum + Number(p.fare || 0);
        }, 0)

        setTotalFare(totolFare);
    }
    
    const toggleSheetPartial = () => {
        

        const toValue = height - 160;
        Animated.spring(translateY, {
            toValue,
            useNativeDriver: true,
        }).start();

        setContentHeight(height - 120);
        setSheetHeight(toValue);
        setIsExpanded(true);
    }

    const passessToggleSheet = () => {
        const toValue = height - 700;
        Animated.spring(passessFormAnim, {
            toValue,
            useNativeDriver: true,
        }).start();
    }

    const closePassessToggleSheet = () => {
        const toValue = height;
        Animated.spring(passessFormAnim, {
            toValue,
            useNativeDriver: true,
        }).start();
    }

    const handleSeatSelect = () => {
        if(passengers.length == 0) {
            toggleSheetPartial()
        }
    }

    const handleRemoveSeat = (seat: number | string | undefined) => {
        const newSeats = passengers.filter(s => s.seatNumber != seat);
        setPassengers(newSeats);
    }

    const handleSeatChange = () => {
        setIsFormVisible(false);
        Animated.spring(translateY, {
            toValue: sheetHeight,
            useNativeDriver: true,
        }).start();
    }

    const onFormView = () => {
        setFormLoading(true);
        setIsFormVisible(true);
        setTimeout(() => {
            Animated.spring(translateY, {
                toValue: height - 760,
                useNativeDriver: true,
            }).start();
            setFormLoading(false);
        }, 300);
    }

    const handleSave = () => {
        setSaveLoading(true);
        setErrorForm([]);

        setTimeout(() => {
            const hasEmpty = passengers.find((p) =>
                !p.name?.trim() || !p.passType?.trim() || !p.age || !p.gender?.trim() 
            )
            if (hasEmpty) {
                setErrorForm([hasEmpty.seatNumber ?? '']);
                Alert.alert('Invalid', `Seat number ${hasEmpty.seatNumber} still has some required fields missing.`);
                setSaveLoading(false);
                return;
            }

            const invalidNameFormat = passengers.find((p) => !p.name?.includes(',') )
            if (invalidNameFormat) {
                setErrorForm([invalidNameFormat.seatNumber ?? '']);
                Alert.alert('Invalid', `Invalid name format for seat number ${invalidNameFormat.seatNumber}`);
                setSaveLoading(false);
                return;
            }

            const infantFieldError = passengers.find((p) =>
                p.infant?.find((i) => !i.name.trim() || !i.gender.trim() || !i.age)
            )
            if (infantFieldError) {
                setErrorForm(prev => [...prev, infantFieldError!.seatNumber ?? '']);
                Alert.alert('Invalid', `Seat number ${infantFieldError.seatNumber} has missing infant details.`);
                setSaveLoading(false);
                return;
            }

            const infantAgeError = passengers.find((p) =>
                p.infant?.find((i) => i.age > 2)
            )
            if (infantAgeError) {
                setErrorForm(prev => [...prev, infantAgeError!.seatNumber ?? '']);
                Alert.alert('Check Infant Age', `Please provide a valid age for the infant in seat ${infantAgeError.seatNumber}.`);
                setSaveLoading(false);
                return;
            }

            const childAgeError = passengers.filter((p) => p.passType == 'Child' && (p.age! > 18 || p.age! < 3));
            if(childAgeError.length > 0) {
                setErrorForm(prev => [...prev, ...childAgeError.map(p => p.seatNumber ?? '')]);
                childAgeError.forEach((child: any) => {
                    Alert.alert(
                        "Invalid Age",
                        `Passenger in seat ${child.seatNumber} is marked as "Child" but age is ${child.age}.`
                    );
                });
                setSaveLoading(false);
                return;
            }
            
            const adultAgeError = passengers.filter((p) => p.passType == 'Adult' && (p.age! < 19 || p.age! > 59));
            if(adultAgeError.length > 0) {
                setErrorForm(prev => [...prev, ...adultAgeError.map(p => p.seatNumber ?? '')]);
                adultAgeError.forEach((adult: any) => {
                    Alert.alert(
                        "Invalid Age",
                        `Passenger in seat ${adult.seatNumber} is marked as "Adult" but age is ${adult.age}.`
                    );
                });
                setSaveLoading(false);
                return;
            }

            const seniorAgeError = passengers.filter((p) => p.passType == 'Senior' && p.age! < 60);
            if(seniorAgeError.length > 0) {
                setErrorForm(prev => [...prev, ...seniorAgeError.map(p => p.seatNumber ?? '')]);
                seniorAgeError.forEach((senior: any) => {
                    Alert.alert(
                        "Invalid Age",
                        `Passenger in seat ${senior.seatNumber} is marked as "Senior" but age is ${senior.age}.`
                    );
                });
                setSaveLoading(false);
                return;
            }
            
            router.push('/summary');
            setSaveLoading(false);
        }, 300);
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
            <TouchableOpacity onPress={() => passessToggleSheet()} style={{ position: 'absolute', right: 20, top: 50, zIndex: 5 }}>
                <MaterialCommunityIcons name={'account-arrow-right'} size={30} color={'#fff'} />
            </TouchableOpacity>

            <View style={{  position: 'absolute', zIndex: 3, paddingTop: 50, width: width, flex: 1 }}>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 20, fontWeight: 'bold' }}>{trip}</Text>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 10 }}>Vessel Seat Plan</Text>
                <View style={{ height: contentHeight, paddingTop: 10, }}>
                    <ScrollView>
                        <Image source={deck} style={{ opacity: 0.5, width: '100%', height: height + 620, marginLeft: -3 }} />
                        <View style={{ height: 300, width: '95%', zIndex: 5, position: 'absolute', left: '50%', transform: [{ translateX: '-50%' }], alignItems: 'center', }}>
                            <Image source={icon} style={{ width: 41, height: 40, marginTop: 40 }} />
                            <Image source={text_logo} style={{ width: 120, height: 28, marginTop: 10 }} />
                            <Text style={{ fontSize: 15, fontWeight: '900', color: '#cf2a3a', marginTop: 20 }}>{totalBookings} TOTAL PAYING PASSENGERS</Text>
                            <View style={{ width: '80%', backgroundColor: '#FAFAFA', marginTop: 20, borderRadius: 10, paddingVertical: 30, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>
                                    <Ionicons name={'boat'} size={16} color={'#fff'} style={{ padding: 3, backgroundColor: '#cf2a3a', borderRadius: 5 }} />
                                    <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{origin}</Text>
                                </View>
                                <Ionicons name={'arrow-forward-circle'} color={'#cf2a3a'} size={25} />
                                <View style={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>
                                    <Ionicons name={'location'} size={15} color={'#fff'} style={{ padding: 3, backgroundColor: '#cf2a3a', borderRadius: 5 }} />
                                    <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{destination}</Text>
                                </View>
                            </View>
                            <View>
                                {trip == 'Sea Runner' ? (
                                    <SRVessel onSeatSelect={handleSeatSelect} />
                                ) : (
                                    <L2Vessel onSeatSelect={handleSeatSelect} />
                                )}
                            </View>
                        </View>
                    </ScrollView>
                </View>

            </View>

            <Animated.View style={{ position: 'absolute', bottom: 0, width: width, height, backgroundColor: '#f8f8f8ff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 10, transform: [{ translateY }], zIndex: 5 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Seat# selected</Text>
                    {isFormVisible == true && (
                        <TouchableOpacity onPress={() => handleSeatChange()} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                            <Ionicons name="swap-horizontal" size={20} color={'#cf2a3a'} />
                            <Text style={{ color: '#cf2a3a', fontSize: 11, fontWeight: 'bold' }}>Change Seat</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, borderRadius: 10, }}>
                    <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8, borderColor: '#B3B3B3', borderWidth: 1, backgroundColor: '#fff', borderRadius: 8, padding: 8, width: '100%', marginTop: 5 }}>
                        {passengers.map((p) => (
                            <View key={p.seatNumber} style={{ position: 'relative' }}>
                                {isExpanded == true && isFormVisible == false && (
                                    <TouchableOpacity onPress={() => handleRemoveSeat(p.seatNumber)} style={{ position: 'absolute', top: -8, right: -4, zIndex: 3 }}>
                                        <Ionicons name="remove-circle" size={20} color={'#cf2a3a'} />
                                    </TouchableOpacity>
                                )} 
                                <TouchableOpacity style={{ borderColor: '#000', borderWidth: 1, borderRadius: 5, width: 45, height: 45, justifyContent: 'center' }}>
                                    <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}>{p.seatNumber}</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </View>
                {isFormVisible == true && (
                    <View style={{ paddingVertical: 10 }}>
                        {formLoading == true ? (
                            <View style={{ height: '80%', justifyContent: 'center', alignItems: 'center',  }}>
                                <ActivityIndicator size={'large'} color={'#cf2a3a'} />
                            </View>
                        ) : (
                            <Forms errorForm={errorForm} />
                        )}
                    </View>
                )}
            </Animated.View>
            

            {/* Passess accommodation passenger */}
            <Animated.View style={{ position: 'absolute', bottom: 0, width: width, height, backgroundColor: '#f8f8f8ff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 10, transform: [{ translateY: passessFormAnim }], zIndex: 5 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#cf2a3a', borderRadius: 5, padding: 10 }}>
                        <Ionicons name="person-add" size={15} color={'#fff'} />
                        <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Add Passenger</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => closePassessToggleSheet()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name={'close'} size={25} color={'#cf2a3a'} />
                        <Text style={{ color: '#cf2a3a', fontWeight:'bold' }}>Close</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ paddingVertical: 10 }}>
                    <Forms errorForm={errorForm} />
                </View>
            </Animated.View>

            {/* buttons */}
            {isExpanded == true && isFormVisible == false && (
                <TouchableOpacity onPress={() => onFormView()} style={{ position: 'absolute', bottom: 10, backgroundColor: '#cf2a3a', width: '95%', alignSelf: 'center', borderRadius: 30, paddingVertical: 15, zIndex: 5 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#fff' }}>Continue</Text>
                </TouchableOpacity>
            )}
            {isFormVisible == true && (
                <TouchableOpacity onPress={() => handleSave()} style={{ position: 'absolute', bottom: 10, backgroundColor: '#cf2a3a', width: '95%', alignSelf: 'center', borderRadius: 30, paddingVertical: 15, zIndex: 5 }}>
                    {saveloading == true ? (
                        <ActivityIndicator size='small' color={'#fff'} />
                    ) : (
                        <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#fff' }}>Proceed Payment</Text>
                    )}
                </TouchableOpacity>
            )}

        </View>

    )
}