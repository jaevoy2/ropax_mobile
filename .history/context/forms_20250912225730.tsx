import { useTrip } from '@/context/trip';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Checkbox } from 'react-native-paper';
import { InfantProps, usePassengers } from './passenger';

const passengerType = ['Adult', 'Senior', 'Student', 'PWD', 'Child', 'Passes'];
const passGender = ['Male', 'Female'];

type FormProps = {
    errorForm: string | number;
}

export default function Forms({ errorForm }: FormProps) {
    const { refNumber, trip } = useTrip();
    const { passengers, setPassengers, updatePassenger } = usePassengers();
    const [year, setYear] = useState('');

    useEffect(() => {
        const date = new Date();
        setYear(date.getFullYear().toString().slice(-2));
    });

    const hasInfantChecker = (seat: number | string, hasInfantValue: boolean) => {
        const currentValue = !hasInfantValue;
        updatePassenger(seat, 'hasInfant', currentValue);

        if(!currentValue) {
            updatePassenger(seat, 'infant', []);
        }else {
            addInfant(seat, {name: '', gender: '', age: 0})
        }
    }

    const addInfant = (seatNumber: string | number, newInfant: InfantProps) => {
        setPassengers((prev) => 
            prev.map((p) => {
                if(p.seatNumber !== seatNumber) return p;
                return {
                    ...p, infant: [...(p.infant || []), newInfant]
                }
            })
        )
    }

    return (
        <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <TextInput placeholder='₱00.00' style={{ borderColor: '#cf2a3a', borderWidth: 1, borderRadius: 5, paddingHorizontal: 15 }} />
                <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 11 }}>Reference#:</Text>
                    <Text style={{ fontWeight: '900', fontSize: 14, color: '#cf2a3a' }}>LMBS-{refNumber.toString().padStart(6, '0')}-{year}{trip.split(" ")[0].charAt(0)}{trip.split(" ")[4].charAt(0)}</Text>
                </View>
            </View>

            <View style={{ height: '84%', marginTop: 10 }}>
                <ScrollView>
                    {passengers.map((p) => (
                        <View key={p.seatNumber} style={{ borderColor: errorForm == p.seatNumber ? '#cf2a3a' : '#B3B3B3', borderWidth: 1, borderRadius: 8, paddingHorizontal: 5, paddingVertical: 10, marginBottom: 20, backgroundColor: '#fff' }}>
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
                                        <TouchableOpacity onPress={() => updatePassenger(p.seatNumber!, 'passType', type)} key={type} style={{ backgroundColor: p.passType == type ? '#cf2a3a' : 'transparent', borderColor: '#cf2a3a', borderWidth: 1, paddingVertical: 4, paddingHorizontal: 18, borderRadius: 5  }}>
                                            <Text style={{ textAlign: 'center', fontSize: 12, color: p.passType == type ? '#fff' : '#cf2a3a' }}>{type}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                            <View style={{ marginTop: 10 }}>
                                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Full Name:</Text>
                                <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                    <TextInput onChangeText={(text) => updatePassenger(p.seatNumber!, 'name', text)} placeholder='Last Name, First Name' style={{ fontSize: 13 }} />
                                </View>
                            </View>
                            <View style={{ marginTop: 5, flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
                                <View style={{ width: '40%' }}>
                                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Age:</Text>
                                    <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                        <TextInput onChangeText={(text) => updatePassenger(p.seatNumber!, 'age', Number(text))} keyboardType='numeric' placeholder='Age' style={{ fontSize: 13 }} />
                                    </View>
                                </View>
                                <View style={{ width: '56%', }}>
                                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Gender:</Text>
                                    <View style={{ flexDirection:'row', gap: 5 }}>
                                        {passGender.map((gender) => (
                                            <TouchableOpacity onPress={() => updatePassenger(p.seatNumber!, 'gender', gender)} key={gender} style={{ backgroundColor: p.gender == gender ? '#cf2a3a' : 'transparent', borderColor: '#cf2a3a', borderWidth: 1, width: '50%', borderRadius: 5, justifyContent :'center', paddingVertical: 8 }}>
                                                <Text style={{ textAlign: 'center', fontSize: 14, color: p.gender == gender ? '#fff' : '#cf2a3a' }}>{gender}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </View>
                            <View style={{ marginTop: 5, flexDirection: 'row', gap: 8 }}>
                                <View style={{ width: '40%' }}>
                                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Nationality:</Text>
                                    <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                        <TextInput onChangeText={(text) => updatePassenger(p.seatNumber!, 'nationality', text)} defaultValue='Filipino' style={{ fontSize: 13 }} />
                                    </View>
                                </View>
                                <View style={{ width: '57.5%' }}>
                                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Address:</Text>
                                    <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                        <TextInput onChangeText={(text) => updatePassenger(p.seatNumber!, 'address', text)} placeholder='Address' style={{ fontSize: 13 }} />
                                    </View>
                                </View>
                            </View>
                            <View style={{ marginTop: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <View style={{ width: '40%' }}>
                                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Contact#:</Text>
                                    <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                        <TextInput placeholder='+63' onChangeText={(text) => updatePassenger(p.seatNumber!, 'contact', text)} style={{ fontSize: 13 }} />
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => hasInfantChecker(p.seatNumber!, p.hasInfant!)}
                                    style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15 }}>
                                    <Text>With Infant</Text>
                                    <Checkbox status={p.hasInfant ? 'checked' : 'unchecked'} color='#cf2a3a' uncheckedColor="#999" />
                                </TouchableOpacity>
                            </View>
                            {p.hasInfant && (
                                <View>
                                    <View style={{ marginTop: 10 }}>
                                        <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Full Name:</Text>
                                        <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                            <TextInput placeholder='Last Name, First Name' style={{ fontSize: 13 }} />
                                        </View>
                                    </View>
                                    <View style={{ marginTop: 5, flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
                                        <View style={{ width: '40%' }}>
                                            <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Age:</Text>
                                            <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                                <TextInput keyboardType='numeric' placeholder='Age' style={{ fontSize: 13 }} />
                                            </View>
                                        </View>
                                        <View style={{ width: '56%', }}>
                                            <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Gender:</Text>
                                            <View style={{ flexDirection:'row', gap: 5 }}>
                                                {passGender.map((infntgender) => (
                                                    <TouchableOpacity key={infntgender} style={{ borderColor: '#cf2a3a', borderWidth: 1, width: '50%', borderRadius: 5, justifyContent :'center', paddingVertical: 8 }}>
                                                        <Text style={{ textAlign: 'center', fontSize: 14 }}>{infntgender}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>
                                    </View>
                                    <TouchableOpacity style={{ backgroundColor: '#cf2a3a', width: '95%', alignSelf: 'center', borderRadius: 5, paddingVertical: 10, zIndex: 5 }}>
                                        <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#fff' }}>Add Infant</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    ))}
                </ScrollView>
            </View>

        </View>
    )
}