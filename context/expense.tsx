import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type ExpenseProps = {
    id:number;
    trip_schedule_id: number | null;
    description: string;
    amount: number;
    expense_category_id: number;
    image_uri?: string;
}

type ExpenseContextType = {
    expenses: ExpenseProps[];
    setExpenses: React.Dispatch<React.SetStateAction<ExpenseProps[]>>;
    updateExpense: <K extends keyof ExpenseProps> (
        index: number,
        key: K,
        value: ExpenseProps[K]
    ) => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [expenses, setExpenses] = useState<ExpenseProps[]>([]);

    const updateExpense = useCallback(<K extends keyof ExpenseProps>(
        indentifier: number,
        key: K,
        value: ExpenseProps[K]
    ) => {
        setExpenses(prev => 
            prev.map((e) => e.id == indentifier ? { ...e, [key]: value }: e)
        );
    }, [])

    const contextValue = useMemo(() => ({
        expenses, 
        setExpenses, 
        updateExpense
    }), [expenses, setExpenses, updateExpense])

    return (
        <ExpenseContext.Provider value={ contextValue }>
            { children }
        </ExpenseContext.Provider>
    )
}

export const useExpense = () => {
    const context = useContext(ExpenseContext);
    if(!context) {
        throw new Error('useExpense must be used within ExpenseProvider');
    }

    return context;
}