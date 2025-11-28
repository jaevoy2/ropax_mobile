import { FetchTotalBookings } from "@/api/totalBookings";
import { FetchTrips } from "@/api/trips";
import { usePassengers } from "@/context/passenger";
import { useTrip } from "@/context/trip";
import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, Dimensions, Modal, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from 'react-native-calendars';

const { height, width } = Dimensions.get('window');

type TripProps = {
    trip_id: number;
    departure: string;
    vessel: string;
    route_origin: string;
    route_destination: string;
    departure_time: string;
    vessel_id: number;
    route_id: number;
    code: string;
    web_code: string;
    mobile_code: string;
}

type TotalBookingProps = {
    station: string;
    color: string;
    count: number;
    accommodationGroup: {
        accommodation: string;
        passenger: {
            type: string;
            passenger_count: number;
        }[];
    }[];
}

type PaxTypeProps = {
    paxTypeID: number;
    paxType: string;
}

type AccommodationProps = {
    accomtTypeID: number;
    accomType: string;
}

export default function ManualBooking() {
    const { trip, setTrip, setID, setOrigin, setDestination, setVesselID, setCode, setWebCode, setDepartureTime, setMobileCode } = useTrip();
    const { clearPassengers } = usePassengers();
    const [trips, setTrips] = useState<TripProps[] | null>(null);
    const [totalBookings, setTotalBookings] = useState<TotalBookingProps[] | null>(null);
    const [paxTypes, setPaxTypes] = useState<PaxTypeProps[] | null>(null);
    const [accomTypes, setAccomTypes] = useState<AccommodationProps[] | null>(null);
    const [contentLoading, setContentLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [calendar, setCalendar] = useState(false);
    const [tripDate, setTripDate] = useState('');
    const [formattedDate, setFormattedDate] = useState('');
    const [expanded, setExpanded] = useState(false);
    const [totalSheetLoading, setTotalSheetLoading] = useState(false);
    const [bottomSheetTripID, setBottomSheetTripID] = useState<number | null>(null);
    const translateY = useRef(new Animated.Value(height + 50)).current;
    const fadeInAnim = useRef(new Animated.Value(0)).current;


    useEffect(() => {

        setContentLoading(true);
        const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
        setTripDate(today);

        const date = new Date(today);
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'Asia/Manila'
        }

        const formattedDate = date.toLocaleDateString('en-US', options);
        const day = date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Asia/Manila' });
        const queryDate = `${formattedDate} (${day})`;

        setFormattedDate(queryDate);
        handleFetchTrips(today);
    }, [])

    const handleRefresh = () => {
        setRefresh(true);
        
        setTimeout(() => {
            const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
            setTripDate(today);
            const date = new Date(today);
            const options: Intl.DateTimeFormatOptions = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'Asia/Manila'
            }

            const formattedDate = date.toLocaleDateString('en-US', options);
            const day = date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Asia/Manila' });
            const queryDate = `${formattedDate} (${day})`;

            setFormattedDate(queryDate);
            handleFetchTrips(today);
            setRefresh(false);
        }, 1500);
    }

    const handleOnDateSelect = (selectedDate: string) => {
        setContentLoading(true);
        const selected = new Date(selectedDate).toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
        setTripDate(selected);
        const date = new Date(selected);
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'Asia/Manila'
        }

        const formattedDate = date.toLocaleDateString('en-US', options);
        const day = date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Asia/Manila' });
        const queryDate = `${formattedDate} (${day})`;
        
        setFormattedDate(queryDate);
        handleFetchTrips(new Date(selectedDate).toISOString().split('T')[0]);
    }

    const handleFetchTrips = async (queryDate: string) => {
        try {
            const tripsFetch = await FetchTrips(queryDate);

            if(tripsFetch) {
                const tripsData: TripProps[] = tripsFetch.data.map((t: any) => ({
                    trip_id: t.id,
                    vessel: t.trip.vessel.name,
                    route_origin: t.trip.route.origin,
                    route_destination: t.trip.route.destination,
                    departure_time: t.trip.departure_time,
                    vessel_id: t.trip.vessel_id,
                    route_id: t.trip.route_id,
                    mobile_code: t.trip.route.mobile_code,
                    web_code: t.trip.route.web_code,
                    code: t.trip.vessel.code,
                    departure: new Date(`1970-01-01T${t.trip.departure_time}`).toLocaleTimeString(
                        'en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                        }
                    )
                }))

                setTrips(tripsData);
                if(tripsData.length > 0) {
                    setBottomSheetTripID(tripsData?.[0].trip_id ?? null);
                }
            }
        }catch(error: any) {
            Alert.alert('Error', error.message);
        }finally{
            setContentLoading(false);
        }
    }

    const handleSaveTrip = (selectedTrip: string, trip_id: number, origin: string, destination: string, mobileCode: string, code: string, web_code: string, departureTime: string, vesselID: number) => {
        setLoading(true);            
        setTimeout(() => {
            if(trip != selectedTrip) {
                setTrip('');
                clearPassengers();
            }
    
            setTrip(selectedTrip);
            setID(trip_id);
            setVesselID(vesselID);
            setOrigin(origin);
            setDestination(destination);
            setMobileCode(mobileCode);
            setCode(code);
            setWebCode(web_code);
            setLoading(false);
            setDepartureTime(departureTime);
            router.push('/seatPlan');
        }, 100);
    }

    const toggleSheet = () => {
        handleFetchTotalBookings(bottomSheetTripID)
        setTotalSheetLoading(true);
        setExpanded(true);

        Animated.spring(translateY, {
            toValue: height / 9,
            useNativeDriver: true
        }).start();
        Animated.timing(fadeInAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
        }).start();
    }

    const closeToggle = () => {
        setExpanded(false);

        Animated.spring(translateY, {
            toValue: height + 50  ,
            useNativeDriver: true
        }).start();
        Animated.timing(fadeInAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true
        }).start();
    }

    const handleFetchTotalBookings = async (trip_id: number | null) => {
        try {
            if(!trip_id) return;
            const totalBookingFetch = await FetchTotalBookings(trip_id);

            if(!totalBookingFetch.error) {
                const totalBookingFetchData: TotalBookingProps[] = totalBookingFetch.data.map((t: any) => ({
                    station: t.station,
                    count: t.count,
                    color: t.color,
                    accommodationGroup: t.accommodations.map((a: any) => ({
                        accommodation: a.accommodation,
                        passenger: a.passenger.map((p: any) => ({
                            type: p.type,
                            passenger_count: p.passenger_count
                        }))
                    }))
                }));

                const totalBookingPaxTypes: PaxTypeProps[] = totalBookingFetch.paxTypes.map((p: any) => ({
                    paxTypeID: p.id,
                    paxType: p.passenger_types_code
                }));

                const totalBookingAccomTypes: AccommodationProps[] = totalBookingFetch.accommodationTypes.map((a: any) => ({
                    accomtTypeID: a.id,
                    accomType: a.name
                }));

                setTotalBookings(totalBookingFetchData);
                setPaxTypes(totalBookingPaxTypes);
                setAccomTypes(totalBookingAccomTypes);
            }
        }catch(error: any) {
            setTotalSheetLoading(false);
            Alert.alert('Error', error.message);
        }finally {
            setTotalSheetLoading(false);
        }
    }


    return (
        <View style={{ backgroundColor: '#f1f1f1', height: height, position: 'relative' }}>
            {calendar && (
                <Modal transparent animationType="slide" onRequestClose={() => setCalendar(false)} >
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <View style={{ width: '80%', backgroundColor: '#fff', padding: 20, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Select Date</Text>
                        <Calendar
                        // minDate={new Date().toISOString().split('T')[0]}
                        onDayPress={(day) => {
                            setTripDate(day.dateString); setCalendar(false),
                            handleOnDateSelect(day.dateString)
                        }}
                        markedDates={{ [tripDate ]: {selected: true, selectedColor: '#CF2A3A'} }} 
                        />
                        <TouchableOpacity onPress={() => setCalendar(false)} style={{ marginTop: 20, padding: 10, backgroundColor: '#CF2A3A', borderRadius: 5 }}>
                            <Text style={{ color: '#fff', textAlign: 'center' }}>Close Calendar</Text>
                        </TouchableOpacity>
                    </View>
                    </View>
                </Modal>
            )}
            <ScrollView refreshControl={ <RefreshControl refreshing={refresh} onRefresh={handleRefresh} colors={['#cf2a3a']} /> } >
                <View style={{ paddingTop: 30, height: 100, backgroundColor: '#cf2a3a', paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Manual Booking</Text>
                    <View style={{ flexDirection: 'row', gap: 15, alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => setCalendar(true)}>
                            <Ionicons name="calendar" size={25} color={'#fff'} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => toggleSheet()}>
                            <Ionicons name="list" size={30} color={'#fff'} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ padding: 20 }}>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Select Trip</Text>
                            <Text style={{ fontSize: 15, fontWeight: 'bold' }}>{formattedDate.split('(')[0]}</Text>
                        </View>
                        <Modal visible={loading} transparent animationType="fade">
                            <View style={{ backgroundColor: '#00000048', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <View style={{ height: height / 5, width: width - 100, backgroundColor: '#fff', borderRadius: 10, justifyContent :'center' }}>
                                    <ActivityIndicator size={'large'} color={'#cf2a3a'} />
                                </View>
                            </View>
                        </Modal>
                    </View>
                    <View>
                        {contentLoading == true ? (
                            <View style={{ height: height / 2, justifyContent: 'center' }}>
                                <ActivityIndicator size={'large'} color={'#cf2a3a'} />
                            </View>
                        ) : trips?.length == 0 ? (
                            <View style={{ height: height / 2, justifyContent: 'center' }}>
                                <Text style={{ color: '#7A7A85', textAlign: 'center' }}>No Available Trips</Text>
                            </View>
                        ) : (
                            <>
                            {trips?.map((trip) => (
                                <TouchableOpacity onPress={() => handleSaveTrip(trip.vessel, trip.trip_id, trip.route_origin, trip.route_destination, trip.mobile_code, trip.code, trip.web_code, trip.departure_time, trip.vessel_id)} key={trip.trip_id} style={{ paddingHorizontal: 15, paddingVertical: 20, backgroundColor: '#fff', borderRadius: 10, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <View>
                                        <Text style={{ fontWeight: 'bold', fontSize: 13, color: '#cf2a3a' }}>{`${trip.departure}`}</Text>
                                        <Text style={{ fontWeight: 'bold', fontSize: 13 }}>{`${trip.route_origin}  >  ${trip.route_destination} [ ${trip.vessel} ]`}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={18} />
                                </TouchableOpacity>
                            ))}
                            </>
                        )}
                    </View>
                </View>
            </ScrollView>
            {expanded && (
                <>
                    <Animated.View style={{ opacity: fadeInAnim, position: 'absolute' }}>
                        <TouchableOpacity onPress={() => closeToggle()} style={{ backgroundColor: '#00000065', width: width + 100, height: height, }} />
                    </Animated.View>
                </>
            )}
            <Animated.View style={{ height, position: 'absolute', bottom: 0, backgroundColor: '#fff', width: width, transform: [{ translateY }], borderTopRightRadius: 20, borderTopLeftRadius: 20 }}>
                <View style={{ padding: 10 }}>
                    {totalSheetLoading == true ? (
                        <View style={{ height: '80%', justifyContent: 'center', alignSelf: 'center' }}>
                            <ActivityIndicator size={'large'} color={'#cf2a3a'} />
                        </View>
                    ) : (
                        <>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Available Trips</Text>
                                <TouchableOpacity onPress={() => closeToggle()} style={{ alignSelf:'flex-end' }}>
                                    <Ionicons name={'chevron-down'} size={30} color={'#cf2a3a'} />
                                </TouchableOpacity>
                            </View>
                            {trips && trips?.length > 0 ? (
                                <>
                                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 10 }}>
                                        {trips?.map((trip) => (
                                            <TouchableOpacity onPress={() => {setTotalSheetLoading(true), setBottomSheetTripID(trip.trip_id), handleFetchTotalBookings(trip.trip_id)}} key={trip.trip_id} style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: bottomSheetTripID == trip.trip_id ? '#cf2a3a' : '#fff', borderRadius: 5, marginTop: 12, flexDirection: 'row', alignItems: 'center', borderColor: '#cf2a3a', borderWidth: 1 }}>
                                                <View style={{ flexDirection: 'row', alignItems: "center", gap: 5 }}>
                                                    <Text style={{ fontWeight: 'bold', fontSize: 12, color:  bottomSheetTripID == trip.trip_id ? '#fff' : '#000' }}>{`${trip.mobile_code} [ ${trip.code} ]`}</Text>
                                                    <Text style={{ fontWeight: 'bold', fontSize: 13, color:  bottomSheetTripID == trip.trip_id ? '#fff' : '#cf2a3a' }}>{`${trip.departure}`}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                    <View style={{ marginTop: 20 }}>
                                        <Text style={{ fontWeight: 'bold', paddingBottom: 10, fontSize: 18, color: '#cf2a3a', marginBottom: 10, borderBottomColor: '#b4b4b4ff', borderBottomWidth: 1 }}>30 TOTAL PAYING PASSENGERS</Text>
                                        <View style={{ gap: 15 }}>
                                            {totalBookings?.map((tb, index) => (
                                                <View key={index} style={{ paddingBottom: 10, borderBottomColor: '#b4b4b4ff', borderBottomWidth: 1 }}>
                                                    <View>
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                                            <View style={{ backgroundColor: tb.color, height: 15, width: 15 }} />
                                                            <Text style={{ fontWeight: 'bold', fontSize: 17 }}>{tb.station}</Text>
                                                            <Text style={{ color: '#5c5c5cff', fontSize: 12 }}>{`[${tb.count} paying passenger/s]`}</Text>
                                                        </View>
                                                    </View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 5 }}>
                                                        {accomTypes?.map((accomType) => (
                                                            <View key={accomType.accomtTypeID} style={{ flexDirection: 'column', width: '50%' }}>
                                                                <Text style={{ fontWeight: 'bold' }}>{accomType.accomType}</Text>

                                                                {tb.accommodationGroup
                                                                .filter((accomTypeGroup) => accomTypeGroup.accommodation == accomType.accomType)
                                                                .map((accom, accomIndex) => (
                                                                    <View key={accomIndex}>
                                                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                                                            {paxTypes?.map((type) => {
                                                                                const matches = accom.passenger.filter((pax) => pax.type == type.paxType);
                                                                                if(matches.length < 1) return null;

                                                                                return (
                                                                                    <View key={type.paxTypeID}>
                                                                                        {accom.passenger
                                                                                        .filter((pax) => pax.type == type.paxType)
                                                                                        .map((p, pIndex) => (
                                                                                            <View key={pIndex} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                                                <Text style={{ color: '#5c5c5cff', fontSize: 12 }}>{p.type}: </Text>
                                                                                                <Text style={{ color: '#5c5c5cff', fontSize: 12 }}>{p.passenger_count}</Text>
                                                                                            </View>
                                                                                        ))}
                                                                                    </View>
                                                                                )
                                                                            })}
                                                                        </View>
                                                                    </View>
                                                                ))}
                                                            </View>
                                                        ))}
                                                    </View>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                </>
                            ) : (
                                <View style={{ height: '80%', justifyContent: 'center' }}>
                                    <Text style={{ color: '#7A7A85', textAlign: 'center' }}>No Available Trips</Text>
                                </View>
                            )}
                        </>
                    )}
                </View>
            </Animated.View>
        </View>
    )
}