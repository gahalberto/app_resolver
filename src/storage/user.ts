import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_STORAGE_KEY = "@planner:userId";

type userDetails = {
  id: string;
  name: string;
  email: string;
  token: string;
  roleId: string;
};

async function save({ id, name, email, token, roleId }: userDetails) {
  try {
    await AsyncStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify({ id, name, email, token, roleId })
    );
  } catch (error) {
    throw error;
  }
}

async function get() {
  try {
    const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  } catch (error) {
    throw error;
  }
}

async function remove() {
  try {
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
  } catch (error) {
    throw error;
  }
}

export const userStorage = {
  save,
  get,
  remove,
};
