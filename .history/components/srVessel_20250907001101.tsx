import { Text, View } from "react-native";


type SRVesselProps = {
    seat: number | string;
}

export default function SRVesselSeats () {

    return (
        <View style={{ width: '100%' }}>
            <Text style={{ textAlign: 'center' }}>BUSINESS CLASS</Text>
        </View>
    )
}
