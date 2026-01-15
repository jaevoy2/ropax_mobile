import { PassengerProps } from "@/context/passenger";
import { TripContextProps } from "@/context/trip";
import Constants from "expo-constants";

export async function SaveBooking(trip: TripContextProps, passengers: PassengerProps[], stationID: number) {;
    const extras = Constants.expoConfig?.extra ?? {};
    const API_KEY = extras.API_KEY as string;
    const API_URL = extras.API_URL as string;
    const ORIGIN = extras.ORIGIN as string;

    try {
        const res = await fetch(`${API_URL}booking/save`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-api-key': `${API_KEY}`,
                'Origin': `${ORIGIN}`
            },
            body: JSON.stringify({
                station_id: stationID,
                trip_schedule_id: trip.id,
                web_code: trip.webCode,
                passengers: passengers.map((p) => ({
                    first_name: p.name?.split(',')[1],
                    last_name: p.name?.split(',')[0],
                    gender: p.gender,
                    age: p.age,
                    address: p.address ?? '',
                    nationality: p?.nationality,
                    accommodation_type_id: p.accommodationID ?? '',
                    passenger_type_id: p.passType_id,
                    seat_no: String(p.seatNumber),

                    infants: Array.isArray(p.infant) ? p.infant?.map((i) => ({
                        first_name: i.name.split(',')[1],
                        last_name: i.name.split(',')[0],
                        age: i.age,
                        gender: i.gender,
                        address: p.address ?? '',
                        nationality: p.nationality ?? '',
                        accommodation_type_id: p.accommodationID,
                        passenger_type_id: i.passType_id,
                        seat_no: 'N/A',
                    })) : [],

                    cargos: Array.isArray(p.cargo) ? p.cargo?.map((c) => ({
                        cargo_option_id: c.cargoOptionID,
                        quantity: c.quantity,
                        note: trip.note,
                        amount: c.cargoAmount,
                        trip_id: trip.id
                     })) : []
                }))
            })
        });
    
        const response = await res.json();

        if(!res.ok) {
            throw new Error(response.error);
        }

        return response;

    } catch(error) {
        throw error;
    }

}