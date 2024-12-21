import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_STORAGE_KEY = "@planner:userId";

type userDetails = {
  id: string;
  name: string;
  email: string;
  token: string;
};

async function save({ id, name, email, token }: userDetails) {
  try {
    await AsyncStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify({ id, name, email, token })
    );
  } catch (error) {
    throw error;
  }
}

async function get() {
  try {
    const user = await AsyncStorage.getItem(USER_STORAGE_KEY);
    return user ? JSON.parse(user) : null; // Corrigido para fazer o parsing
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
