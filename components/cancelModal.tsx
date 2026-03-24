import { PaxInfo } from '@/app/bookingInfo';
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Checkbox } from 'react-native-paper';


export default function CancelBooking({ cancelModal, setCancelModal, paxInfo, setPaxInfo }: 
        { cancelModal: boolean; setCancelModal: React.Dispatch<React.SetStateAction<boolean>>; 
            paxInfo: PaxInfo[]; setPaxInfo: React.Dispatch<React.SetStateAction<PaxInfo[]>> }) {

    const [selectAll, setSelectAll] = useState(true);
    const [totalFare, setTotalFare] = useState(0);

    useMemo(() => {
        const total = paxInfo.reduce((sum, passenger) => sum + Number(passenger?.fare), 0);

        setTotalFare(total)
    }, [paxInfo])

    useEffect(() => {
        const notForCancel = paxInfo.some(p => p.forCancel != true);

        if(notForCancel) {
            setSelectAll(false);
        }else {
            setSelectAll(true)
        }
    }, [paxInfo])

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
        <View>
            <Modal transparent animationType={'fade'} visible={cancelModal}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <View style={{ width: '92%', backgroundColor: '#fff', borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10, paddingHorizontal: 20, paddingVertical: 15, borderBottomColor: '#dadada', borderBottomWidth: 1 }}>Cancellation Request</Text>
                        <View style={{ paddingHorizontal: 20, }}>
                            <View style={{ flexDirection: 'row', opacity: 0.5, width: '95%' }}>
                                <Text style={{ marginBottom: 5, fontSize: 13 }}>Note: </Text>
                                <Text style={{ marginBottom: 5, fontSize: 13 }}>Refund depends on cancellation and departure time.</Text>
                            </View>

                            <View style={{ borderColor: '#dadada', borderWidth: 1, borderRadius: 5 }}>
                                <Text style={{ fontWeight: '600', marginBottom: 5, borderBottomWidth: 1, borderBottomColor: '#dadada', padding: 8 }}>Breakdown</Text>
                                <View style={{ paddingVertical: 5, paddingHorizontal: 10, gap: 5 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Text style={{ fontSize: 14 }}>Booking Amount:</Text>
                                        <Text style={{ fontSize: 16, fontWeight: '600' }}>₱ {totalFare.toFixed(2)}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Text style={{ fontSize: 14 }}>Charge:</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <Text style={{ fontSize: 15, opacity: 0.6, fontWeight: '600', color: '#cf2a3a' }}>{'20%'}</Text>
                                            <Text style={{ fontSize: 16, fontWeight: '700' }}>₱ 120.00</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#cf2a3b27', padding: 10, borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }}>
                                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#cf2a3a' }}>Refund Amount:</Text>
                                    <Text style={{ fontSize: 16, fontWeight: '900', color: '#cf2a3a' }}>₱ 120.00</Text>
                                </View>
                            </View>
                            <View style={{ marginTop: 15 }}>
                                <Text style={{ fontWeight: '600', marginBottom: 5 }}>Reason of Cancellation</Text>
                                <View style={{ borderColor: '#dadada', borderWidth: 1, borderRadius: 5 }}>
                                    <TextInput style={{ fontSize: 16 }} placeholder='e.g Emergency' />
                                </View>
                            </View>
                            <View style={{ marginTop: 15 }}>
                                <Text style={{ fontWeight: '600', marginBottom: 5 }}>Recepient Name</Text>
                                <View style={{ borderColor: '#dadada', borderWidth: 1, borderRadius: 5 }}>
                                    <TextInput style={{ fontSize: 16 }} placeholder='FirstName LastName' />
                                </View>
                            </View>

                            <View style={{ marginTop: 15 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                    <Text style={{ fontWeight: '600', marginBottom: 5 }}>Passenger/s</Text>
                                    <TouchableOpacity onPress={() => handleSelectAll()} style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end' }}>
                                        <Checkbox status={selectAll ? 'checked' : 'unchecked'} color='#cf2a3a' uncheckedColor="#999" />
                                        <Text style={{ color: selectAll ? '#cf2a3a' : '#999', fontSize: 15 }}>Select All</Text>
                                    </TouchableOpacity>
                                </View>
                                
                                <View style={{ height: 90 }}>
                                    <ScrollView style={{ flex: 1, borderWidth: 1, borderColor: '#dadada', borderRadius: 8, paddingHorizontal: 5 }}>
                                        {paxInfo.map((p: any) => (
                                            <TouchableOpacity key={p.id} onPress={() => handleCancelPax(p.id)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Checkbox status={p.forCancel == true ? 'checked' : 'unchecked'} color='#cf2a3a' uncheckedColor="#999" />
                                                <Text style={{ color: p.forCancel == true ? '#cf2a3a' : '#999', fontSize: 16 }}>{`${p.first_name} ${p.last_name}`}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            </View>

                            <View style={{ paddingBottom: 20 }}>
                                <TouchableOpacity style={{ marginTop: 30, padding: 10, backgroundColor: '#CF2A3A', borderRadius: 5 }}>
                                    <Text style={{ color: '#fff', textAlign: 'center' }}>Submit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setCancelModal(false)} style={{ marginTop: 10, alignSelf: 'center' }}>
                                    <Text style={{ color: '#cf2a3a', textAlign: 'center' }}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}   