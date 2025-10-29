import { FetchBookedPassengers } from "@/api/bookedPassengers";
import L2Vessel from "@/components/L2Vessel";
import SRVessel from "@/components/srVessel";
import Forms from "@/context/forms";
import { usePassengers } from "@/context/passenger";
import { usePassesType } from "@/context/passes";
import { useTrip } from "@/context/trip";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';


const { width, height } = Dimensions.get('window');
const deck = require('@/assets/images/deck.png');
const icon = require('@/assets/images/logo_icon.png');
const text_logo = require('@/assets/images/logo.png');

export default function SeatPlan() {
    const { id, trip, destination, origin, setTotalFare, totalFare } = useTrip();
    const { passesTypeID, passesTypeCode, passesTypeName, setPassesTypeCode, setPassesTypeID, setPassesTypeName } = usePassesType();
    const { passengers, setPassengers, clearPassengers } = usePassengers();
    const [year, setYear] = useState('');
    // const translateY = useRef(new Animated.Value(height)).current;
    // const passessFormAnim = useRef(new Animated.Value(height)).current;
    // const [isPassFormVisible, setIsPassFormVisible] = useState(false);
    // const [isExpanded, setIsExpanded] = useState(false);
    // const [contentHeight, setContentHeight] = useState(height);
    // const [sheetHeight, setSheetHeight] = useState(0);
    // const [passesDisabled, setPassesDisabled] = useState(false);
    
    const [formLoading, setFormLoading] = useState(false);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [totalBookings, setTotalBookings] = useState<number>(0);
    const [saveloading, setSaveLoading] = useState(false);
    const [errorForm, setErrorForm] = useState<(string | number)[]>([]);

    const seatSheetRef = useRef<BottomSheet>(null);
    const passesSheetRef = useRef<BottomSheet>(null);

    const seatSnapPoints = useMemo(() => ["26%", "90%"], []);
    const passesSnapPoints = useMemo(() => ["90%"], []);

    //     useEffect(() => {
    //     let sHeight = 210;

    //     for(let i = 1; i <= passengers.length; i++) {
    //         let cycle = i % 7;

    //         if(cycle == 0) {
    //             Animated.spring(translateY, {
    //                 toValue: height - sHeight,
    //                 useNativeDriver: true,
    //             }).start();
    //             setSheetHeight(height - sHeight);

    //             sHeight += 50;
    //         }
    //     }

    //     computeTotalFare();
    // }, [passengers]);

    useEffect(() => {
        if(passengers.length > 0) {
            seatSheetRef.current?.snapToIndex(1);
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

        const date = new Date();
        setYear(date.getFullYear().toString().slice(-2));
    }, []);

    const handleSeatSelect = () => {
        seatSheetRef.current?.snapToIndex(0);
    }

    const computeTotalFare = () => {
        const totolFare = passengers.reduce((sum, p) => {
            return sum + Number(p.fare || 0);
        }, 0)

        setTotalFare(totolFare);
    }
    
    // const toggleSheetPartial = () => {
    //     const toValue = height - 160;
    //     Animated.spring(translateY, {
    //         toValue,
    //         useNativeDriver: true,
    //     }).start();

    //     setContentHeight(height - 120);
    //     setSheetHeight(toValue);
    //     setIsExpanded(true);
    // }

    // const passessToggleSheet = () => {
    //     setPassengers([]);

    //     if(passengers.length < 1) {
    //         setPassengers(prev => [...prev, { passType_id: passesTypeID, passType: passesTypeName, passTypeCode: passesTypeCode, fare: 0 }]);
    //     }
    //     setIsPassFormVisible(true);
    //     setFormLoading(true);

    //     const toValue = height - 700;
    //     Animated.spring(passessFormAnim, {
    //         toValue,
    //         useNativeDriver: true,
    //     }).start();

    //     setTimeout(() => {
    //         setFormLoading(false);
    //     }, 300);
    // }

    const addPasses = () => {
        setPassengers(prev => [...prev, { passType_id: passesTypeID, accommodation: passesTypeName, passTypeCode: passesTypeCode }]);
    }

    const handleRemoveSeat = (seat: number | string | undefined) => {
        if(passengers.length  == 1) {
            console.log(passengers);
            seatSheetRef.current?.close();
        }

        const newSeats = passengers.filter(s => s.seatNumber != seat);
        setPassengers(newSeats);
    }

    // const closePassessToggleSheet = () => {
    //     clearPassengers();
    //     setIsPassFormVisible(false);
    //     const toValue = height;
    //     Animated.spring(passessFormAnim, {
    //         toValue,
    //         useNativeDriver: true,
    //     }).start();
    // }

    const handleSeatChange = () => {
        setIsFormVisible(false);
        seatSheetRef.current?.snapToIndex(0);
    }

    const onFormView = () => {
        setFormLoading(true);
        setIsFormVisible(true);
        seatSheetRef.current?.snapToIndex(1)
        setTimeout(() => {
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

            const passesType = passengers.some((p) => p.passType == 'Passes' || p.passTypeCode == 'P');

            const invalidNameFormat = passengers.find((p) => !p.name?.includes(',') );
            
            if(!passesType) {
                if (invalidNameFormat) {
                    setErrorForm([invalidNameFormat.seatNumber ?? '']);
                    Alert.alert('Invalid', `Invalid name format for seat number ${invalidNameFormat.seatNumber}`);
                    setSaveLoading(false);
                    return;
                }

                if (hasEmpty) {
                    setErrorForm([hasEmpty.seatNumber ?? '']);
                    Alert.alert('Invalid', `Seat number ${hasEmpty.seatNumber} still has some required fields missing.`);
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
            }

            if (invalidNameFormat) {
                Alert.alert('Invalid', `A passenger has an invalid name format`);
                setSaveLoading(false);
                return;
            }

            router.push('/summary');
            setSaveLoading(false);
        }, 300);
    }


    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={{ height: '100%', overflow: 'hidden' }}>
                <LinearGradient
                    colors={[
                        'rgba(214, 48, 65, 1)',
                        'rgba(228, 80, 80, 0.8)',
                        'rgba(228, 80, 80, 0.52)', 
                        'rgba(253, 0, 0, 0.15)',
                ]} style={{ zIndex: -1, height: '100%', width: width }} />
                
                <TouchableOpacity onPress={() => router.back()} style={{ position: 'absolute', left: 20, top: 50, zIndex: 1 }}>
                    <Ionicons name={'chevron-back'} size={30} color={'#fff'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => passesSheetRef.current?.expand()} style={{ position: 'absolute', right: 20, top: 50, zIndex: 1 }}>
                    <MaterialCommunityIcons name={'account-arrow-right'} size={30} color={'#fff'} />
                </TouchableOpacity>

                <View style={{ position: 'absolute', paddingTop: 50, width: width, flex: 1 }}>
                    <Text style={{ textAlign: 'center', color: '#fff', fontSize: 20, fontWeight: 'bold' }}>{trip}</Text>
                    <Text style={{ textAlign: 'center', color: '#fff', fontSize: 10 }}>Vessel Seat Plan</Text>
                    <View style={{ paddingTop: 10, height: height - 60 }}>
                        <ScrollView style={{ height: '100%' }} contentContainerStyle={{ paddingBottom: 20 }}>
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

                <BottomSheet ref={seatSheetRef} snapPoints={seatSnapPoints} index={-1} bottomInset={1} enableContentPanningGesture={false} handleComponent={null}>
                    <View style={{ flexDirection:'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 15, paddingHorizontal: 10 }}>
                        <Text style={{ fontSize: 10, fontWeight: "bold" }}>Seat# selected</Text>
                        <TouchableOpacity onPress={() => handleSeatChange()} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                            <Ionicons name="swap-horizontal" size={20} color={'#cf2a3a'} />
                            <Text style={{ color: '#cf2a3a', fontSize: 11, fontWeight: 'bold' }}>Change Seat</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ paddingHorizontal: 10 }}>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, borderColor: '#B3B3B3', borderWidth: 1, backgroundColor: '#fff', borderRadius: 8, padding: 8, width: '100%', marginTop: 5 }}>
                            {passengers.map((p) => (
                                <View key={p.seatNumber} style={{ position: 'relative' }}>
                                    <TouchableOpacity onPress={() => handleRemoveSeat(p.seatNumber)} style={{ position: 'absolute', top: -8, right: -4, zIndex: 3 }}>
                                        <Ionicons name="remove-circle" size={20} color={'#cf2a3a'} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ borderColor: '#000', borderWidth: 1, borderRadius: 5, width: 45, height: 45, justifyContent: 'center' }}>
                                        <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}>{p.seatNumber}</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>
                    {isFormVisible == true && (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginVertical: 15, paddingHorizontal: 10 }}>
                            <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                <Text style={{ fontSize: 11 }}>Reference#:</Text>
                                <Text style={{ fontWeight: '900', fontSize: 14, color: '#cf2a3a' }}>LMBS-000000-{year}{origin.charAt(0)}{destination.charAt(0)}</Text>
                            </View>
                            <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                                <Text style={{ fontSize: 9, fontWeight: '900', color: '#cf2a3a' }}>Total Fare:</Text>
                                <View style={{ borderColor: '#cf2a3a', backgroundColor: '#cf2a3b1a', borderWidth: 2, borderRadius: 5, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 }}>
                                    <Text style={{ fontSize: 16 }}>₱</Text>
                                    <TextInput value={String(totalFare != 0 ? totalFare.toString() : '')} onChangeText={(text) => setTotalFare(Number(text))} placeholder='00.00' style={{ fontWeight: 'bold', textAlign: 'right' }} keyboardType={'numeric'} />
                                </View>
                            </View>
                        </View>
                    )}
                    <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: 10 }} showsVerticalScrollIndicator={false}>
                        {isFormVisible == true && (
                            <View style={{ position: 'relative' }}>
                                {formLoading == true ? (
                                    <View style={{ height: '80%', justifyContent: 'center', alignItems: 'center',  }}>
                                        <ActivityIndicator size={'large'} color={'#cf2a3a'} />
                                    </View>
                                ) : (
                                    <View style={{ flex: 1 }}>
                                        <ScrollView>
                                            <Forms errorForm={errorForm} />
                                        </ScrollView>
                                    </View>
                                )}
                            </View>
                        )}
                        {isFormVisible == false ? (
                            <TouchableOpacity onPress={() => onFormView()} disabled={passengers.length == 0} style={{ backgroundColor: passengers.length == 0 ? '#df5a68ff' : '#cf2a3a', width: '100%', alignSelf: 'center', borderRadius: 30, paddingVertical: 15 }}>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#fff' }}>Continue</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={() => handleSave()} style={{ backgroundColor: '#cf2a3a', width: '100%', alignSelf: 'center', borderRadius: 30, paddingVertical: 15 }}>
                                {saveloading == true ? (
                                    <ActivityIndicator size='small' color={'#fff'} />
                                ) : (
                                    <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#fff' }}>Proceed Payment</Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </BottomSheetScrollView>
                </BottomSheet>
                

                {/* Passess accommodation passenger */}



            </View>
        </GestureHandlerRootView>


    )
}