import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';

const { height } = Dimensions.get('window');

export default function AddExpenses() {

    return (
        <View style={{ backgroundColor: '#f1f1f1', position: 'relative', height: height }}>
            <TouchableOpacity onPress={() => router.back()} style={{ position: 'absolute', top: 45, left: 10, zIndex: 3 }}>
                <Ionicons name='chevron-back' size={30} color={'#fff'} />
            </TouchableOpacity>
            <View style={{ height: 100, backgroundColor: '#cf2a3a', paddingTop: 50 }}>
                <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Add Expense</Text>
            </View>
        </View>
    )
}