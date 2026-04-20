import { FetchTrips } from '@/api/trips';
import { TripProps } from '@/app/(tabs)/manual-booking';
import { PaxInfo } from '@/app/bookingInfo';
import { usePassengers } from '@/context/passenger';
import { useTrip } from '@/context/trip';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Checkbox } from 'react-native-paper';


export type ReshcedTripInfo = {
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


const ReschedBooking = ({ reschedModal, setReschedModal, paxInfo, setPaxInfo, bookingId }: 
        { reschedModal: boolean;
        setReschedModal: React.Dispatch<React.SetStateAction<boolean>>; 
        paxInfo: PaxInfo[];
        setPaxInfo: React.Dispatch<React.SetStateAction<PaxInfo[]>> 
        bookingId,
    }) => {

    const [calendar, setCalendar] = useState(false);
    const { setRouteID, setVessel, setID, setOrigin, setDestination, setVesselID, setCode, setWebCode, setDepartureTime, setMobileCode, setBookingId,
            setIsCargoable, setForReschedule, setReschedAll } = useTrip();
    const { setPassengers } = usePassengers();
    const [loading, setLoading] = useState(true)
    const [trips, setTrips] = useState<TripProps[] | null>(null);
    const [reschedTripInfo, setReschedTripInfo] = useState<ReshcedTripInfo | null>(null)
    const [formattedDate, setFormattedDate] = useState('');
    const [tripDate, setTripDate] = useState('');
    const [selectAll, setSelectAll] = useState(false);
    const [proceedLoading, setProceedLoading] = useState(false);
    const [isNotProceedable, setIsNotProceedable] = useState(true)
    // const [isByMamangement, setIsByManagement] = useState(false);


    const availableTrips = useMemo(() => {
        if(trips && trips.length > 0) {
            const filteredTrips = trips.filter(t => t.trip_id != paxInfo[0].tripId);
            return filteredTrips;
        }

    }, [trips]);

    const handleOnDateSelect = useCallback((selectedDate: string) => {
        setLoading(true);
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
    }, [tripDate])

    const handleFetchTrips = useCallback(async (queryDate: string) => {
        try {
            const tripsFetched = await FetchTrips(queryDate)
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

            if(tripsFetched) {
                const tripsData: TripProps[] = tripsFetched.data.map((t: any) => ({
                    trip_id: t?.id,
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
                    hasDeparted: (verifyTime(t.trip.departure_time, t.specific_days), tripStatus == 'departed' ? true : false),
                }))

                setTrips(tripsData.filter(trip => trip.hasDeparted != true));
            }
        }catch(error: any) {
            Alert.alert('Error', error.message);
        }finally {
            setLoading(false)
        }
    }, [tripDate,trips])

    const handleReschedTripSelect = useCallback((vesselName: string, trip_id: number, routeId: number, origin: string, destination: string, mobileCode: string, code: string, web_code: string, departureTime: string, vesselID: number, cargoable: number) => {
        setReschedTripInfo({
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
            isCargoable: cargoable,
        });    
    }, [reschedTripInfo])

    const handleReschedProceed = () => {
        setProceedLoading(true);

        setBookingId(bookingId)
        setVessel(reschedTripInfo.vessel);
        setID(reschedTripInfo.id);
        setVesselID(reschedTripInfo.vesselID);
        setRouteID(reschedTripInfo.routeID)
        setOrigin(reschedTripInfo.origin);
        setDestination(reschedTripInfo.destination);
        setMobileCode(reschedTripInfo.mobileCode);
        setCode(reschedTripInfo.code);
        setWebCode(reschedTripInfo.webCode);
        setDepartureTime(reschedTripInfo.departureTime);
        setIsCargoable(reschedTripInfo.isCargoable);
        setForReschedule(true);
        
        setTimeout(() => {
            const selectedPax = paxInfo.filter(p => p.forResched == true);
            const newPax = selectedPax.map(pax => ({
                id: String(pax.id),
                name: `${pax.last_name}, ${pax.first_name}`,
                age: pax.age,
                gender: pax.gender,
                passType: pax.passenger_type,
                passType_id: pax.passengerTypeId,
                passTypeCode: pax.paxTypeCode,
                nationality: pax.nationality,
                address: pax.address,
                contact: pax.contactNo,
                seatNumber: '',
                forResched: true,
                fare: pax.fare
            }))

            setPassengers(prev => [
                ...prev.filter(p => p.forResched === true),
                ...newPax
            ]);

            setProceedLoading(false);
            router.push('/seatPlan')
        }, 600);
    }

    useEffect(() => {
        const forReschedPax = paxInfo.some(p => p.forResched == true);

        if(forReschedPax == false || reschedTripInfo == null || trips.length < 1) {
            setIsNotProceedable(true);
        }else {
            setIsNotProceedable(false);
        }
    }, [paxInfo, reschedTripInfo, trips]);

    useEffect(() => {
        const paxDepartureDate = paxInfo[0].dateIso;
        const today = new Date(paxDepartureDate).toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });

        setPassengers(prev => 
            prev.map(p => ({ ...p, forResched: false }))
        )

        handleOnDateSelect(today)
    }, [])

    useEffect(() => {
        const notForResched = paxInfo.some(p => p.forResched != true);
        setSelectAll(!notForResched)
        setReschedAll(!notForResched);
    }, [paxInfo]);

    const handleReschedPax = (paxId: number) => {
        setPaxInfo(prev => (
            prev.map(p => p.id == paxId ? ({ ...p, forResched: !p.forResched }) : p)
        ))
    }

    const handleSelectAll = () => {
        setSelectAll(!selectAll);
        setReschedAll(!selectAll)

        setPaxInfo(prev => (
            prev.map(p => ({ ...p, forResched: !selectAll }))
        ))
    }



    return (
        <View>
            {calendar && (
                <Modal transparent animationType="slide" onRequestClose={() => setCalendar(false)} >
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                        <View style={{ width: '80%', backgroundColor: '#fff', padding: 20, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000' }}>Select Date</Text>
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

            <Modal transparent animationType={'fade'} visible={reschedModal}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <View style={{ width: '92%', backgroundColor: '#fff', borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 }}>
                        {loading == true ? (
                            <View style={{ height: 80, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5 }}>
                                <ActivityIndicator size={'small'} color={'#cf2a3a'} style={{ alignSelf: 'center' }} />
                                <Text style={{ color: '#cf2a3a', fontSize: 16 }}>Fetching Trip</Text>
                            </View>
                        ) : (
                            <>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingHorizontal: 20, paddingVertical: 15, borderBottomColor: '#dadada', borderBottomWidth: 1 }}>
                                    <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#000' }}>Reschedule Trip</Text>
                                    <TouchableOpacity onPress={() => setCalendar(true)}>
                                        <Ionicons name={'calendar'} size={25} color={'#cf2a3a'} />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ paddingHorizontal: 20, }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Text style={{ fontWeight: '600', marginBottom: 5, color: '#000' }}>Select Trip</Text>
                                        <Text style={{ fontWeight: '600', fontSize: 12, marginBottom: 5, color: '#000' }}>{formattedDate}</Text>
                                    </View>
                                    {availableTrips && availableTrips.length < 1 && (
                                        <View style={{ padding: 10 }}>
                                            <Text style={{ alignSelf: 'center', color: '#adadad' }}>No trip available</Text>
                                        </View>
                                    )}
                                    {availableTrips && availableTrips.length > 0 && (
                                        <>
                                            {availableTrips && availableTrips.filter(t => t.hasDeparted == false).map((trip) => (
                                                <TouchableOpacity 
                                                    onPress={() => handleReschedTripSelect(trip.vessel, trip?.trip_id, trip.route_id, trip.route_origin, trip.route_destination, trip.mobile_code, trip.code, trip.web_code, trip.departure_time, trip.vessel_id, trip.isCargoable)}
                                                    key={trip?.trip_id} style={{ paddingHorizontal: 10, paddingVertical: 12, backgroundColor: reschedTripInfo?.id == trip?.trip_id ? '#cf2a3a' : '#fff', borderColor: '#adadad', borderWidth: 1, borderRadius: 10, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <View style={{ width: '78%' }}>
                                                        <Text style={{ fontWeight: 'bold', fontSize: 11, color: reschedTripInfo?.id == trip.trip_id ? '#fff' : '#cf2a3a' }}>{`${trip.departure}`}</Text>
                                                        <Text style={{ fontWeight: 'bold', fontSize: 11, color: reschedTripInfo?.id == trip.trip_id ? '#fff' : '#000' }}>{`${trip.route_origin}  >  ${trip.route_destination} [ ${trip.vessel} ]`}</Text>
                                                    </View>
                                                    <Ionicons name="chevron-forward" size={18} color={reschedTripInfo?.id == trip.trip_id ? '#fff' : '#000'} />
                                                </TouchableOpacity>
                                            ))}

                                            <View style={{ marginTop: 20 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                                    <Text style={{ fontWeight: '600', marginBottom: 5, fontSize: 14, color: '#000' }}>Passenger/s</Text>
                                                    <TouchableOpacity onPress={() => handleSelectAll()} style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end' }}>
                                                        <Checkbox status={selectAll ? 'checked' : 'unchecked'} color='#cf2a3a' uncheckedColor="#999" />
                                                        <Text style={{ color: selectAll ? '#cf2a3a' : '#999', fontSize: 14 }}>Select All</Text>
                                                    </TouchableOpacity>
                                                </View>

                                                <View style={{ height: 140, marginTop: 10 }}>
                                                    <ScrollView style={{ flex: 1, borderWidth: 1, borderColor: '#dadada', borderRadius: 8, paddingHorizontal: 5, width: '100%' }}>
                                                        {paxInfo.map((p: any) => (
                                                            <TouchableOpacity key={p.id} onPress={() => handleReschedPax(p.id)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                <Checkbox status={p.forResched == true ? 'checked' : 'unchecked'} color='#cf2a3a' uncheckedColor="#999" />
                                                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '85%' }}>
                                                                    <Text style={{ color: p.forResched == true ? '#cf2a3a' : '#999', fontSize: 16, width: '75%' }}>{`${p.first_name} ${p.last_name}`}</Text>
                                                                    <Text style={{ color: p.forResched == true ? '#cf2a3a' : '#999', fontSize: 16 }}>{`(${p.passenger_type})`}</Text>
                                                                </View>
                                                            </TouchableOpacity>
                                                        ))}
                                                    </ScrollView>
                                                </View>
                                            </View>
                                        </>
                                    )}
                                </View>
                                <View style={{ padding: 20 }}>
                                    <TouchableOpacity onPress={() => handleReschedProceed()} disabled={isNotProceedable} style={{ marginTop: 30, padding: 10, backgroundColor: '#CF2A3A', borderRadius: 5, opacity: isNotProceedable ? 0.6 : 1 }}>
                                        {proceedLoading == true ? (
                                            <ActivityIndicator size={'small'} color={'#fff'} style={{ alignSelf: 'center' }} />
                                        ) : (
                                            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>Proceed</Text>
                                        )}
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => {setReschedModal(false), setReschedTripInfo(null)}} style={{ marginTop: 10, alignSelf: 'center' }}>
                                        <Text style={{ color: '#cf2a3a', textAlign: 'center' }}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}   



export default React.memo(ReschedBooking)