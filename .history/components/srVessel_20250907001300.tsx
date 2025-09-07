import { Dimensions, Text, View } from "react-native";


type SRVesselProps = {
    seat: number | string;
}

const { width, height } = Dimensions.get('screen');

export default function SRVesselSeats () {

    return (
        <View style={{ width: '100%', backgroundColor: '#fff', marginTop: 20 }}>
            <Text style={{ textAlign: 'center' }}>BUSINESS CLASS</Text>
        </View>
    )
}
