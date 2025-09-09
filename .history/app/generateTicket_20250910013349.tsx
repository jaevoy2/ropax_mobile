import { Text, View } from 'react-native';


export default function TicketGenerator() {
    return (
        <View style={{ backgroundColor: '#f1f1f1' }}>
            <View style={{ height: 160, backgroundColor: '#cf2a3a', paddingTop: 40 }}>
                <Text style={{ fontSize: 15, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>E-Ticket</Text>
            </View>
            <View style={{ position: 'relative' }}>
                <View style={{ backgroundColor: '#fff', position: 'absolute', top: -50, left: '50%', transform: [{ translateX: '-50%' }], width: '85%', height: 400 }}>

                </View>
            </View>
        </View>
    )
}