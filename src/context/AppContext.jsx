import React, { createContext, useState, useEffect } from 'react';
import dayjs from 'dayjs';

export const AppContext = createContext();

const initialMembers = [
    { id: '1', name: 'Shuvo' },
    { id: '2', name: 'Animesh' },
    { id: '3', name: 'Utshab' },
    { id: '4', name: 'Sajib' },
    { id: '5', name: 'Dipto' },
];

const initialExpenses = [
    {
        id: '1',
        date: dayjs().format('YYYY-MM-01'),
        details: 'Rice 25kg, Soya Oil 5L',
        cost: 3500,
        paidBy: { '1': 3500 },
    },
    {
        id: '2',
        date: dayjs().format('YYYY-MM-02'),
        details: 'Chicken 4kg, Eggs 2 Dozen',
        cost: 1200,
        paidBy: { '2': 600, '3': 600 },
    },
];

export const AppProvider = ({ children }) => {
    const [settings, setSettings] = useState(() => {
        try {
            const saved = localStorage.getItem('bb_settings');
            return saved ? JSON.parse(saved) : {
                currency: '₹',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
                theme: 'system'
            };
        } catch (e) {
            return { currency: '₹', timezone: 'UTC', theme: 'system' };
        }
    });

    const [resolvedTheme, setResolvedTheme] = useState('light');

    useEffect(() => {
        const updateResolvedTheme = () => {
            if (settings.theme === 'system') {
                const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                setResolvedTheme(isDark ? 'dark' : 'light');
            } else {
                setResolvedTheme(settings.theme);
            }
        };

        updateResolvedTheme();

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => {
            if (settings.theme === 'system') {
                updateResolvedTheme();
            }
        };

        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, [settings.theme]);

    useEffect(() => {
        if (resolvedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [resolvedTheme]);

    const [members, setMembers] = useState(() => {
        try {
            const saved = localStorage.getItem('bb_members');
            return saved ? JSON.parse(saved) : initialMembers;
        } catch (e) {
            return initialMembers;
        }
    });

    const [expenses, setExpenses] = useState(() => {
        try {
            const saved = localStorage.getItem('bb_expenses');
            return saved ? JSON.parse(saved) : initialExpenses;
        } catch (e) {
            return initialExpenses;
        }
    });

    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        try {
            const auth = localStorage.getItem('bb_auth');
            return auth === 'true';
        } catch (e) {
            return false;
        }
    });

    // Listen for storage changes in other tabs
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'bb_auth') {
                setIsAuthenticated(e.newValue === 'true');
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        localStorage.setItem('bb_settings', JSON.stringify(settings));
    }, [settings]);

    useEffect(() => {
        localStorage.setItem('bb_members', JSON.stringify(members));
    }, [members]);

    useEffect(() => {
        localStorage.setItem('bb_expenses', JSON.stringify(expenses));
    }, [expenses]);

    const updateSettings = (newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const login = (username, password) => {
        if (username === 'admin' && password === 'admin') {
            setIsAuthenticated(true);
            localStorage.setItem('bb_auth', 'true');
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        localStorage.setItem('bb_auth', 'false');
    };

    const addExpense = (newExpense) => {
        const expenseWithId = { ...newExpense, id: Date.now().toString() };
        setExpenses([expenseWithId, ...expenses]);
        return Promise.resolve(expenseWithId);
    };

    const updateExpense = (updatedExpense) => {
        setExpenses(expenses.map(ex => ex.id === updatedExpense.id ? updatedExpense : ex));
        return Promise.resolve(updatedExpense);
    };

    const deleteExpense = (id) => {
        setExpenses(expenses.filter(ex => ex.id !== id));
        return Promise.resolve();
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
            isAuthenticated,
            settings,
            resolvedTheme,
            updateSettings,
            login,
            logout,
            addExpense,
            updateExpense,
            deleteExpense,
            addMember,
            updateMember,
            deleteMember
        }}>
            {children}
        </AppContext.Provider>
    );
};
