import { FetchTrips } from "@/api/trips";
import { usePassengers } from "@/context/passenger";
import { useTrip } from "@/context/trip";
import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, Modal, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from 'react-native-calendars';

const { height, width } = Dimensions.get('screen');

type TripProps = {
    trip_id: number;
    vessel: string;
    route_origin: string;
    route_destination: string;
    departure_time: string;
    vessel_id: number;
    route_id: number;
    code: string;
    web_code: string;
}

export default function ManualBooking() {
    const { trip, setTrip, setID, setOrigin, setDestination, setVesselID, setCode, setWebCode, setDepartureTime } = useTrip();
    const { clearPassengers } = usePassengers();
    const [trips, setTrips] = useState<TripProps[] | null>(null);
    const [contentLoading, setContentLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [calendar, setCalendar] = useState(false);
    const [tripDate, setTripDate] = useState('');


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

        handleFetchTrips(queryDate);
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

        
            handleFetchTrips(queryDate);
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

    
        handleFetchTrips(queryDate);
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
                    code: t.trip.route.mobile_code,
                    web_code: t.trip.route.web_code
                }))

                setTrips(tripsData);
            }
        }catch(error: any) {
            Alert.alert('Error', error.message);
        }finally{
            setContentLoading(false);
        }
    }

    const handleSaveTrip = (selectedTrip: string, trip_id: number, origin: string, destination: string, code: string, web_code: string, departureTime: string, vesselID: number) => {
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
            setCode(code);
            setWebCode(web_code);
            setLoading(false);
            setDepartureTime(departureTime);
            router.push('/seatPlan');
        }, 200);
    }


    return (
        <View style={{ backgroundColor: '#f1f1f1' }}>
            {calendar && (
                <Modal transparent animationType="slide" onRequestClose={() => setCalendar(false)} >
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <View style={{ width: '80%', backgroundColor: '#fff', padding: 20, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 }}>
                        <View>
                            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Select Date</Text>
                            <Text>{tripDate}</Text>
                        </View>
                        <Calendar
                        minDate={new Date().toISOString().split('T')[0]}
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
            <ScrollView refreshControl={ <RefreshControl refreshing={refresh} onRefresh={handleRefresh} /> } >
                <View style={{ paddingTop: 30, height: 100, backgroundColor: '#cf2a3a', paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Manual Booking</Text>
                    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                        {/* <TouchableOpacity>
                            <Ionicons name="boat" size={25} color={'#FFC107'} />
                        </TouchableOpacity> */}
                        <TouchableOpacity onPress={() => setCalendar(true)}>
                            <Ionicons name="calendar" size={25} color={'#FFC107'} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ padding: 20 }}>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Select Trip</Text>
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
                                <TouchableOpacity onPress={() => handleSaveTrip(trip.vessel, trip.trip_id, trip.route_origin, trip.route_destination, trip.code, trip.web_code, trip.departure_time, trip.vessel_id)} key={trip.trip_id} style={{ paddingHorizontal: 15, paddingVertical: 25, backgroundColor: '#fff', borderRadius: 10, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text style={{ fontWeight: 'bold', fontSize: 13 }}>{`${trip.route_origin}  >  ${trip.route_destination} [${trip.vessel}]`}</Text>
                                    <Ionicons name="chevron-forward" size={18} />
                                </TouchableOpacity>
                            ))}
                            </>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}