import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext()

export const useUserInfo = () => {
    return useContext(UserContext);
}

export const UserProvider = ({ children }) => {

    const [user, setUser] = useState('');
    const [pwdLen, setPwdLen] = useState(0);

    const value = { user, setUser, pwdLen, setPwdLen };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )

}