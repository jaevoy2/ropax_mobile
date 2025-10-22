import { FetchTrips } from '@/api/trips';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import { Dropdown } from 'react-native-element-dropdown';

const { height, width } = Dimensions.get('window');

type TripProps = {
    trip_id: number;
    vessel: string;
    route_origin: string;
    route_destination: string;
    departure: string;
    route_id: number;
    code: string;
    web_code: string;
}


export default function AddExpenses() {
    const [trips, setTrips] = useState<TripProps[] | null>(null);
    const [date, setDate] = useState('');
    const [screenLoading, setScreenLoading] = useState(false);
    const [contentLoading, setContentLoading] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(0);
    const [modal, setModal] = useState(false);
    const [saveCategotySpinner, setCategorySpinner] = useState(false);

    useEffect(() => {
        const getDate = new Date();
        const today = getDate.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
        const date = new Date(today);
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'Asia/Manila'
        }

        const formattedDate = date.toLocaleDateString('en-US', options);
        handleFetchTrips(today);
        setDate(formattedDate);
    }, []);

    const handleFetchTrips = async (queryDate: string) => {
        try {
            const tripsFetch = await FetchTrips(queryDate);

            if(tripsFetch) {
                const tripsData: TripProps[] = tripsFetch.data.map((t: any) => ({
                    trip_id: t.id,
                    vessel: t.trip.vessel.name,
                    route_origin: t.trip.route.origin,
                    route_destination: t.trip.route.destination,
                    vessel_id: t.trip.vessel_id,
                    route_id: t.trip.route_id,
                    code: t.trip.route.mobile_code,
                    web_code: t.trip.route.web_code,
                    departure: new Date(`1970-01-01T${t.trip.departure_time}`).toLocaleTimeString(
                        'en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                        }
                    )
                }))

                setTrips(tripsData);
            }
            console.log('Data: ', trips);
        }catch(error: any) {
            Alert.alert('Error', error.message);
        }finally{
            setContentLoading(false);
        }
    }

    return (
        <View style={{ backgroundColor: '#f1f1f1', position: 'relative', height: height, }}>
            {/* add category modal */}
            <Modal visible={modal} transparent animationType="fade">
                <View style={{ backgroundColor: '#00000048', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ height: height / 5, width: width - 40, backgroundColor: '#fff', borderRadius: 10, justifyContent: 'space-between', padding: 15 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Add Category</Text>
                        <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                            <TextInput placeholder='e.g. Consumable' style={{ fontSize: 13 }} />
                        </View>
                        <View style={{ alignSelf: 'flex-end', flexDirection: 'row', marginTop: 20, gap: 10 }}>
                            <TouchableOpacity onPress={() => setModal(false)}>
                                <Text>Cancel</Text>
                            </TouchableOpacity>
                            {saveCategotySpinner ? (
                                <ActivityIndicator size="small" color="#cf2a3a" style={{ marginRight: 10 }} />
                            ) : (
                                <TouchableOpacity disabled={saveCategotySpinner}>
                                    <Text style={{ color: '#cf2a3a', fontWeight: 'bold' }}>Save</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>


            <TouchableOpacity onPress={() => router.back()} style={{ position: 'absolute', top: 45, left: 10, zIndex: 3 }}>
                <Ionicons name='chevron-back' size={30} color={'#fff'} />
            </TouchableOpacity>
            <View style={{ height: 100, backgroundColor: '#cf2a3a', paddingTop: 50 }}>
                <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Add Expense</Text>
            </View>
            <View style={{ padding: 10, marginTop: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Text style={{ fontSize: 12 }}>Date:</Text>
                        <Text style={{ color: '#CF2A3A', fontSize: 15, fontWeight: '900' }}>{date}</Text>
                    </View>
                    <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', paddingHorizontal: 15, paddingVertical: 8, backgroundColor: '#cf2a3a', justifyContent: 'center', marginBottom: 15, borderRadius: 5 }}>
                        <Ionicons name='add' size={20} color={'#fff'} />
                        <Text style={{ fontWeight: 'bold', color: '#fff' }}>Add</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ padding: 10, borderColor: '#cf2a3a', borderWidth: 1, borderRadius: 8 }}>
                    <View style={{ marginTop: 10 }}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#545454' }}>Description</Text>
                        <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                            <TextInput placeholder='e.g. Vessel Oil' style={{ fontSize: 13 }} />
                        </View>
                    </View>
                    <View style={{ marginTop: 5, flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
                        {/* <Dropdown labelField="label" valueField="value" placeholder="" style={{ height: 40, width: '85%', paddingHorizontal: 10 }}
                            containerStyle={{
                                alignSelf: 'flex-start',
                                width: '67%'
                            }}
                            selectedTextStyle={{ fontWeight: 'bold', fontSize: 14 }}
                            renderRightIcon={() => (
                                <Ionicons name="chevron-down" size={22} />
                            )}
                            dropdownPosition="bottom"
                        /> */}
                        <View style={{ width: '25%' }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#545454' }}>Amount:</Text>
                            <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 5 }}>
                                <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: -5 }}>₱</Text>
                                <TextInput keyboardType='numeric' placeholder='00.00' style={{ fontSize: 13, textAlign: 'right', }} />
                            </View>
                        </View>
                        <View style={{ width: '72.5%' }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#545454' }}>Category</Text>
                            <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <TextInput placeholder='Select Category' style={{ fontSize: 13 }} />
                                <TouchableOpacity onPress={() => setModal(true)} style={{ borderLeftColor: '#B3B3B3', borderLeftWidth: 1, height: '100%', padding: 8 }} >
                                    <Ionicons name='add' size={20}/>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 15, marginBottom: 5 }}>
                        {trips?.map((t) => (
                            <>
                                <TouchableOpacity onPress={() => setSelectedTrip(t.trip_id)} key={t.trip_id} style={{ backgroundColor: selectedTrip == t.trip_id ? '#cf2a3a' : 'transparent', borderColor: selectedTrip == t.trip_id ? 'transparent' : '#B3B3B3', borderWidth: 1, paddingVertical: 6, paddingHorizontal: 5, borderRadius: 5  }}>
                                    <View>
                                        <Text style={{ fontWeight: 'bold', fontSize: 10, color: selectedTrip  == t.trip_id ? '#fff' : '#cf2a3a' }}>{`${t.departure}`}</Text>
                                        <Text style={{ fontWeight: 'bold', fontSize: 10, color: selectedTrip == t.trip_id ? '#fff' : '#000' }}>{`${t.route_origin} > ${t.route_destination} [ ${t.vessel} ]`}</Text>
                                    </View>
                                </TouchableOpacity>
                            </>
                        ))}
                    </View>
                </View>
            </View>
        </View>
    )
}