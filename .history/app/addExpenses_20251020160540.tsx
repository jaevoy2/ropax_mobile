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
    const [screenLoading, setScreenLoading] = useState(false);

    useEffect(() => {

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
                <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', padding: 10, backgroundColor: '#cf2a3a', justifyContent: 'center', marginBottom: 15, borderRadius: 5 }}>
                    <Ionicons name='add' size={20} color={'#fff'} />
                    <Text style={{ fontWeight: 'bold', color: '#fff' }}>Add</Text>
                </TouchableOpacity>

                <View style={{ padding: 10, borderColor: '#cf2a3a', borderWidth: 1, borderRadius: 8 }}>
                    <View style={{ marginTop: 10 }}>
                        <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Description</Text>
                        <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                            <TextInput placeholder='Last Name, First Name' style={{ fontSize: 13 }} />
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
                        <View style={{ width: '40%' }}>
                            <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Age:</Text>
                            <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                <TextInput keyboardType='numeric' placeholder='Age' style={{ fontSize: 13 }} />
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    )
}