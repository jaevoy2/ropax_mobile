import { Text, View } from "react-native";


type SRVesselProps = {
    seat: number | string;
}

export default function SRVesselSeats () {

    return (
        <View style={{ width: '100%', backgroundColor: '#fff' }}>
            <Text style={{ textAlign: 'center' }}>BUSINESS CLASS</Text>
        </View>
    )
}
