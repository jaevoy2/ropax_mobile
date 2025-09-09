import { Image, Text, View } from 'react-native';

const logo_text = require('@/assets/images/logo.png');
const logo_icon = require('@/assets/images/logo_icon.png');

export default function TicketGenerator() {
    return (
        <View style={{ backgroundColor: '#f1f1f1' }}>
            <View style={{ height: 160, backgroundColor: '#cf2a3a', paddingTop: 50 }}>
                <Text style={{ fontSize: 15, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>E-Ticket</Text>
            </View>
            <View style={{ position: 'relative' }}>
                <View style={{ backgroundColor: '#fff', position: 'absolute', top: -60, left: '50%', transform: [{ translateX: '-50%' }], width: '85%', height: 400, borderRadius: 10, padding: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <Image source={logo_icon} style={{ width: 36, height: 35 }} />
                            <Image source={logo_text} style={{ width: 95, height: 25 }} />
                        </View>
                        <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                            <Text style={{ color: '#cf2a3a', fontSize: 15, fontWeight: 'bold' }}>E-TICKET</Text>
                            <Text style={{ fontSize: 8 }}>This is NOT an official receipt.</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    )
}