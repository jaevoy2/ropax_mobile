import { FetchFares } from '@/api/fares';
import { FetchPassengerType } from '@/api/passengerType';
import { useTrip } from '@/context/trip';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Checkbox } from 'react-native-paper';
import { InfantProps, usePassengers } from './passenger';

const passengerType = ['Adult', 'Senior', 'Student', 'PWD', 'Child', 'Passes'];
const passGender = ['Male', 'Female'];

type FormProps = {
    errorForm: (string | number)[];
}

type PassTypeProps = {
    id: number;
    name: string;
    code: string;
}

export default function Forms({ errorForm }: FormProps) {
    const { id, destination, origin, totalFare, setTotalFare } = useTrip();
    const { passengers, setPassengers, updatePassenger, updateInfant } = usePassengers();
    const [year, setYear] = useState('');
    const [typeLoading, setTypeLoading] = useState(true);
    const [passengerType, setPassengerType] = useState<PassTypeProps[] | null>(null);

    useEffect(() => {
        const date = new Date();
        setYear(date.getFullYear().toString().slice(-2));

        const passengerType = async () => {
            try {
                const passTypes = await FetchPassengerType();

                if(!passTypes.error) {
                    const types: PassTypeProps[] = passTypes.data.map((type: any) => ({
                        id: type.id,
                        name: type.name,
                        code: type.passenger_types_code
                    }));

                    setPassengerType(types);
                }
            }catch(error: any) {
                Alert.alert('Error', error.message);
            }finally{
                setTypeLoading(false);
            }
        }

        passengerType();
    }, []);

    const getPassengerFare = async (passType_id: number, accomm_id: number, vesselID: number, seatNum: string | number) => {
        try{
            const passFare = await FetchFares(passType_id, accomm_id, vesselID);

            if(!passFare.error) {
                const fare = passFare.data.fare;
                updatePassenger(seatNum, 'fare', fare);
            }
        }catch(error: any) {
            Alert.alert('Error', error.message);
        }
    }

    const hasInfantChecker = (seat: number | string, hasInfantValue: boolean, passType_id: number) => {
        const currentValue = !hasInfantValue;
        updatePassenger(seat, 'hasInfant', currentValue);

        if(!currentValue) {
            updatePassenger(seat, 'infant', []);
        }else {
            addInfant(seat, {name: '', gender: '', age: 0, passType_id: id})
        }
    }

    const addInfant = (seat: string | number, newInfant: InfantProps) => {
        setPassengers((prev) => 
            prev.map((p) => {
                if(p.seatNumber !== seat) return p;
                return {
                    ...p, infant: [...(p.infant || []), newInfant]
                }
            })
        )
    }

    const removeInfant = (seat: string | number, infantIndex: number) => {
        setPassengers((prev) => 
            prev.map((p) => {
                if(p.seatNumber !== seat) return p;
                return {
                    ...p, infant: p.infant?.filter((_, i) => i !== infantIndex)
                }
            })
        )
    }


    return (
        <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Text style={{ fontSize: 11 }}>Reference#:</Text>
                    <Text style={{ fontWeight: '900', fontSize: 14, color: '#cf2a3a' }}>LMBS-000000-{year}{origin.charAt(0)}{destination.charAt(0)}</Text>
                </View>
                <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 9, fontWeight: '900', color: '#cf2a3a' }}>Total Fare:</Text>
                    <View style={{ borderColor: '#cf2a3a', backgroundColor: '#cf2a3b1a', borderWidth: 2, borderRadius: 5, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 }}>
                        <Text style={{ fontSize: 16 }}>₱</Text>
                        <TextInput value={String(totalFare != 0 ? totalFare.toString() : '')} onChangeText={(text) => setTotalFare(Number(text))} placeholder='00.00' style={{ fontWeight: 'bold' }} keyboardType={'numeric'} />
                    </View>
                </View>
            </View>

            <View style={{ height: '82%', marginTop: 10 }}>
                <ScrollView>
                    {passengers.map((p) => (
                        <View key={p.seatNumber} style={{ borderColor: errorForm.includes(p.seatNumber ?? '') ? '#cf2a3a' : '#B3B3B3', borderWidth: 1, borderRadius: 8, paddingHorizontal: 5, paddingVertical: 10, marginBottom: 20, backgroundColor: '#fff' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <Text style={{ color: '#cf2a3a', fontSize: 10, fontWeight: 'bold' }}>{p.accommodation} Seat#</Text>
                                    <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 18, color: '#cf2a3a', borderColor: '#cf2a3a', backgroundColor: '#cf2a3b1a', borderWidth: 1, paddingVertical: 5, paddingHorizontal: 25, borderRadius: 5 }}>
                                        {p.seatNumber}
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Fare:</Text>
                                    <View style={{ borderColor: '#FFC107', backgroundColor: '#ffc10727', borderWidth: 2, borderRadius: 5, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 }}>
                                        <Text style={{ fontSize: 16 }}>₱</Text>
                                        <TextInput onChangeText={(text) => updatePassenger(p.seatNumber!, 'fare', Number(text.replace(/[^0-9.]/g,'')))} value={String(p.fare ?? '')} keyboardType={'numeric'} placeholder='00.00' style={{ fontWeight: 'bold' }} />
                                    </View>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: 10, gap: 5 }}>
                                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Type:</Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
                                    {typeLoading == true ? (
                                        <>
                                            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#545454' }}>Fetching Passenger Types...</Text>
                                        </>
                                    ) : (
                                        <>
                                            {passengerType?.filter((t) => t.name != 'Infant')
                                                .map((type) => (
                                                <TouchableOpacity onPress={() => {updatePassenger(p.seatNumber!, 'passType', type.name), getPassengerFare(type.id, p.accommodationID!, id, p.seatNumber!), updatePassenger(p.seatNumber!, 'passTypeCode', type.code)}} key={type.id} style={{ backgroundColor: p.passType == type.name ? '#cf2a3a' : 'transparent', borderColor: '#cf2a3a', borderWidth: 1, paddingVertical: 4, paddingHorizontal: 18, borderRadius: 5  }}>
                                                    <Text style={{ textAlign: 'center', fontSize: 12, color: p.passType == type.name ? '#fff' : '#cf2a3a' }}>{type.name}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </>
                                    )}

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
                                <TouchableOpacity onPress={() => hasInfantChecker(p.seatNumber!, p.hasInfant!, passengerType?.find((i) => i.name == 'Infant')?.id! )}
                                    style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15 }}>
                                    <Text>With Infant</Text>
                                    <Checkbox status={p.hasInfant ? 'checked' : 'unchecked'} color='#cf2a3a' uncheckedColor="#999" />
                                </TouchableOpacity>
                            </View>
                            {p.hasInfant && (
                                <>
                                    <TouchableOpacity onPress={() => addInfant(p.seatNumber!, {name: '', gender: '', age: 0, passType_id: passengerType?.find((i) => i.name == 'Infant')?.id!})} style={{ backgroundColor: '#cf2a3a', borderColor: '#cf2a3a', borderWidth: 1, padding: 5, borderRadius: 5, alignSelf: 'flex-end', marginTop: 10, marginBottom: -15, flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                                        <Text style={{ color: '#fff', fontWeight: 600 }}>Add Infant</Text>
                                        <Ionicons name={'add-circle'} size={20} color={'#fff'} />
                                    </TouchableOpacity>
                                    {p.infant?.map((i, index) => (
                                        <View key={index}>
                                            <View style={{ marginTop: 30 }}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Full Name:</Text>
                                                    {index != 0 && (
                                                        <TouchableOpacity onPress={() => removeInfant(p.seatNumber!, index)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                            <Ionicons name={'close'} size={20} color={'#cf2a3a'} />
                                                            <Text style={{ color: '#cf2a3a', fontWeight: '600', fontSize: 13 }}>Remove</Text>
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                                <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                                    <TextInput onChangeText={(text) => updateInfant(p.seatNumber!, index, 'name', text)} placeholder='Last Name, First Name' style={{ fontSize: 13 }} />
                                                </View>
                                            </View>
                                            <View style={{ marginTop: 5, flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
                                                <View style={{ width: '40%' }}>
                                                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Age:</Text>
                                                    <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                                        <TextInput onChangeText={(text) => updateInfant(p.seatNumber!, index, 'age', Number(text))} keyboardType='numeric' placeholder='Age' style={{ fontSize: 13 }} />
                                                    </View>
                                                </View>
                                                <View style={{ width: '56%', }}>
                                                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Gender:</Text>
                                                    <View style={{ flexDirection:'row', gap: 5 }}>
                                                        {passGender.map((infntgender) => (
                                                            <TouchableOpacity onPress={() => updateInfant(p.seatNumber!, index, 'gender', infntgender)} key={infntgender} style={{ backgroundColor: p.infant?.[index]?.gender == infntgender ? '#cf2a3a' : 'transparent',
                                                                borderColor: '#cf2a3a', borderWidth: 1, width: '50%', borderRadius: 5, justifyContent :'center', paddingVertical: 8 }}>
                                                                <Text style={{ textAlign: 'center', fontSize: 14, color: p.infant?.[index]?.gender == infntgender ? '#fff' : '#cf2a3a' }}>{infntgender}</Text>
                                                            </TouchableOpacity>
                                                        ))}
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                </>
                            )}
                        </View>
                    ))}
                </ScrollView>
            </View>

        </View>
    )
}