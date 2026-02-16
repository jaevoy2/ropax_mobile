import { ExpenseProps } from '@/context/expense';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';

type RNFile = {
  uri: string;
  name: string;
  type: string;
};

export async function SaveExpenses(expenses: ExpenseProps[]) {
    const formData = new FormData();
    const extras = Constants.expoConfig?.extra ?? {};
    const API_KEY = extras.API_KEY as string;
    const API_URL = extras.API_URL as string;
    const ORIGIN = extras.ORIGIN as string;

    try {
        for (let index = 0; index < expenses.length; index++) {
            const expense = expenses[index];
            
            formData.append(`trip_schedule_id[${index}]`, String(expense.trip_schedule_id));
            formData.append(`description[${index}]`, expense.description);
            formData.append(`amount[${index}]`, String(expense.amount));
            formData.append(`expense_category_id[${index}]`, String(expense.expense_category_id));

            if (expense.image_uri) {
                const uriParts = expense.image_uri.split('/');
                const filename = uriParts[uriParts.length - 1];
                
                // Read file as base64 and convert to blob
                const fileBase64 = await FileSystem.readAsStringAsync(
                    expense.image_uri,
                    { encoding: FileSystem.EncodingType.Base64 }
                );
                
                // Create a blob from base64
                const response = await fetch(
                    `data:image/jpeg;base64,${fileBase64}`
                );
                const blob = await response.blob();
                
                formData.append(`receipt[${index}]`, blob, filename);
            }
        }

        const res = await fetch(`${API_URL}save/expenses`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'x-api-key': `${API_KEY}`,
                'Origin': `${ORIGIN}`,
            },
            body: formData,
        });
    
        const response = await res.json();

        if (!res.ok) {
            throw new Error(response.message || 'Failed to save expenses');
        }

        return response;
    } catch (error) {
        throw error;
    }
}
