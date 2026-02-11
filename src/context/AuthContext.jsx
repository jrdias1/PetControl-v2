import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Usamos sessionStorage em vez de localStorage para cumprir a restrição 
    // de segurança, garantindo que a sessão expire ao fechar a guia, 
    // mas persista no refresh.
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return sessionStorage.getItem('petcontrol_session') === 'active';
    });
    const [user, setUser] = useState(null);

    const login = (userData) => {
        // No futuro, aqui receberíamos um token real do n8n
        setIsAuthenticated(true);
        setUser(userData);
        sessionStorage.setItem('petcontrol_session', 'active');
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        sessionStorage.removeItem('petcontrol_session');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};
