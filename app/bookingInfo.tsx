import { FetchPaxBookingInfo } from '@/api/paxBookingInfo';
import { FetchTrips } from '@/api/trips';
import { useCargo } from '@/context/cargoProps';
import { usePassengers } from '@/context/passenger';
import { useTrip } from '@/context/trip';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Dropdown } from 'react-native-element-dropdown';
import { Checkbox } from 'react-native-paper';
import { bookingStatuses } from './(tabs)/manage-booking';
import { TripProps } from './(tabs)/manual-booking';



const { height, width } = Dimensions.get('screen');


type PaxInfo = {
    id?: number;
    first_name?: string;
    last_name?: string;
    age?: number;
    gender?: string;
    address?: string;
    nationality?: string;
    contactNo?: string;
    tripId: number;
    departureDate?: string;
    departureTime?: string;
    departureISO?: string;
    route?: string;
    mobileCode: string;
    webCode: string;
    routeId: number;
    origin: string;
    destination: string;
    vessel?: string;
    vesselId: number;
    vesselCode: string;
    referenceNumber?: string;
    bookingStatus?: number;
    tripStatus: string;
    seatNumber: string;
    passengerTypeId: number;
    passenger_type: string;
    accommodation: string;
    accommodationTypeId: number;
    station?: string;
    fare?: number;
    bookingType: string;
    isCargoable: number;
    forCancel?: boolean;
}

type TripInfo = {
    vessel: string;
    id: number;
    vesselID: number;
    routeID: number;
    origin: string;
    destination: string;
    mobileCode: string;
    code: string;
    webCode: string;
    loading: boolean;
    departureTime: string;
    isCargoable: number;
};

const tabs = [
    { id: 1, name: 'Passengers' },
    { id: 2, name: 'Cargo' }
]


