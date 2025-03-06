import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { requestAllBasicPermissions } from '@/utils/permissions';
import { useUser } from '@/contexts/UserContext';

interface PermissionsManagerProps {
  children: React.ReactNode;
}

export function PermissionsManager({ children }: PermissionsManagerProps) {
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      // Solicitar permissões quando o usuário estiver logado
      requestAllBasicPermissions();
    }
  }, [user]);

  return <>{children}</>;
}

export default PermissionsManager; 