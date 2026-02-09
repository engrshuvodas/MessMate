import React, { createContext, useState, useEffect } from 'react';
import dayjs from 'dayjs';

export const AppContext = createContext();

const initialMembers = [
    { id: '1', name: 'Member 1' },
    { id: '2', name: 'Member 2' },
    { id: '3', name: 'Member 3' },
    { id: '4', name: 'Member 4' },
    { id: '5', name: 'Member 5' },
];

const initialExpenses = [
    {
        id: '1',
        date: dayjs().format('YYYY-MM-01'),
        details: 'Rice, Oil, Onion',
        cost: 1500,
        addedBy: ['Member 1'],
    },
    {
        id: '2',
        date: dayjs().format('YYYY-MM-02'),
        details: 'Chicken, Potato',
        cost: 800,
        addedBy: ['Member 2', 'Member 3'],
    },
];

export const AppProvider = ({ children }) => {
    const [members, setMembers] = useState(initialMembers);
    const [expenses, setExpenses] = useState(initialExpenses);

    // Mock API calls
    const addExpense = (newExpense) => {
        const expenseWithId = { ...newExpense, id: Date.now().toString() };
        setExpenses([expenseWithId, ...expenses]);
        return Promise.resolve(expenseWithId);
    };

    const addMember = (name) => {
        const newMember = { id: Date.now().toString(), name };
        setMembers([...members, newMember]);
        return Promise.resolve(newMember);
    };

    const updateMember = (id, name) => {
        setMembers(members.map(m => m.id === id ? { ...m, name } : m));
        return Promise.resolve();
    };

    const deleteMember = (id) => {
        setMembers(members.filter(m => m.id !== id));
        return Promise.resolve();
    };

    return (
        <AppContext.Provider value={{
            members,
            expenses,
            addExpense,
            addMember,
            updateMember,
            deleteMember
        }}>
            {children}
        </AppContext.Provider>
    );
};
