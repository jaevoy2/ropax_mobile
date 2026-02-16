import { ExpenseProps } from '@/context/expense';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';

type RNFile = {
  uri: string;
  name: string;
  type: string;
};

export async function SaveExpenses(expenses: ExpenseProps[]) {
    const extras = Constants.expoConfig?.extra ?? {};
    const API_KEY = extras.API_KEY as string;
    const API_URL = extras.API_URL as string;
    const ORIGIN = extras.ORIGIN as string;

    try {
        for (let index = 0; index < expenses.length; index++) {
            const expense = expenses[index];
            
            // Skip if no image
            if (!expense.image_uri) {
                console.warn(`Expense ${index} has no image URI`);
                continue;
            }

            // Verify file exists
            const fileInfo = await FileSystem.getInfoAsync(expense.image_uri);
            if (!fileInfo.exists) {
                console.warn(`Image file does not exist at: ${expense.image_uri}`);
                continue;
            }

            console.log(`File exists: ${expense.image_uri}, size: ${fileInfo.size}`);

            const formData = new FormData();
            
            formData.append('trip_schedule_id', String(expense.trip_schedule_id));
            formData.append('description', expense.description);
            formData.append('amount', String(expense.amount));
            formData.append('expense_category_id', String(expense.expense_category_id));

            const uriParts = expense.image_uri.split('/');
            const filename = uriParts[uriParts.length - 1];
            
            // Ensure proper file:// protocol
            const fileUri = expense.image_uri.startsWith('file://') 
                ? expense.image_uri 
                : `file://${expense.image_uri}`;

            // Append file with proper format for React Native
            formData.append('image', {
                uri: fileUri,
                type: 'image/jpeg',
                name: filename,
            } as any);

            console.log('Sending expense with file:', {
                trip_schedule_id: expense.trip_schedule_id,
                image_uri: fileUri,
                filename: filename,
                fileSize: fileInfo.size,
            });

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
                console.error(`Failed to save expense ${index}:`, response);
                throw new Error(response.message || `Failed to save expense ${index}`);
            }

            console.log(`Expense ${index} saved successfully:`, response);
        }
        
        return { success: true, message: 'All expenses saved successfully' };
    } catch (error) {
        console.error('Error saving expenses:', error);
        throw error;
    }
}
