import { FetchManageBookingList } from "@/api/manageBookingList";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, FlatList, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";

type PaxBookingProps = {
    id: number;
    name: string;
    departureDate: string;
    departureTime: string;
    route: string;
    vessel: string;
    referenceNumber: string;
}

const { height } = Dimensions.get('window')


export default function ManageBooking() {
    const [passengers, setPassengers] = useState<PaxBookingProps[] | []>([])
    const [loading, setLoading] = useState(true);
    const [calendarVisible, setCalendarVisible] = useState(false);
    const [date, setDate] = useState('');
    const [formattedDate, setFormattedDate] = useState('');
    const [searchValue, setSearchValue] = useState('');

    useEffect(() => {
        const date = new Date;
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'Asia/Manila'
        }

        const dateString = date.toISOString().split('T')[0];
        const formatteDate = date.toLocaleDateString('en-US', options)

        setDate(date.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' }))
        setFormattedDate(formatteDate);
        fetchBooking(dateString, null);
    }, []);

    const fetchBooking = async (dateString: string, search: string | null) => {
        try {
            const response = await FetchManageBookingList(dateString, search)
            
            if(!response.error) {
                const paxData: PaxBookingProps[] = response.data.map((passenger: any) => ({
                    id: passenger.id,
                    name: `${passenger.first_name} ${passenger.last_name}`,
                    departureDate: new Date(passenger.bookings.find((c: any) => c.created_at).created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }),
                    departureTime: new Date(`1970-01-01T${passenger.bookings.find((t: any) => 
                        t.trip_schedule)?.trip_schedule.trip.departure_time}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    }),
                    route: passenger.bookings.find((t: any) => t.trip_schedule)?.trip_schedule.trip.route.mobile_code,
                    vessel: passenger.bookings.find((t: any) => t.trip_schedule)?.trip_schedule.trip.vessel.name,
                    referenceNumber: passenger.bookings.find((r: any) => r.reference_no).reference_no
                }))
                setPassengers(paxData)
            }
        }catch (error: any) {
            console.log(error)
            Alert.alert('Error', error.message)
        }finally {
            setLoading(false);
        }
    }

    const handleDateSelect = (date: string) => {
        fetchBooking(new Date(date).toISOString().split('T')[0], null),
        setLoading(true);
    }

    const handleFilter = (search: string) => {
        setTimeout(() => {
            fetchBooking(date, search);
        }, 400);
    }

    const PassengerItem = React.memo(({ paxDatas }: { paxDatas: PaxBookingProps }) => {
        return (
            <TouchableOpacity style={{ height: 90, borderColor: '#B3B3B3', borderWidth: 1, backgroundColor: '#fff', borderRadius: 8, padding: 8, marginBottom: 10 }}>
                <Text style={{ alignSelf: 'flex-end', fontSize: 10 }}>{paxDatas.departureDate}</Text>
                <View style={{ borderBottomColor: '#dadadaff', borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5, paddingBottom: 8 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{paxDatas.name}</Text>
                    <Text style={{ fontSize: 12, color: '#cf2a3a', fontWeight: 'bold' }}>{paxDatas.referenceNumber}</Text>
                </View>
                <Text style={{ fontSize: 10 }}>{`${paxDatas.vessel}  |  ${paxDatas.route}  |  ${paxDatas.departureTime}`}</Text>
            </TouchableOpacity>
        )
    })

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            {calendarVisible && (
                <Modal transparent animationType="slide" onRequestClose={() => setCalendarVisible(false)} >
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                        <View style={{ width: '80%', backgroundColor: '#fff', padding: 20, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Select Date</Text>
                            <Calendar
                            // minDate={new Date().toISOString().split('T')[0]}
                            onDayPress={(day) => {
                                setDate(day.dateString),
                                setCalendarVisible(false),
                                handleDateSelect(day.dateString)
                            }}
                            markedDates={{ [date]: {selected: true, selectedColor: '#CF2A3A'} }} 
                            />
                            <TouchableOpacity onPress={() => setCalendarVisible(false)} style={{ marginTop: 20, padding: 10, backgroundColor: '#CF2A3A', borderRadius: 5 }}>
                                <Text style={{ color: '#fff', textAlign: 'center' }}>Close Calendar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
            <View style={{ paddingTop: 50, height: 150, backgroundColor: '#cf2a3a', paddingHorizontal: 20, gap: 15 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Manage Bookings</Text>
                    <TouchableOpacity onPress={() => setCalendarVisible(true)}>
                        <Ionicons name="calendar" size={25} color={'#fff'} />
                    </TouchableOpacity>
                </View>
                <View style={{ position: 'relative', borderColor: '#cfcfcf73', backgroundColor: '#d4abab73', borderWidth: 1, borderRadius: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10 }}>
                    <TextInput onChangeText={(text) => {handleFilter(text), setSearchValue(text)}} value={searchValue} placeholder='Search' placeholderTextColor='#fff' style={{ fontSize: 13, fontWeight: '600', width: '90%', color: '#fff' }} />
                    <TouchableOpacity disabled={searchValue.length == 0} onPress={() => setSearchValue('')} style={{ borderLeftWidth: 1, borderLeftColor: '#cfcfcfd0', paddingLeft: 10 }}>
                        {searchValue.length > 0 ? (
                            <Ionicons name={'close'} size={20} color={'#fff'} />
                        ) : (
                            <Ionicons name={'search'} size={20} color={'#fff'} />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{ justifyContent: 'center', paddingTop: 20, paddingHorizontal: 20, height: height - 170 }}>
                {loading == true ? (
                    <ActivityIndicator size={'large'} color={'#cf2a3a'} />
                ) : (
                    <>
                        {passengers.length > 0 ? (
                            <>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Bookings</Text>
                                    <Text style={{ fontSize: 15, fontWeight: 'bold' }}>{formattedDate}</Text>
                                </View>
                                <FlatList data={passengers.reverse()} keyExtractor={(passengers) => String(passengers.id)} showsVerticalScrollIndicator={false} 
                                    renderItem={({ item: passengerDatas }) => <PassengerItem paxDatas={passengerDatas}/>}
                                    getItemLayout={(passengerDatas, index) => ({
                                        length: 90,
                                        offset: 90 * index,
                                        index
                                    })}
                                />
                            </>
                        ) : (
                            <>
                                <Text style={{ textAlign: 'center', color: '#7A7A85', top: -50 }}>No bookings found</Text>
                            </>
                        )}
                    </>
                )}
            </View>
        </View>
    )
}