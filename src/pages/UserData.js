import { createContext, useContext, useState } from 'react';

const UserContext = createContext();
// declare user context to use the data globally

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
// initialize userid and set the userid for updating the userid

// allow all the children to access the user context(all screens)
  return (
    <UserContext.Provider value={{ userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
};


export const useUser = () => useContext(UserContext);