export default function BookingInfo() {
    const { cargoProperties, paxCargoProperty } = useCargo();
    const { setPassengers, clearPassengers } = usePassengers();
    const { setRouteID, setVessel, setID, setOrigin, setDestination, setVesselID, setCode, setWebCode, setDepartureTime, setMobileCode, setIsCargoable } = useTrip();
    const { bookingId, paxId, refNum } = useLocalSearchParams();
    const [ loading, setLoading ] = useState(true);
    const [ paxInfo, setPaxInfo ] = useState<PaxInfo[]>([]);
    const [trips, setTrips] = useState<TripProps[] | null>(null);
    const [tripInfo, setTripInfo] = useState<TripInfo | null>(null)
    const [formTab, setFormTab] = useState('Passengers');
    const [toggleOption, setToggleOption] = useState(false);
    const [type, setType] = useState('');
    const [totalFare, setTotalFare] = useState(0);
    const [proceedLoading,  setProceedLoading] = useState(false);
    const [cancelModal, setCancelModal] = useState(false);
    const [reschedModal, setReschedModal] = useState(false);
    const [selectAll, setSelectAll] = useState(true);
    const [tripDate, setTripDate] = useState('');
    const [formattedDate, setFormattedDate] = useState('');
    const [reschedLoading, setReschedLoading] = useState(true)
    const [calendar, setCalendar] = useState(false)


    useFocusEffect(
        useCallback(() => {
            clearPassengers()
            handleFetchInfo();
        }, [])

    )

    useEffect(() => {
        const notForCancel = paxInfo.some(p => p.forCancel != true);

        if(notForCancel) {
            setSelectAll(false);
        }else {
            setSelectAll(true)
        }
    }, [paxInfo.some(p => p.forCancel)])

    const handleOnResched = () => {
        setReschedModal(true)
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

        handleFetchTrips(today)
    }

    const handleFetchTrips = async (queryDate: string) => {
        try {
            const tripsFetch = await FetchTrips(queryDate)
            let tripStatus = '';

            function verifyTime(timeString: string, specificDay: string) {
                tripStatus = '';
                const currentTime = new Date();
                const toISODate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' })

                if (toISODate != specificDay) return tripStatus = 'scheduled';
                
                const [hours, minutes] = timeString.split(':').map(Number);
                const tripTime = new Date(currentTime);
                tripTime.setHours(hours, minutes, 0, 0);
                
                const departureAllowance = new Date(tripTime);
                departureAllowance.setHours(departureAllowance.getHours() + 1);

                return tripStatus = currentTime > departureAllowance ? 'departed' : 'scheduled'
            }

            if(tripsFetch) {
                const tripsData: TripProps[] = tripsFetch.data.map((t: any) => ({
                    trip_id: t.id,
                    vessel: t.trip.vessel.name,
                    specific_days: t.specific_days,
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
                    ),
                    isCargoable: t.trip.vessel.is_cargoable,
                    hasDeparted: (verifyTime(t.trip.departure_time, t.specific_days), tripStatus == 'departed' ? true : false)
                }))

                setTrips(tripsData);
            }
        }catch(error: any) {
            Alert.alert('Error', error.message);
        }finally{
            setReschedLoading(false);
        }
    }

    const handleOnTripSelect = (vesselName: string, trip_id: number, routeId: number, origin: string, destination: string, mobileCode: string, code: string, web_code: string, departureTime: string, vesselID: number, cargoable: number) => {
        setTripInfo({
            vessel: vesselName,
            id: trip_id,
            vesselID: vesselID,
            routeID: routeId,
            origin: origin,
            destination: destination,
            mobileCode: mobileCode,
            code: code,
            webCode: web_code,
            loading: false,
            departureTime: departureTime,
            isCargoable: cargoable
        });    
    }

    const handleReschedProceed = () => {
        setVessel(tripInfo.vessel);
        setID(tripInfo.id);
        setVesselID(tripInfo.vesselID);
        setRouteID(tripInfo.routeID)
        setOrigin(tripInfo.origin);
        setDestination(tripInfo.destination);
        setMobileCode(tripInfo.mobileCode);
        setCode(tripInfo.code);
        setWebCode(tripInfo.webCode);
        setDepartureTime(tripInfo.departureTime);
        setIsCargoable(tripInfo.isCargoable);
        
        setTimeout(() => {
            for(const pax of paxInfo) {
                setPassengers(prev => [...prev, {
                    id: String(pax.id), name: `${pax.last_name}, ${pax.first_name}`, age: pax.age, gender: pax.gender, nationality: pax.nationality, address: pax.address,
                    contact: pax.contactNo, seatNumber: '', hasScanned: true
                }])
            }

            setProceedLoading(false);
            router.push('/seatPlan')
        }, 600);
    }

    const handleOnDateSelect = (selectedDate: string) => {
        setReschedLoading(true);
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
        
        const dateSelected = new Date(selectedDate).toISOString().split('T')[0]
        setFormattedDate(queryDate);
        handleFetchTrips(dateSelected);
    }

    const handleFetchInfo = async () => {
        try {
            const response = await FetchPaxBookingInfo(Number(bookingId), Number(paxId), String(refNum));
            console.log(bookingId, paxId, refNum)

            if(!response.error) {
                const paxData: PaxInfo[] = response.data.map((pax: any) => ({
                    id: pax.id,
                    first_name: pax.first_name,
                    last_name: pax.last_name,
                    age: pax.age,
                    gender: pax.gender,
                    address: pax.address,
                    nationality: pax.nationality,
                    contactNo: pax.bookings[0].contact_number,
                    tripId: pax.bookings[0].trip_schedule_id,
                    departureDate: new Date(pax.bookings.find((c: any) => c.created_at).created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }),
                    departureTime: new Date(`1970-01-01T${pax.bookings.find((t: any) => 
                        t.trip_schedule)?.trip_schedule.trip.departure_time}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    }),
                    departureISO: pax.bookings[0].trip_schedule.trip.departure_time,
                    routeId: pax.bookings[0].trip_schedule.trip.route_id,
                    origin: pax.bookings[0].trip_schedule.trip.route.origin,
                    destination: pax.bookings[0].trip_schedule.trip.route.destination,
                    route: `${pax.bookings[0].trip_schedule.trip.route.origin} - ${pax.bookings[0].trip_schedule.trip.route.destination}`,
                    // station: pax.
                    mobileCode: pax.bookings[0].trip_schedule.trip.route.mobile_code,
                    webCode: pax.bookings[0].trip_schedule.trip.route.web_code,
                    vessel: pax.bookings[0].trip_schedule.trip.vessel.name,
                    vesselId: pax.bookings[0].trip_schedule.trip.vessel.id,
                    vesselCode: pax.bookings[0].trip_schedule.trip.vessel.code,
                    referenceNumber: pax.bookings[0].reference_no,
                    bookingStatus: pax.bookings[0]?.status_id ?? 0,
                    tripStatus: pax.bookings[0].trip_schedule.status,
                    seatNumber: pax.bookings[0].pivot.seat_no,
                    passenger_type: pax.passenger_type.name,
                    passengerTypeId: pax.passenger_type.id,
                    accommodation: pax.accommodation_type[0]?.name,
                    accommodationTypeId: pax.accommodation_type[0]?.id,
                    fare: pax.fares[0]?.fare ? pax.fares[0]?.fare : pax.bookings.find((r: any) => r.pivot)?.pivot?.fare,
                    bookingType: pax.bookings[0].type_id,
                    isCargoable: pax.bookings[0].trip_schedule.trip.vessel.is_cargoable
                })) 


                setPaxInfo(paxData)
                setTotalFare(
                    paxData.reduce((sum, passenger) => sum + Number(passenger?.fare), 0)
                )
            }
        }catch(error: any) {
            Alert.alert('Error', error.message);
        }finally {
            setTimeout(() => {
                setLoading(false)
            }, 200);
        }
    }

    const handleProceedBooking = () => {
        setProceedLoading(true);

        setID(paxInfo[0].tripId);
        setVessel(paxInfo[0].vessel);
        setVesselID(paxInfo[0].vesselId);
        setRouteID(paxInfo[0].routeId);
        setOrigin(paxInfo[0].origin);
        setDestination(paxInfo[0].destination)
        setMobileCode(paxInfo[0].mobileCode);
        setWebCode(paxInfo[0].webCode);
        setCode(paxInfo[0].vesselCode);
        setDepartureTime(paxInfo[0].departureISO);
        setIsCargoable(paxInfo[0].isCargoable);
        // setLoading(false);

        setTimeout(() => {
            for(const pax of paxInfo) {
                setPassengers(prev => [...prev, {
                    id: String(pax.id), name: `${pax.last_name}, ${pax.first_name}`, age: pax.age, gender: pax.gender, nationality: pax.nationality, address: pax.address,
                    contact: pax.contactNo, seatNumber: '', accommodation: pax.accommodation, fare: pax.fare,
                    accommodationID: pax.accommodationTypeId, passType: pax.passenger_type, passType_id: pax.passengerTypeId, hasScanned: true
                }])
            }

            setProceedLoading(false);
            router.push('/seatPlan')
        }, 600);
        
    }

    const handleOnCancelModal = () => {
        setPaxInfo(prev => (
            prev.map(p => ({ ...p, forCancel: true }))
        ))

        setCancelModal(true)
    }

    const handleSelectAll = () => {
        setSelectAll(!selectAll);

        setPaxInfo(prev => (
            prev.map(p => ({ ...p, forCancel: !selectAll }))
        ))
    }

    const handleCancelPax = (paxId: number) => {
        setPaxInfo(prev => (
            prev.map(p => p.id == paxId ? ({ ...p, forCancel: !p.forCancel }) : p)
        ))
    }


    return (
        <View style={{ flex: 1, backgroundColor: '#fafafa' }}>
            <View style={styles.headerContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Pressable onPress={() => router.back()}>
                        <Ionicons name={'arrow-back'} size={24} color={'#fff'} />
                    </Pressable>
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Booking Details</Text>
                </View>
            </View>
            {loading == true ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size={'large'} color={'#cf2a3a'} />
                </View>
            ) : (
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, paddingVertical: 20, gap: 15 }}>
                    <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
                        <View style={[styles.card, { padding: 10, gap: 12 }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                    <Ionicons name={'person'} color={'#fff'} size={22} style={{ padding: 10, backgroundColor: '#cf2a3a', borderRadius: 50 }} />
                                    <View style={{ width: '55%' }}>
                                        <Text style={{ fontWeight: '600', fontSize: 16 }}>{`${paxInfo.find((p: any) => p.id == Number(paxId))?.first_name} ${paxInfo.find((p: any) => p.id == Number(paxId))?.last_name}`}</Text>
                                        <Text style={{ color: '#cf2a3a', fontSize: 10, fontWeight: '900' }}>{paxInfo.find((p: any) => p.id == Number(paxId))?.referenceNumber}</Text>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                                    <Text style={{ color: '#646464', fontSize: 9, fontWeight: '700' }}>Booking status</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, borderColor: bookingStatuses?.find(s => s.id == paxInfo[0]?.bookingStatus)?.color ?? 'transparent',
                                            backgroundColor: bookingStatuses?.find(s => s.id == paxInfo[0]?.bookingStatus)?.bgColor ?? 'transparent', borderWidth: 1, padding: 3, borderRadius: 5 }}>
                                        <MaterialCommunityIcons name={bookingStatuses?.find(s => s.id == paxInfo[0]?.bookingStatus)?.icon as any ?? ''} size={14} color={bookingStatuses.find(s => s.id == paxInfo[0]?.bookingStatus)?.color ?? 'transparent'} />
                                        <Text style={{ fontWeight: '800', color: bookingStatuses?.find(s => s.id == paxInfo[0]?.bookingStatus)?.color ?? 'transparent', fontSize: 10 }}>{bookingStatuses?.find(s => s.id == paxInfo[0]?.bookingStatus)?.label ?? ''}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.fareContainer}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                    <View style={{ flexDirection: 'column' }}>
                                        <Text style={{ color: '#646464', fontSize: 8 }}>Seat#</Text>
                                        <Text style={{ fontWeight: '700', fontSize: 12 }}>{paxInfo.find((p: any) => p.id == Number(paxId))?.seatNumber ?? '--'}</Text>
                                    </View>
                                    <Text style={{ fontSize: 22, color: '#b6b6b6' }}>|</Text>
                                    <View style={{ flexDirection: 'column' }}>
                                        <Text style={{ color: '#646464', fontSize: 8 }}>Type</Text>
                                        <Text style={{ fontWeight: '700', fontSize: 12 }}>{paxInfo.find((p: any) => p.id == Number(paxId))?.passenger_type}</Text>
                                    </View>
                                    <Text style={{ fontSize: 22, color: '#b6b6b6' }}>|</Text>
                                    <View style={{ flexDirection: 'column' }}>
                                        <Text style={{ color: '#646464', fontSize: 8 }}>Accommodation</Text>
                                        <Text style={{ fontWeight: '700', fontSize: 12 }}>{paxInfo.find((p: any) => p.id == Number(paxId))?.accommodation}</Text>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <Text style={{ color: '#646464', fontSize: 10 }}>Fare</Text>
                                    <Text style={{ color: '#cf2a3a', fontWeight: '800', fontSize: 16 }}>₱ {Number(paxInfo.find((p: any) => p.id == Number(paxId))?.fare).toFixed(2)}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.card}>
                            <Text style={{ fontWeight: 'bold', padding: 10, borderBottomColor: '#dadada', borderBottomWidth: 1, }}>Booking Information</Text>
                            <View style={{ paddingHorizontal: 10, paddingBottom: 10 }}>
                                <View style={styles.bookingContainer}>
                                    <Text style={{ color: '#646464', fontSize: 13, }}>Booking Type</Text>
                                    <Text style={{ fontSize: 13, fontWeight: '700' }}>{paxInfo.find((p: any) => p.id == Number(paxId))?.bookingType}</Text>
                                </View>
                                <View style={styles.bookingContainer}>
                                    <Text style={{ color: '#646464', fontSize: 13, }}>Vessel</Text>
                                    <Text style={{ fontSize: 13, fontWeight: '700' }}>{paxInfo.find((p: any) => p.id == Number(paxId) )?.tripId}</Text>
                                </View>
                                <View style={styles.bookingContainer}>
                                    <Text style={{ color: '#646464', fontSize: 13, }}>Route</Text>
                                    <Text style={{ fontSize: 13, fontWeight: '700' }}>{paxInfo.find((p: any) => p.id == Number(paxId) )?.id}</Text>
                                </View>
                                <View style={styles.bookingContainer}>
                                    <Text style={{ color: '#646464', fontSize: 13, }}>Station</Text>
                                    <Text style={{ fontSize: 13, fontWeight: '700' }}>{paxInfo.find((p: any) => p.id == Number(paxId) )?.route}</Text>
                                </View>
                                <View style={styles.bookingContainer}>
                                    <Text style={{ color: '#646464', fontSize: 13, }}>Departure Date</Text>
                                    <Text style={{ fontSize: 13, fontWeight: '700' }}>{paxInfo.find((p: any) => p.id == Number(paxId) )?.departureDate}</Text>
                                </View>
                                <View style={styles.bookingContainer}>
                                    <Text style={{ color: '#646464', fontSize: 13, }}>Departure Time</Text>
                                    <Text style={{ fontSize: 13, fontWeight: '700' }}>{paxInfo.find((p: any) => p.id == Number(paxId) )?.departureTime}</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 12, backgroundColor: '#cf2a3b27', borderBottomRightRadius: 6, borderBottomLeftRadius: 6 }}>
                                <Text style={{ color: '#cf2a3a', fontSize: 13, fontWeight: '800' }}>Total Amount</Text>
                                <Text style={{ fontSize: 16, fontWeight: '800', color: '#cf2a3a' }}>₱ {totalFare.toFixed(2)}</Text>
                            </View>
                        </View>


                        <View>
                            <View style={styles.tabs}>
                                {tabs.map((t: any) => (
                                    <Pressable onPress={() => setFormTab(t?.name)} key={t.id} style={{ backgroundColor: formTab == t?.name ? '#f1f1f1' : 'transparent', padding: 9, borderRadius: 5  }}>
                                        <Text style={{ color: formTab == t?.name ? '#cf2a3a' : '#646464' }}>{t?.name}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                        {formTab == 'Passengers' ? (
                            <View style={[styles.card,  { marginTop: 10 }]}>
                                <Text style={{ padding: 10, borderBottomColor: '#dadada', borderBottomWidth: 1, fontWeight: 'bold' }}>Passenger/s</Text>
                                {paxInfo.map((pax: any) =>(
                                    <View key={pax.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Ionicons name={'person'} color={'#fff'} size={18} style={{ padding: 10, backgroundColor: '#cf2a3a', borderRadius: 50, marginRight: 10 }} />
                                            <View style={{ flexDirection: 'column', width: '65%' }}>
                                                <Text style={{ fontSize: 14, fontWeight: '700' }}>{`${pax.first_name} ${pax.last_name}`}</Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                                    <Text style={{ fontSize: 10, color: '#646464', fontWeight: '600' }}>{pax?.seatNumber != 'N/A' ? `Seat# ${pax?.seatNumber}` : '---'}</Text>
                                                    <Text style={{ fontSize: 10, color: '#646464' }}>|</Text>
                                                    <Text style={{ fontSize: 10, color: '#646464', fontWeight: '600' }}>{pax?.passenger_type}</Text>
                                                    <Text style={{ fontSize: 10, color: '#646464' }}>|</Text>
                                                    <Text style={{ fontSize: 10, color: '#646464', fontWeight: '600' }}>{pax?.accommodation}</Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                                            <Text style={{ color: '#646464', fontSize: 12, }}>Fare</Text>
                                            <Text style={{ fontSize: 14, fontWeight: '800', color: '#cf2a3a' }}>₱ {Number(pax?.fare).toFixed(2)}</Text>
                                        </View>
                                    </View>
                                ))}

                            </View>
                        ) : (
                            <View style={{ marginBottom: 15 }}>
                                <View style={[styles.card, { marginTop: 10 }]}>
                                    <View style={{ position: 'relative', paddingHorizontal: 10, paddingVertical: 8, borderBottomColor: '#dadada', borderBottomWidth: 1 }}>
                                        <Text style={{ fontWeight: 'bold' }}>Cargo</Text>
                                    </View>
                                    {paxCargoProperty.length > 0 ? (
                                        <>
                                            <View style={{ paddingVertical: 10 }}>
                                                {paxCargoProperty.map((c: any) => (
                                                    <View key={c.id} style={{ width: '90%', alignSelf: 'center' }}>
                                                        <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Brand:</Text>
                                                        <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                                            <Dropdown onChange={(item) => setType(item)} value={c.cargoBrandID} data={cargoProperties?.data.brands.map((b: any) => ({ label: b?.name, value: b.id }))}
                                                                labelField="label" valueField="value" placeholder="Select Brand" style={{ height: 40, width: '100%', paddingHorizontal: 10 }}
                                                                containerStyle={{
                                                                    alignSelf: 'flex-start',
                                                                    width: '79%',
                                                                }}
                                                                selectedTextStyle={{ fontSize: 14, lineHeight: 35, }}
                                                                renderRightIcon={() => (
                                                                    <Ionicons name="chevron-down" size={15} />
                                                                )}
                                                                dropdownPosition="bottom"
                                                                renderItem={(item) => (
                                                                    <View style={{ width: '80%', padding: 8 }}>
                                                                        <Text>{item.label}</Text>
                                                                    </View>
                                                                )}
                                                            />
                                                        </View>
                                                    </View>
                                                ))}
                                            </View>
                                        </>
                                    ) : (
                                        <View style={{ flexDirection: 'column', paddingVertical: 10, justifyContent: 'center', alignItems: 'center' }}>
                                            <Ionicons name={'close-circle'} size={30} color={'#c7c7c7'} />
                                            <Text style={{ fontSize: 10, color: '#646464' }}>No cargo record</Text>
                                        </View>
                                    )}
                                </View>
                                <Pressable style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8, backgroundColor: '#fff', elevation: 2 }}
                                    onPress={() => setToggleOption(!toggleOption)}>
                                    <Ionicons name={'add'} color={'#cf2a3a'} size={20} />
                                    <Text style={{ color: '#cf2a3a', fontWeight: '600' }}>Add Cargo</Text>
                                </Pressable>
                            </View>
                        )}
                    </ScrollView>
                    <View style={{ paddingVertical: 10, borderTopColor: '#dadada', borderTopWidth: 1 }}>
                        {bookingStatuses?.find(s => s.id == paxInfo[0]?.bookingStatus)?.label.toLowerCase() != 'pending' && bookingStatuses?.find(s => s.id == paxInfo[0]?.bookingStatus)?.label.toLowerCase() != 'cancelled' && (
                            <View style={styles.requestsContainer}>
                                <Pressable style={[styles.requestsBtn, { backgroundColor: '#FCCA03' }]}>
                                    <Ionicons name={'reload'} size={16} />
                                    <Text style={{ fontWeight: '800', fontSize: 13 }}>Reschedule Booking</Text>
                                </Pressable>
                                <Pressable onPress={() => handleOnCancelModal()} style={[styles.requestsBtn, { backgroundColor: '#cf2a3a' }]}>
                                    <MaterialCommunityIcons name={'cancel'} color={'#fff'} size={16} />
                                    <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>Cancel Booking</Text>
                                </Pressable>
                            </View>
                        )}
                        {bookingStatuses?.find(s => s.id == paxInfo[0]?.bookingStatus)?.label.toLowerCase() == 'pending' && bookingStatuses?.find(s => s.id == paxInfo[0]?.bookingStatus)?.label.toLowerCase() != 'cancelled'  && (
                            <Pressable  onPress={() => handleProceedBooking()} disabled={proceedLoading} style={[styles.requestsBtn, { backgroundColor: '#cf2a3a', width: '90%', alignSelf: 'center' }]}>
                                {proceedLoading == true ? (
                                    <ActivityIndicator size={'small'} color={'#fff'} style={{ alignSelf: 'center' }} />
                                ) : (
                                    <Text style={{ color: '#fff', fontWeight: '800' }}>Select Seat</Text>
                                )}
                            </Pressable>
                        )}
                    </View>
                </KeyboardAvoidingView>
            )}
            <Modal transparent animationType={'fade'} visible={cancelModal}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <View style={{ width: '92%', backgroundColor: '#fff', borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10, paddingHorizontal: 20, paddingVertical: 15, borderBottomColor: '#dadada', borderBottomWidth: 1 }}>Cancellation Request</Text>
                        <View style={{ paddingHorizontal: 20, }}>
                            <Text style={{ fontWeight: '600', marginBottom: 5 }}>Reason of Cancellation</Text>
                            <View style={{ height: 100, borderColor: '#dadada', borderWidth: 1, borderRadius: 8 }}>
                                <TextInput placeholder='Enter reason' />
                            </View>
                        </View>
                        <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomColor: '#dadada', borderBottomWidth: 1 }}>
                                <Text style={{ color: '#5a5a5a' }}>Passenger/s</Text>
                                <TouchableOpacity onPress={() => handleSelectAll()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Checkbox status={selectAll ? 'checked' : 'unchecked'} color='#cf2a3a' uncheckedColor="#999" />
                                    <Text style={{ color: selectAll ? '#cf2a3a' : '#999' }}>Select All</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 }}>
                                {paxInfo.map((p: any) => (
                                    <TouchableOpacity key={p.id} onPress={() => handleCancelPax(p.id)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Checkbox status={p.forCancel == true ? 'checked' : 'unchecked'} color='#cf2a3a' uncheckedColor="#999" />
                                        <Text style={{ color: p.forCancel == true ? '#cf2a3a' : '#999' }}>{`${p.first_name} ${p.last_name}`}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
                            <TouchableOpacity style={{ marginTop: 30, padding: 10, backgroundColor: '#CF2A3A', borderRadius: 5 }}>
                                <Text style={{ color: '#fff', textAlign: 'center' }}>Submit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setCancelModal(false)} style={{ marginTop: 10, alignSelf: 'center' }}>
                                <Text style={{ color: '#cf2a3a', textAlign: 'center' }}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal transparent animationType={'fade'} visible={reschedModal}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <View style={{ width: '92%', backgroundColor: '#fff', borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 }}>
                        {reschedLoading == true ? (
                            <View>
                                <ActivityIndicator size={'large'} color={'#cf2a3a'} style={{ alignSelf: 'center' }} />
                            </View>
                        ) : (
                            <>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingHorizontal: 20, paddingVertical: 15, borderBottomColor: '#dadada', borderBottomWidth: 1 }}>
                                    <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Reschedule Trip</Text>
                                    <TouchableOpacity onPress={() => setCalendar(true)}>
                                        <Ionicons name={'calendar'} size={25} color={'#cf2a3a'} />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ paddingHorizontal: 20, }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Text style={{ fontWeight: '600', marginBottom: 5 }}>Select Trip</Text>
                                        <Text style={{ fontWeight: '600', fontSize: 12, marginBottom: 5 }}>{formattedDate}</Text>
                                    </View>
                                    {trips.length < 1 && (
                                        <View style={{ padding: 10 }}>
                                            <Text style={{ alignSelf: 'center', color: '#adadad' }}>No trip available</Text>
                                        </View>
                                    )}
                                    { trips && trips.filter(t => t.hasDeparted == false).map((trip) => (
                                        <TouchableOpacity onPress={() => handleOnTripSelect(trip.vessel, trip.trip_id, trip.route_id, trip.route_origin, trip.route_destination, trip.mobile_code, trip.code, trip.web_code, trip.departure_time, trip.vessel_id, trip.isCargoable)}
                                            key={trip.trip_id} style={{ paddingHorizontal: 10, paddingVertical: 12, backgroundColor: tripInfo.id == trip.trip_id ? '#cf2a3a' : '#fff', borderColor: '#adadad', borderWidth: 1, borderRadius: 10, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <View style={{ width: '78%' }}>
                                                <Text style={{ fontWeight: 'bold', fontSize: 11, color: tripInfo.id == trip.trip_id ? '#fff' : '#cf2a3a' }}>{`${trip.departure}`}</Text>
                                                <Text style={{ fontWeight: 'bold', fontSize: 11, color: tripInfo.id == trip.trip_id ? '#fff' : '#000' }}>{`${trip.route_origin}  >  ${trip.route_destination} [ ${trip.vessel} ]`}</Text>
                                            </View>
                                            <Ionicons name="chevron-forward" size={18} color={tripInfo.id == trip.trip_id ? '#fff' : '#000'} />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
                                </View>
                                <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
                                    <TouchableOpacity onPress={() => handleReschedProceed()} style={{ marginTop: 30, padding: 10, backgroundColor: '#CF2A3A', borderRadius: 5 }}>
                                        <Text style={{ color: '#fff', textAlign: 'center' }}>Proceed</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => {setReschedModal(false), setTripInfo(null)}} style={{ marginTop: 10, alignSelf: 'center' }}>
                                        <Text style={{ color: '#cf2a3a', textAlign: 'center' }}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
            {calendar && (
                <Modal transparent animationType="slide" onRequestClose={() => setCalendar(false)} >
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                        <View style={{ width: '80%', backgroundColor: '#fff', padding: 20, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Select Date</Text>
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
        </View>
    )
}


const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: '#cf2a3a',
        height: 100,
        paddingHorizontal: 20,
        paddingTop: 50,
        position: 'relative'
    },
    loadingContainer: {
        height: height - 150,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        borderColor: "#dadada",
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 20,
    },
    fareContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        backgroundColor: '#f1f1f1',
        padding: 8,
        borderRadius: 8
    },
    bookingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 10
    },
    tabs: {
        flexDirection: 'row',
        alignSelf: 'center',
        backgroundColor: '#fff',
        justifyContent: 'center',
        padding: 5,
        borderRadius: 8,
        gap: 5,
        borderColor: "#dadada",
        borderWidth: 1,
    },
    optionContainer: {
        position: 'absolute',
        backgroundColor: '#fff',
        padding: 10,
        width: 150,
        flexDirection: 'column',
        gap: 5,
        elevation: 2,
        right: 10,
        top: 30,
        zIndex: 10,
        borderRadius: 5
    },
    requestsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    requestsBtn: {
        paddingHorizontal: 10,
        paddingVertical: 15,
        justifyContent: 'center',
        borderRadius: 8,
        elevation: 2,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3
    },
    input: {
        width: 100,
        fontSize: 16,
        height: 40,
        backgroundColor: '#fafafa',
        textAlign: 'right',
        paddingHorizontal: 3,
        borderColor: '#fafafa'
    },
})