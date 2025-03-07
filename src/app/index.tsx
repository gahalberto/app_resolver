import { Input } from "@/components/input";
import { View, Text, SafeAreaView, Image, Keyboard, Alert } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";

import {
  MapPin,
  Calendar as IconCalendar,
  Settings2,
  UserRoundPlus,
  ArrowRight,
  AtSign,
  Lock,
  User,
  ArrowLeft,
} from "lucide-react-native";
import { colors } from "@/styles/colors";

import { Button } from "@/components/button";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Loading } from "@/components/loading";
import { z } from "zod";
import { userStorage } from "@/storage/user";
import { useUser } from "@/contexts/UserContext";

// Esquema de validação usando Zod para LOGIN
const loginSchema = z.object({
  email: z
    .string()
    .email("Digite um e-mail válido")
    .min(1, "Email é obrigatório"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

// Esquema de validação usando Zod para REGISTER
const registerSchema = z
  .object({
    name: z.string({ message: "Campo obrigatório" }),
    email: z
      .string({ message: "Campo obrigatório" })
      .email({ message: "Email inválido" }),
    phone: z
      .string({ message: "Campo obrigatório" })
      .min(6, { message: "Telefone é obrigatório" }),
    password: z
      .string({ message: "Campo obrigatório" })
      .min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
    confirmPassword: z
      .string({ message: "Campo obrigatório" })
      .min(6, { message: "Confirmação de senha é obrigatória" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"], // Caminho para o campo que está com erro
  });

type LoginFormValues = z.infer<typeof loginSchema>;

enum StepForm {
  LOGIN = 1,
  REGISTER = 2,
}

enum MODAL {
  NONE = 0,
  CALENDAR = 1,
  GUESTS = 2,
}

export default function Index() {
  const { login, register } = useUser();

  // LOADING
  const [isLoadingRegister, setIsLoadingRegister] = useState(false);
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [isGettingUser, setIsGettingUser] = useState(true);

  const [stepForm, setStepForm] = useState<StepForm>(StepForm.LOGIN);

  // ZOD
  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(
      stepForm === StepForm.LOGIN ? loginSchema : registerSchema
    ),
    defaultValues: {
      email: "gahalberto@icloud.com",
      password: "qwerty",
      name: "Gabriel Alberto",
      phone: "11994917885",
      confirmPassword: "qwerty",
    },
  });

  async function handleLoginPage(formData: any) {
    if (!formData.email || !formData.password) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }

    try {
      setIsLoadingLogin(true);
      await login(formData.email, formData.password);
      Alert.alert("Sucesso", "Login realizado com sucesso");
    } catch (error) {
      Alert.alert("Erro", "Credenciais inválidas");
    } finally {
      setIsLoadingLogin(false);
    }
  }

  async function onSubmitRegisterOne(formData: any) {
    setIsLoadingRegister(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      Alert.alert("Sucesso", "Conta criada e login realizado");
    } catch (error: any) {
      setIsLoadingRegister(false);
      console.log(error.response);
      if (error.response) {
        const errorMessage =
          error.response.data.message || "Não foi possível fazer o registro.";
        Alert.alert("Erro", errorMessage);
      } else {
        Alert.alert("Erro", "Erro inesperado, teste novamente mais tarde.");
      }
    } finally {
      setIsLoadingRegister(false);
    }
  }

  async function getUser() {
    try {
      const userData = await userStorage.get();
      if (!userData) {
        return setIsGettingUser(false);
      }

      console.log("GetUser roleId:", userData.roleId);
      
      // Redirecionar com base no roleId
      if (userData.roleId == 3) {
        console.log("Redirecionando para /admin");
        router.push("/admin" as any);
      } else {
        console.log("Redirecionando para /mashguiach");
        router.push("/mashguiach" as any);
      }
    } catch (error) {
      setIsGettingUser(false);
      console.log(error);
    }
  }

  useEffect(() => {
    reset(); // Reseta os valores ao trocar de formulário
  }, [stepForm]);

  useEffect(() => {
    getUser();
  }, []);

  if (isGettingUser) {
    return <Loading />;
  }

  return (
    <View className="flex-1 items-center justify-center px-5">
      <Image
        source={require("../assets/logo.png")}
        className="h-16"
        resizeMode="contain"
      />

      <Image source={require("../assets/bg.png")} className="absolute" />

      <Text className="text-zinc-400 font-regular text-center text-lg mt-3">
        Faça login no BYK APP{"\n"} Dep. de Kashrut
      </Text>

      {/* LOGIN */}

      {stepForm === StepForm.LOGIN && (
        <View className="flex-col w-full bg-bkblue-900 rounded-xl p-4 my-8 border border-zinc-800">
          <Input>
            <User color={colors.zinc[400]} size={20} />
            <Controller
              name="email"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input.Field
                  placeholder="E-mail?"
                  keyboardType="email-address"
                  editable={stepForm === StepForm.LOGIN}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </Input>
          <View>
            {errors.email && (
              <Text className="text-white">
                {String(errors.email?.message)}
              </Text>
            )}
          </View>
          <Input>
            <Lock color={colors.zinc[400]} size={20} />
            <Controller
              name="password" // Corrigido aqui
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input.Field
                  placeholder="Senha?"
                  secureTextEntry
                  editable={stepForm === StepForm.LOGIN}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
          </Input>
          <View>
            {errors.password && (
              <Text className="text-white">
                {String(errors.password.message)}
              </Text>
            )}
          </View>

          <Button
            onPress={handleSubmit(handleLoginPage)}
            isLoading={isLoadingLogin}
            className="mt-4"
          >
            <Button.Title>
              {stepForm === StepForm.LOGIN ? "Entrar" : "Registrar-se"}{" "}
            </Button.Title>
            <ArrowRight color={colors.zinc[950]} size={20} />
          </Button>

          <View className="flex w-full items-center my-4">
            <View className="w-3/4 h-px bg-gray-300" />
          </View>

          <Button
            variant="tertiary"
            onPress={() => setStepForm(StepForm.REGISTER)}
            isLoading={false}
          >
            <Button.Title>
              {stepForm === StepForm.LOGIN
                ? "Nova conta?"
                : "Já tem uma conta?"}{" "}
            </Button.Title>
            <ArrowRight color={colors.zinc[950]} size={20} />
          </Button>
        </View>
      )}

      {/* REGISTER */}
      {stepForm === StepForm.REGISTER && (
        <View className="flex-col w-full bg-bkblue-900 rounded-xl p-4 my-8 border border-zinc-800">
          <Input>
            <User color={colors.zinc[400]} size={20} />
            <Controller
              name="name"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input.Field
                  placeholder="Digite seu nome completo"
                  onChangeText={onChange}
                  value={value}
                  returnKeyType="next"
                />
              )}
            />
          </Input>
          {errors.name && (
            <Text className="text-white">{String(errors.name.message)}</Text>
          )}

          <Input>
            <User color={colors.zinc[400]} size={20} />
            <Controller
              name="phone"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input.Field
                  keyboardType="phone-pad" // Abre teclado numérico com símbolos
                  placeholder="Telefone com DDD"
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </Input>
          {errors.phone && (
            <Text className="text-white">{String(errors.phone.message)}</Text>
          )}

          <Input>
            <User color={colors.zinc[400]} size={20} />
            <Controller
              name="email"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input.Field
                  placeholder="Digite seu melhor e-mail"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </Input>
          {errors.email && (
            <Text className="text-white">{String(errors.email.message)}</Text>
          )}

          <Input>
            <Lock color={colors.zinc[400]} size={20} />
            <Controller
              name="password"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input.Field
                  placeholder="Digite uma senha"
                  autoCapitalize="none"
                  secureTextEntry
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </Input>
          {errors.password && (
            <Text className="text-white">
              {String(errors.password.message)}
            </Text>
          )}

          <Input>
            <Lock color={colors.zinc[400]} size={20} />
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input.Field
                  placeholder="Confirme a senha"
                  autoCapitalize="none"
                  secureTextEntry
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </Input>
          {errors.confirmPassword && (
            <Text className="text-white">
              {String(errors.confirmPassword.message)}
            </Text>
          )}

          <Button
            className="mt-8"
            onPress={handleSubmit(onSubmitRegisterOne)}
            isLoading={isLoadingRegister}
          >
            <Button.Title>Criar uma nova conta</Button.Title>
            <ArrowRight color={colors.zinc[950]} size={20} />
          </Button>

          <View className="flex w-full items-center my-4">
            <View className="w-3/4 h-px bg-gray-300" />
          </View>

          <Button
            variant="tertiary"
            onPress={() => setStepForm(StepForm.LOGIN)} // Valida antes de avançar
            isLoading={false}
          >
            <Button.Title>Já tem uma conta?</Button.Title>
            <ArrowRight color={colors.zinc[950]} size={20} />
          </Button>
        </View>
      )}

      <Text className="text-zinc-500 font-regular text-center text-base">
        Ao fazer seu login ou criar a sua conta{" "}
        <Text className="text-bkGolden-300">MashguiachApp</Text> você
        automaticamente concorda com os nossos{" "}
        <Text className="text-zinc-300 underline">
          termos de uso e políticas de privacidade.
        </Text>
      </Text>

      <Text className="text-white">Login</Text>
    </View>
  );
}
