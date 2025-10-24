import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface User {
    id: string;
    name: string;
}

interface AuthContextType {
    currentUser: User | null;
    login: (name: string) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('gemini-style-user');
            if (storedUser) {
                setCurrentUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Falha ao analisar o usuário do localStorage", error);
            localStorage.removeItem('gemini-style-user');
        }
        setIsLoading(false);
    }, []);

    const login = (name: string) => {
        if (!name.trim()) return;
        // Simula a criação de um ID de usuário único do Google
        const user: User = {
            id: `google_${name.trim().toLowerCase().replace(/\s+/g, '_')}`,
            name: name.trim(),
        };
        localStorage.setItem('gemini-style-user', JSON.stringify(user));
        setCurrentUser(user);
    };

    const logout = () => {
        localStorage.removeItem('gemini-style-user');
        setCurrentUser(null);
    };

    const value = { currentUser, login, logout, isLoading };

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};