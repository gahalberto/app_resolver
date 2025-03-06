import { Alert, Platform } from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as Contacts from 'expo-contacts';
import * as Calendar from 'expo-calendar';
import * as LocalAuthentication from 'expo-local-authentication';

/**
 * Solicita permissão de localização
 * @returns {Promise<boolean>} - Retorna true se a permissão foi concedida
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    
    if (foregroundStatus !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos da sua localização para registrar o ponto.');
      return false;
    }
    
    // Para localização em background (opcional)
    if (Platform.OS === 'android') {
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      
      if (backgroundStatus !== 'granted') {
        Alert.alert('Aviso', 'A localização em segundo plano não foi permitida. Algumas funcionalidades podem ser limitadas.');
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao solicitar permissão de localização:', error);
    return false;
  }
};

/**
 * Registra o dispositivo para receber notificações push
 * @param {string} userId - ID do usuário
 * @returns {Promise<string|null>} - Retorna o token de push ou null se falhar
 */
export const registerForPushNotifications = async (userId: string): Promise<string | null> => {
  try {
    if (!Device.isDevice) {
      Alert.alert('Dispositivo físico necessário', 'As notificações push não funcionam em emuladores');
      return null;
    }
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      Alert.alert('Permissão negada', 'Não conseguimos enviar notificações para você!');
      return null;
    }
    
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Push token:', token);
    
    // Configuração para Android
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#232c59',
      });
    }
    
    return token;
  } catch (error) {
    console.error('Erro ao registrar para notificações push:', error);
    return null;
  }
};

/**
 * Solicita permissão para acessar a câmera
 * @returns {Promise<boolean>} - Retorna true se a permissão foi concedida
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Camera.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos acessar sua câmera para esta funcionalidade.');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao solicitar permissão de câmera:', error);
    return false;
  }
};

/**
 * Solicita permissão para acessar a galeria de mídia
 * @returns {Promise<boolean>} - Retorna true se a permissão foi concedida
 */
export const requestMediaLibraryPermission = async (): Promise<boolean> => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos acessar sua galeria para esta funcionalidade.');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao solicitar permissão de galeria:', error);
    return false;
  }
};

/**
 * Salva um arquivo na galeria do dispositivo
 * @param {string} fileUri - URI do arquivo a ser salvo
 * @returns {Promise<boolean>} - Retorna true se o arquivo foi salvo com sucesso
 */
export const saveFileToDevice = async (fileUri: string): Promise<boolean> => {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos acessar seu armazenamento para salvar arquivos.');
      return false;
    }
    
    const asset = await MediaLibrary.createAssetAsync(fileUri);
    const album = await MediaLibrary.getAlbumAsync('Beit Yaakov');
    
    if (album === null) {
      await MediaLibrary.createAlbumAsync('Beit Yaakov', asset, false);
    } else {
      await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
    }
    
    Alert.alert('Sucesso', 'Arquivo salvo com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao salvar arquivo:', error);
    Alert.alert('Erro', 'Não foi possível salvar o arquivo.');
    return false;
  }
};

/**
 * Solicita permissão para acessar os contatos
 * @returns {Promise<boolean>} - Retorna true se a permissão foi concedida
 */
export const requestContactsPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Contacts.requestPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos acessar seus contatos para esta funcionalidade.');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao solicitar permissão de contatos:', error);
    return false;
  }
};

/**
 * Solicita permissão para acessar o calendário
 * @returns {Promise<boolean>} - Retorna true se a permissão foi concedida
 */
export const requestCalendarPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos acessar seu calendário para esta funcionalidade.');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao solicitar permissão de calendário:', error);
    return false;
  }
};

/**
 * Verifica se o dispositivo suporta autenticação biométrica
 * @returns {Promise<boolean>} - Retorna true se o dispositivo suporta biometria
 */
export const checkBiometricSupport = async (): Promise<boolean> => {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    
    if (!compatible) {
      Alert.alert('Biometria não suportada', 'Seu dispositivo não suporta autenticação biométrica.');
      return false;
    }
    
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    
    if (!enrolled) {
      Alert.alert('Biometria não configurada', 'Por favor, configure a biometria nas configurações do seu dispositivo.');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao verificar suporte biométrico:', error);
    return false;
  }
};

/**
 * Solicita autenticação biométrica
 * @param {string} promptMessage - Mensagem a ser exibida para o usuário
 * @returns {Promise<boolean>} - Retorna true se a autenticação foi bem-sucedida
 */
export const authenticateWithBiometrics = async (promptMessage: string): Promise<boolean> => {
  try {
    const isBiometricSupported = await checkBiometricSupport();
    
    if (!isBiometricSupported) {
      return false;
    }
    
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      disableDeviceFallback: false,
    });
    
    return result.success;
  } catch (error) {
    console.error('Erro na autenticação biométrica:', error);
    return false;
  }
};

/**
 * Solicita todas as permissões básicas necessárias para o aplicativo
 */
export const requestAllBasicPermissions = async (): Promise<void> => {
  await requestLocationPermission();
  
  if (Device.isDevice) {
    await Notifications.requestPermissionsAsync();
  }
  
  await requestCameraPermission();
  await requestMediaLibraryPermission();
}; 