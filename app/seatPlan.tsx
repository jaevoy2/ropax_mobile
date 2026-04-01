import { FetchAccommodations } from '@/api/accommodations';
import { FetchTotalBookings } from "@/api/totalBookings";
import L2Vessel from "@/components/L2Vessel";
import SeatAccommAlert from '@/components/seatAccommAlert';
import SRVessel from "@/components/srVessel";
import { useCargo } from "@/context/cargoProps";
import { usePassengers } from "@/context/passenger";
import { usePassesType } from "@/context/passes";
import { useTrip } from "@/context/trip";
import { seatRemoval } from "@/utils/channel";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import * as Crypto from 'expo-crypto';
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';



const { width, height } = Dimensions.get('window');
const deck = require('@/assets/images/deck.png');
const icon = require('@/assets/images/logo_icon.png');
const text_logo = require('@/assets/images/logo.png');


export type AccomsProps = {
    id: number;
    name?: string;
    code: string;
}

export default function SeatPlan() {
    const { passengers, setPassengers } = usePassengers();
    const { id, vessel, destination, origin, setTotalFare } = useTrip();
    const { passesTypeID, passesTypeCode, passesTypeName } = usePassesType();
    const { paxCargoProperty } = useCargo();
    const [accommodations, setAccommodations] = useState<AccomsProps[] | null>(null);
    const [year, setYear] = useState('');
    const [totalBookings, setTotalBookings] = useState<number>(0);
    const [errorForm, setErrorForm] = useState<(string | number)[]>([]);
    const [passesIsHidden, setPassesIsHidden] = useState(false);
    const [hasAvailableSeat, setHasAvailableSeat] = useState<boolean>(true);
    const passengersRef = useRef(passengers);
    const seatSheetRef = useRef<BottomSheet>(null);
    const [isLoading, setIsLoading] = useState(true); 


    const seatSnapPoints = useMemo(() => ["30%"], []);
    const sheetIndex = useMemo(() => passengers.length > 0 ? 0 : -1, [passengers.length]);

    const hasPasses = useMemo(() => passengers.some(p => p.passType == 'Passes'), [passengers]);
    const hasSeat = useMemo(() => passengers.some(p => p.seatNumber != null), [passengers]);

    useEffect(() => {
        passengersRef.current = passengers;
    }, [passengers]);

    useEffect(() => {
        if(accommodations) {
            return;
        }else {
            fetchAccom();
        }

        handleFetchTotalBookings(id)
        const date = new Date();
        setYear(date.getFullYear().toString().slice(-2));
    }, []);

    useEffect(() => {
        if(passengers && hasSeat) {
            setPassesIsHidden(true)
        }else {
            setPassesIsHidden(false);
        }
    }, [passengers]);

    const computedFare = useMemo(() => {
        return passengers.reduce((sum, p) => {
            const passengerFare = Number(p.fare || 0);

            const cargoTotal = (p.cargo ?? []).reduce((cargoSum, c) => {
                return cargoSum + (Number.isFinite(c.cargoAmount) ? Number(c.cargoAmount) : 0);
            }, 0);

            return sum + passengerFare + cargoTotal;
        }, 0);

    }, [passengers, paxCargoProperty]);


    useEffect(() => {
        setTotalFare(computedFare)
    }, [computedFare])
    
    const handleSeatSelect = useCallback(() => {
        if(passengers.length == 0) {
            seatSheetRef.current?.snapToIndex(0);
        }
    }, [])

    const fetchAccom = async () => {
        try {
            const accomType = await FetchAccommodations();

            if(!accomType.error) {
                const accomms: AccomsProps[] = accomType.data.map((a: any) => ({
                    id: a?.id,
                    name: a.name,
                    code: a.code
                }));

                setAccommodations(accomms);
            }
        }catch(error: any) {
            Alert.alert('Error', error.message)
        }
    }

    const vesselComponent = useMemo(() => (
        vessel == 'Mbca Leopards Sea Runner' || vessel == 'Sea Runner'
            ? <SRVessel onSeatSelect={handleSeatSelect} accommodations={accommodations} seatAvailability={setHasAvailableSeat} setParentLoading={setIsLoading} />
            : <L2Vessel onSeatSelect={handleSeatSelect} accommodations={accommodations} seatAvailability={setHasAvailableSeat} setParentLoading={setIsLoading} />
    ), [vessel, handleSeatSelect]);

    const handleRemoveSeat =  useCallback((seat: number | string, paxId: string | number) => {
        if (!seat) return;

        if (errorForm.includes(seat)) {
            setErrorForm(prev => prev.filter(e => e != seat));
        }

        seatRemoval(seat, id);

        setPassengers(prev => {
            const paxHasScan = prev.some(p => p.hasScanned && p.id == paxId);

            const updatedPassengers = paxHasScan
                ? prev.map(p =>
                    p.id == paxId ? { ...p, seatNumber: '' } : p
                )
                : prev.filter(p => p.seatNumber != seat);

            const noSeatsLeft = updatedPassengers.filter(p => p.seatNumber).length === 0;

            const singleUnscannedPassenger =
                noSeatsLeft && !paxHasScan;

            if (singleUnscannedPassenger) {
                seatSheetRef.current?.close();
            }

            return updatedPassengers;
        });
    }, [id, errorForm, setPassengers]);

    const handleForceSeatRemoval = () => {
        passengers.forEach(paxSeat => {
            const seat = paxSeat.seatNumber;

            if(errorForm.includes(seat)) {
                const updateErrorForm = errorForm.filter((e: any) => e != seat);
                setErrorForm(updateErrorForm);
            }

            seatRemoval(seat, id)
        });
    }

    const handleCreatePasses = () => {
        setPassengers([]);

        const temp = Crypto.randomUUID();

        setTimeout(() => {
            setPassengers([{ 
                id: temp, passType_id: passesTypeID, passType: passesTypeName, passTypeCode: passesTypeCode
            }]);

        }, 400);

        router.push('/bookingForm')
    }

    const renderBottomSheetBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop {...props} appearsOnIndex={6} disappearsOnIndex={0} pressBehavior={'none'} opacity={0.5} />
        ), []
    )

    const handleFetchTotalBookings = async (trip_id: number | null) => {
            try {
                if(!trip_id) return;
                const totalBookingFetch = await FetchTotalBookings(trip_id);
                
                if(!totalBookingFetch.error) {
                    setTotalBookings(totalBookingFetch.total_paying);
                }
            }catch(error: any) {
                Alert.alert('Error', error.message);
            }
        }

    return (
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#cf2a3a' }}>
                
            <View style={{ height: '100%', overflow: 'hidden' }}>
                <View style={{ height: 100, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20 }}>
                    <TouchableOpacity onPress={() => {handleForceSeatRemoval(); router.back()}} style={{ zIndex: 1 }}>
                        <Ionicons name={'arrow-back'} size={30} color={'#fff'} />
                    </TouchableOpacity>
                    {(passengers.length < 1 || hasPasses) && (
                        <TouchableOpacity onPress={() => handleCreatePasses()} style={{ opacity: passesIsHidden == true ?0 : 1 }}>
                            <MaterialCommunityIcons name={'account-arrow-right'} size={30} color={'#fff'} />
                        </TouchableOpacity>
                    )}
                </View>

                {hasAvailableSeat == false && (
                    <SeatAccommAlert setPassengers={setPassengers} accommodations={accommodations} />
                )}

                <View style={{ position: 'absolute', paddingTop: 50, width: width, flex: 1 }}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', alignSelf: 'center', textAlign: 'center' }}>{vessel}</Text>
                    <Text style={{ textAlign: 'center', color: '#fff', fontSize: 10 }}>Vessel Seat Plan</Text>
                    <View style={{ paddingTop: 10, height: height - 60 }}>
                        <ScrollView style={{ height: '100%' }} contentContainerStyle={{ paddingBottom: 20 }}>

                            {!isLoading && (
                                <Image source={deck} style={{ opacity: 0.5, width: '100%', height: height + 620, alignSelf: 'center', tintColor: '#ffffff' }} />
                            )}

                            <View style={{ height: 300, width: '95%', zIndex: 5, position: 'absolute', alignSelf: 'center', alignItems: 'center', }}>
                                {!isLoading && (
                                    <>
                                        <Image source={icon} style={{ width: 41, height: 40, marginTop: 40 }} />
                                        <Image source={text_logo} style={{ width: 120, height: 28, marginTop: 10 }} />

                                        <Text style={{ fontSize: 13, fontWeight: '900', color: '#fff', marginTop: 20, textAlign: 'center' }}>{totalBookings} TOTAL PAYING PASSENGERS</Text>

                                        <View style={{ width: '80%', backgroundColor: '#FAFAFA', marginTop: 20, borderTopLeftRadius: 30, borderTopRightRadius: 30, borderBottomLeftRadius: 5,
                                                borderBottomRightRadius: 5, paddingVertical: 30, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <View style={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>
                                                <Ionicons name={'boat'} size={16} color={'#fff'} style={{ padding: 3, backgroundColor: '#cf2a3a', borderRadius: 5 }} />
                                                <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{origin}</Text>
                                            </View>
                                            <Ionicons name={'arrow-forward'} color={'#cf2a3a'} size={25} />
                                            <View style={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>
                                                <Ionicons name={'location'} size={15} color={'#fff'} style={{ padding: 3, backgroundColor: '#cf2a3a', borderRadius: 5 }} />
                                                <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{destination}</Text>
                                            </View>
                                        </View>
                                    </>
                                )}

                                <View style={{ alignSelf: 'center' }}>
                                    {vesselComponent}
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </View>

                <BottomSheet ref={seatSheetRef} snapPoints={seatSnapPoints} index={sheetIndex } bottomInset={1} backdropComponent={renderBottomSheetBackdrop} enableHandlePanningGesture={false} enableContentPanningGesture={false}  handleIndicatorStyle={{ display: 'none' }} >
                    <Text style={{ fontSize: 14, fontWeight: "bold", marginLeft: 20 }}>Seat# selected</Text>
                    <View style={{ paddingHorizontal: 10 }}>
                        <View style={{ height: 90, borderColor: '#B3B3B3', borderWidth: 1, backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 8, width: '100%', marginTop: 5 }}>
                            <ScrollView style={{ flex: 1, paddingTop: 10, paddingBottom: 20 }}>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                                    {passengers.map((p) => (
                                        <View key={p.id} style={{ position: 'relative' }}>
                                            <TouchableOpacity onPress={() => handleRemoveSeat(p.seatNumber, p.id)} style={{ position: 'absolute', top: -10, right: -9, zIndex: 3 }}>
                                                <Ionicons name="remove-circle" size={28} color={'#cf2a3a'} />
                                            </TouchableOpacity>
                                            <TouchableOpacity style={{ borderColor: errorForm.includes(p.seatNumber!) ? '#cf2a3a' : '#000', backgroundColor: errorForm.includes(p.seatNumber!) ? '#cf2a3b3d' : 'transparent', borderWidth: 1, borderRadius: 5, width: 50, height: 50, justifyContent: 'center' }}>
                                                <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}>{p.seatNumber}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    </View>

                    <TouchableOpacity onPress={() => router.push('/bookingForm')} disabled={passengers.some(p => p.seatNumber == '')} style={{ backgroundColor: passengers.some(p => p.seatNumber == '') ? '#df5a68ff' : '#cf2a3a', width: '95%', alignSelf: 'center', borderRadius: 8, paddingVertical: 15, marginTop: 15 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#fff' }}>Continue</Text>
                    </TouchableOpacity>
                </BottomSheet>

            </View>
        </GestureHandlerRootView>


    )
}