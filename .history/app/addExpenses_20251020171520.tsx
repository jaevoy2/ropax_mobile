import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import { Dropdown } from 'react-native-element-dropdown';

const { height } = Dimensions.get('window');

type TripProps = {
    trip_id: number;
    vessel: string;
    route_origin: string;
    route_destination: string;
    departure_time: string;
    route_id: number;
    code: string;
    web_code: string;
}


export default function AddExpenses() {
    const [trips, setTrips] = useState<TripProps[] | null>(null);
    const [date, setDate] = useState('');
    const [screenLoading, setScreenLoading] = useState(false);

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
        setDate(formattedDate);
    })

    return (
        <View style={{ backgroundColor: '#f1f1f1', position: 'relative', height: height, }}>
            <TouchableOpacity onPress={() => router.back()} style={{ position: 'absolute', top: 45, left: 10, zIndex: 3 }}>
                <Ionicons name='chevron-back' size={30} color={'#fff'} />
            </TouchableOpacity>
            <View style={{ height: 100, backgroundColor: '#cf2a3a', paddingTop: 50 }}>
                <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Add Expense</Text>
            </View>
            <View style={{ padding: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Text style={{ fontSize: 10 }}>Date:</Text>
                        <Text style={{ color: '#CF2A3A', fontSize: 13, fontWeight: '900' }}>{date}</Text>
                    </View>
                    <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', paddingHorizontal: 15, paddingVertical: 8, backgroundColor: '#cf2a3a', justifyContent: 'center', marginBottom: 15, borderRadius: 5 }}>
                        <Ionicons name='add' size={20} color={'#fff'} />
                        <Text style={{ fontWeight: 'bold', color: '#fff' }}>Add</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ padding: 10, borderColor: '#cf2a3a', borderWidth: 1, borderRadius: 8 }}>
                    <View style={{ marginTop: 20 }}>
                        <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Description</Text>
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
                        <View style={{ width: '35%' }}>
                            <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Amount:</Text>
                            <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                <TextInput keyboardType='numeric' placeholder='₱ 00.00' style={{ fontSize: 13 }} />
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    )
}