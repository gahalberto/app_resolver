import { api } from "./api";

type RegisterProps = {
  name: string;
  phone: string;
  email: string;
  password: string;
};

export async function Login(email: string, password: string) {
  try {
    const { data } = await api.post("/login", {
      email,
      password,
    });
    return data;
  } catch (error) {
    throw error;
  }
}

export async function Register({
  name,
  phone,
  email,
  password,
}: RegisterProps) {
  try {
    const { data } = await api.post("/register", {
      name,
      phone,
      email,
      password,
    });

    return data;
  } catch (error) {
    throw error;
  }
}

export const authServer = {
  Login,
  Register,
};
