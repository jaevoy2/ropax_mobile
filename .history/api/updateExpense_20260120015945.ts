import Constants from "expo-constants";


export async function UpdateExpense(id: number, trip_schedule_id: number, description: string, amount: number, expense_category_id: number) {
    const extras = Constants.expoConfig?.extra ?? {};
    const API_URL = extras.API_URL as string;
    const API_KEY = extras.API_KEY as string;
    const ORIGIN = extras.ORIGIN as string;

    try {
        const res = await fetch(`${API_URL}update/expense`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-api-key': `${API_KEY}`,
                'Origin': `${ORIGIN}`
            },
            body: JSON.stringify({
                id,
                trip_schedule_id,
                description,
                amount,
                expense_category_id
            })
        });

        const response = await res.json();

        if(!res.ok) {
            throw new Error(response.message);
        }

        return response;
    }catch(error) {
        throw error;
    }
}