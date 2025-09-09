import { Text, View } from 'react-native';


export default function TicketGenerator() {
    return (
        <View style={{ backgroundColor: '#f1f1f1' }}>
            <View style={{ height: 160, backgroundColor: '#cf2a3a', paddingTop: 40 }}>
                <Text style={{ fontSize: 12, color: '#fff', fontWeight: '900' }}>E-TICKET GENERATOR</Text>
            </View>
        </View>
    )
}