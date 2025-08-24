// components/hooks/useUser.js
import { useContext } from 'react';
import { UserContext } from '../../auth/UserProvider';

export const useUser = () => {
  return useContext(UserContext);
};