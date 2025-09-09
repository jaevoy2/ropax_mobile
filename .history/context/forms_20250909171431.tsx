import { useTrip } from '@/context/trip';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Checkbox } from 'react-native-paper';
import { usePassengers } from './passenger';

const passengerType = ['Adult', 'Senior', 'Student', 'PWD', 'Child', 'Passes'];
const passGender = ['Male', 'Female'];

export default function Forms() {
    const { refNumber, trip } = useTrip();
    const { passengers } = usePassengers();
    const [year, setYear] = useState('');
    const [checked, setChecked] = React.useState(false);

    useEffect(() => {
        const date = new Date();
        setYear(date.getFullYear().toString().slice(-2));
    })

    // useEffect(() => {
    //     if(checked == true) {

    //     }
    // })

    return (
        <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <TextInput placeholder='₱00.00' style={{ borderColor: '#cf2a3a', borderWidth: 1, borderRadius: 5, paddingHorizontal: 15 }} />
                <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 11 }}>Reference#:</Text>
                    <Text style={{ fontWeight: '900', fontSize: 14, color: '#cf2a3a' }}>LMBS-{refNumber.toString().padStart(6, '0')}-{year}{trip.split(" ")[0].charAt(0)}{trip.split(" ")[4].charAt(0)}</Text>
                </View>
            </View>

            <View style={{ height: '81%', marginTop: 10 }}>
                <ScrollView>
                    {passengers.map((p) => p.passType != 'Infant' && (
                        <View key={p.seatNumber} style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 8, paddingHorizontal: 5, paddingVertical: 10, marginBottom: 30 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <Text style={{ color: '#cf2a3a', fontSize: 10, fontWeight: 'bold' }}>B Class Seat#</Text>
                                    <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 18, color: '#cf2a3a', borderColor: '#cf2a3a', backgroundColor: '#cf2a3b1a', borderWidth: 1, paddingVertical: 5, paddingHorizontal: 25, borderRadius: 5 }}>
                                        {p.seatNumber}
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Fare:</Text>
                                    <TextInput placeholder='₱00.00' style={{ borderColor: '#FFC107', borderWidth: 1, borderRadius: 5, paddingHorizontal: 15 }} />
                                </View>
                            </View>
                            <View style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: 10, gap: 5 }}>
                                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Type:</Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
                                    {passengerType.map((type) => (
                                        <TouchableOpacity key={type} style={{ borderColor: '#cf2a3a', borderWidth: 1, paddingVertical: 4, paddingHorizontal: 18, borderRadius: 5  }}>
                                            <Text style={{ textAlign: 'center', fontSize: 12, color: '#cf2a3a' }}>{type}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                            <View style={{ marginTop: 10 }}>
                                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Full Name:</Text>
                                <View style={{ height: 40, borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                    <TextInput placeholder='Last Name, First Name' style={{ fontSize: 13 }} />
                                </View>
                            </View>
                            <View style={{ marginTop: 5, flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
                                <View style={{ width: '40%' }}>
                                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Age:</Text>
                                    <View style={{ height: 40, borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                        <TextInput keyboardType='numeric' placeholder='Age' style={{ fontSize: 13 }} />
                                    </View>
                                </View>
                                <View style={{ width: '56%', }}>
                                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Gender:</Text>
                                    <View style={{ flexDirection:'row', gap: 5 }}>
                                        {passGender.map((gender) => (
                                            <TouchableOpacity key={gender} style={{ borderColor: '#cf2a3a', borderWidth: 1, width: '50%', borderRadius: 5, justifyContent :'center', paddingVertical: 8 }}>
                                                <Text style={{ textAlign: 'center', fontSize: 14, color: '#cf2a3a' }}>{gender}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </View>
                            <View style={{ marginTop: 10, flexDirection: 'row', gap: 8 }}>
                                <View style={{ width: '40%' }}>
                                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Nationality:</Text>
                                    <View style={{ height: 40, borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                        <TextInput defaultValue='Filipino' style={{ fontSize: 13 }} />
                                    </View>
                                </View>
                                <View style={{ width: '57.5%' }}>
                                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Address:</Text>
                                    <View style={{ height: 40, borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                        <TextInput placeholder='Address' style={{ fontSize: 13 }} />
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => setChecked(!checked)} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15 }}>
                                <Checkbox status={checked ? 'checked' : 'unchecked'} color='#cf2a3a' uncheckedColor="#999" />
                                <Text>With Infant</Text>
                            </TouchableOpacity>
                            {checked == true && (
                                <>
                                    <View style={{ marginTop: 10 }}>
                                        <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Full Name:</Text>
                                        <View style={{ height: 40, borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                            <TextInput placeholder='Last Name, First Name' style={{ fontSize: 13 }} />
                                        </View>
                                    </View>
                                    <View style={{ marginTop: 5, flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
                                        <View style={{ width: '40%' }}>
                                            <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Age:</Text>
                                            <View style={{ height: 40, borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                                <TextInput keyboardType='numeric' placeholder='Age' style={{ fontSize: 13 }} />
                                            </View>
                                        </View>
                                        <View style={{ width: '56%', }}>
                                            <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Gender:</Text>
                                            <View style={{ flexDirection:'row', gap: 5 }}>
                                                {passGender.map((gender) => (
                                                    <TouchableOpacity key={gender} style={{ borderColor: '#cf2a3a', borderWidth: 1, width: '50%', borderRadius: 5, justifyContent :'center', paddingVertical: 8 }}>
                                                        <Text style={{ textAlign: 'center', fontSize: 14, color: '#cf2a3a' }}>{gender}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>
                                    </View>
                                </>
                            )}
                        </View>
                    ))}
                </ScrollView>
            </View>

        </View>
    )
}