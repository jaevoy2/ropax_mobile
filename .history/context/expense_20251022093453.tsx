import React, { createContext, useState } from "react";

export type ExpenseProps = {
    trip_id: number;
    description: string;
    amount: number;
    categoryID: number;
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

export const ContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [expenses, setExpenses] = useState<ExpenseProps[]>([]);

    const updateExpense = <K extends keyof ExpenseProps>(
        indentifier: number,
        key: K,
        value: ExpenseProps[K]
    ) => setExpenses((prev) => 
        prev.map((e, index) => index == indentifier ? { ...e, [key]: value }: e)
    )

    return (
        <ExpenseContext.Provider value={{ expenses, setExpenses, updateExpense }}>
            { children }
        </ExpenseContext.Provider>
    )
}