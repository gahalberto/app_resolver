import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Image,
  Alert
} from "react-native";
import { PageLayout } from "@/components/PageLayout";
import { api } from "@/server/api";
import { colors } from "@/styles/colors";
import { useUser } from "@/contexts/UserContext";
import { useLocalSearchParams, router } from "expo-router";
import { 
  Clock, 
  BookOpen, 
  Award, 
  Calendar, 
  User, 
  CheckCircle, 
  ArrowLeft,
  PlayCircle
} from "lucide-react-native";

// Interface para o tipo de curso
interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  imageUrl: string;
  instructor: string;
  level: string;
  enrollmentStatus?: "enrolled" | "completed" | "available";
  modules?: {
    id: string;
    title: string;
    duration: string;
    description: string;
    completed?: boolean;
  }[];
  startDate?: string;
  endDate?: string;
  prerequisites?: string[];
  objectives?: string[];
}

export default function CourseDetailsPage() {
  const { id } = useLocalSearchParams();
  const { user } = useUser();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      // Tentar buscar da API usando o ID como parâmetro de consulta
      const response = await api.get('/courses', { 
        params: { id } 
      });
      setCourse(response.data);
    } catch (err) {
      console.error("Erro ao buscar detalhes do curso:", err);
      
      // Usar dados de exemplo se a API falhar
      if (mockCourses.some(c => c.id === id)) {
        setCourse(mockCourses.find(c => c.id === id) || null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      Alert.alert("Erro", "Você precisa estar logado para se inscrever em um curso.");
      return;
    }

    setEnrolling(true);
    try {
      // Enviando o ID como parâmetro de consulta
      await api.post('/courses/enroll', null, {
        params: { id }
      });
      
      // Atualizar o status do curso localmente
      setCourse(prev => prev ? { ...prev, enrollmentStatus: "enrolled" } : null);
      
      Alert.alert("Sucesso", "Inscrição realizada com sucesso!");
    } catch (err) {
      console.error("Erro ao se inscrever no curso:", err);
      Alert.alert("Erro", "Não foi possível realizar a inscrição. Tente novamente.");
    } finally {
      setEnrolling(false);
    }
  };

  // Dados de exemplo para quando a API falha
  const mockCourses: Course[] = [
    {
      id: "1",
      title: "Introdução à Kashrut",
      description: "Aprenda os fundamentos da Kashrut e como aplicá-los no dia a dia. Este curso abrange os princípios básicos das leis dietéticas judaicas, incluindo a separação de carne e leite, identificação de alimentos kosher, e procedimentos para tornar uma cozinha kosher.",
      duration: "8 horas",
      imageUrl: "",
      instructor: "Rabino Cohen",
      level: "Iniciante",
      enrollmentStatus: "available",
      startDate: "2023-11-15",
      endDate: "2023-12-15",
      prerequisites: [
        "Conhecimento básico do judaísmo",
        "Familiaridade com termos hebraicos básicos"
      ],
      objectives: [
        "Compreender os princípios fundamentais da Kashrut",
        "Identificar alimentos kosher e não-kosher",
        "Aprender a organizar uma cozinha kosher",
        "Entender as bases halácticas das leis dietéticas"
      ],
      modules: [
        {
          id: "1-1",
          title: "Fundamentos da Kashrut",
          duration: "2 horas",
          description: "Introdução aos princípios básicos e origem das leis de Kashrut."
        },
        {
          id: "1-2",
          title: "Separação de Carne e Leite",
          duration: "2 horas",
          description: "Entendendo as regras de separação e os períodos de espera."
        },
        {
          id: "1-3",
          title: "Identificação de Alimentos Kosher",
          duration: "2 horas",
          description: "Como identificar selos kosher e entender certificações."
        },
        {
          id: "1-4",
          title: "Organizando uma Cozinha Kosher",
          duration: "2 horas",
          description: "Passos práticos para kasherizar utensílios e organizar a cozinha."
        }
      ]
    },
    {
      id: "2",
      title: "Supervisão de Cozinhas Industriais",
      description: "Técnicas avançadas para supervisão de cozinhas industriais seguindo as leis de Kashrut. Este curso é destinado a mashguichim que desejam se especializar na supervisão de grandes operações de alimentos.",
      duration: "12 horas",
      imageUrl: "",
      instructor: "Rabino Levi",
      level: "Avançado",
      enrollmentStatus: "enrolled",
      startDate: "2023-10-01",
      endDate: "2023-11-30",
      prerequisites: [
        "Certificação básica em Kashrut",
        "Experiência prévia em supervisão kosher",
        "Conhecimento avançado das leis de Kashrut"
      ],
      objectives: [
        "Desenvolver protocolos de supervisão para cozinhas industriais",
        "Aprender a gerenciar equipes de supervisão kosher",
        "Entender os desafios específicos de diferentes tipos de indústrias alimentícias",
        "Implementar sistemas de controle de qualidade kosher"
      ],
      modules: [
        {
          id: "2-1",
          title: "Desafios da Supervisão Industrial",
          duration: "3 horas",
          description: "Identificação dos principais desafios em ambientes industriais.",
          completed: true
        },
        {
          id: "2-2",
          title: "Protocolos de Inspeção",
          duration: "3 horas",
          description: "Desenvolvimento de protocolos eficientes para grandes operações.",
          completed: true
        },
        {
          id: "2-3",
          title: "Gestão de Equipes de Supervisão",
          duration: "3 horas",
          description: "Técnicas para coordenar equipes de mashguichim em grandes operações."
        },
        {
          id: "2-4",
          title: "Estudos de Caso e Soluções",
          duration: "3 horas",
          description: "Análise de casos reais e desenvolvimento de soluções práticas."
        }
      ]
    },
    {
      id: "3",
      title: "Certificação Kosher Internacional",
      description: "Preparação para certificação internacional de supervisão Kosher. Este curso abrangente prepara profissionais para atuar em qualquer parte do mundo, entendendo as diferentes tradições e requisitos kosher globais.",
      duration: "20 horas",
      imageUrl: "",
      instructor: "Rabino Goldstein",
      level: "Especialista",
      enrollmentStatus: "completed",
      startDate: "2023-01-15",
      endDate: "2023-04-15",
      prerequisites: [
        "Certificação avançada em Kashrut",
        "Mínimo de 2 anos de experiência em supervisão kosher",
        "Conhecimento de inglês intermediário"
      ],
      objectives: [
        "Obter certificação reconhecida internacionalmente",
        "Compreender as diferenças entre padrões kosher globais",
        "Desenvolver habilidades para supervisão em contextos multiculturais",
        "Dominar a documentação e processos internacionais de certificação"
      ],
      modules: [
        {
          id: "3-1",
          title: "Padrões Kosher Globais",
          duration: "5 horas",
          description: "Comparação entre diferentes padrões de certificação ao redor do mundo.",
          completed: true
        },
        {
          id: "3-2",
          title: "Desafios Internacionais",
          duration: "5 horas",
          description: "Identificação e solução de desafios específicos em diferentes países.",
          completed: true
        },
        {
          id: "3-3",
          title: "Documentação Internacional",
          duration: "5 horas",
          description: "Processos e requisitos de documentação para certificação internacional.",
          completed: true
        },
        {
          id: "3-4",
          title: "Avaliação e Certificação Final",
          duration: "5 horas",
          description: "Preparação para o exame de certificação e simulados práticos.",
          completed: true
        }
      ]
    }
  ];

  if (loading) {
    return (
      <PageLayout title="Detalhes do Curso">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.bkGolden[300]} />
        </View>
      </PageLayout>
    );
  }

  if (!course) {
    return (
      <PageLayout title="Detalhes do Curso">
        <View className="flex-1 items-center justify-center">
          <Text className="text-white text-lg mb-4">Curso não encontrado</Text>
          <TouchableOpacity 
            className="bg-bkGolden-300 px-4 py-2 rounded-md"
            onPress={() => router.back()}
          >
            <Text className="text-bkblue-900 font-medium">Voltar</Text>
          </TouchableOpacity>
        </View>
      </PageLayout>
    );
  }

  // Determinar a cor do status de inscrição
  const getStatusColor = () => {
    switch (course.enrollmentStatus) {
      case "enrolled":
        return colors.lime[300];
      case "completed":
        return colors.bkGolden[300];
      default:
        return colors.zinc[400];
    }
  };

  // Determinar o texto do status de inscrição
  const getStatusText = () => {
    switch (course.enrollmentStatus) {
      case "enrolled":
        return "Inscrito";
      case "completed":
        return "Concluído";
      default:
        return "Disponível";
    }
  };

  return (
    <PageLayout title="Detalhes do Curso">
      <ScrollView className="flex-1">
        {/* Imagem do curso */}
        <View className="w-full h-48 bg-bkblue-600">
          {course.imageUrl ? (
            <Image 
              source={{ uri: course.imageUrl }} 
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <BookOpen size={64} color={colors.bkblue[400]} />
            </View>
          )}
          
          {/* Botão de voltar */}
          <TouchableOpacity 
            className="absolute top-4 left-4 bg-bkblue-800 rounded-full p-2"
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.bkGolden[300]} />
          </TouchableOpacity>
        </View>
        
        <View className="p-4">
          {/* Cabeçalho do curso */}
          <View className="mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-white text-2xl font-bold">{course.title}</Text>
              <View 
                className="px-3 py-1 rounded-full" 
                style={{ backgroundColor: getStatusColor() + '20' }}
              >
                <Text style={{ color: getStatusColor() }}>{getStatusText()}</Text>
              </View>
            </View>
            
            <Text className="text-zinc-300 mb-4">{course.description}</Text>
            
            {/* Informações do curso */}
            <View className="flex-row flex-wrap mb-4">
              <View className="flex-row items-center mr-6 mb-2">
                <Clock size={18} color={colors.zinc[400]} />
                <Text className="text-zinc-400 ml-2">{course.duration}</Text>
              </View>
              
              <View className="flex-row items-center mr-6 mb-2">
                <Award size={18} color={colors.zinc[400]} />
                <Text className="text-zinc-400 ml-2">{course.level}</Text>
              </View>
              
              <View className="flex-row items-center mb-2">
                <User size={18} color={colors.zinc[400]} />
                <Text className="text-zinc-400 ml-2">{course.instructor}</Text>
              </View>
            </View>
            
            {/* Datas do curso */}
            {(course.startDate || course.endDate) && (
              <View className="bg-bkblue-700 rounded-lg p-3 mb-4">
                <View className="flex-row items-center mb-1">
                  <Calendar size={18} color={colors.bkGolden[300]} />
                  <Text className="text-white ml-2 font-medium">Período do Curso</Text>
                </View>
                <View className="flex-row justify-between">
                  {course.startDate && (
                    <Text className="text-zinc-300">
                      Início: {new Date(course.startDate).toLocaleDateString('pt-BR')}
                    </Text>
                  )}
                  {course.endDate && (
                    <Text className="text-zinc-300">
                      Término: {new Date(course.endDate).toLocaleDateString('pt-BR')}
                    </Text>
                  )}
                </View>
              </View>
            )}
            
            {/* Botão de inscrição */}
            {course.enrollmentStatus === "available" && (
              <TouchableOpacity 
                className="bg-bkGolden-300 py-3 rounded-md items-center mb-6"
                onPress={handleEnroll}
                disabled={enrolling}
              >
                {enrolling ? (
                  <ActivityIndicator size="small" color={colors.bkblue[900]} />
                ) : (
                  <Text className="text-bkblue-900 font-bold text-lg">Inscrever-se</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
          
          {/* Pré-requisitos */}
          {course.prerequisites && course.prerequisites.length > 0 && (
            <View className="mb-6">
              <Text className="text-white text-lg font-medium mb-2">Pré-requisitos</Text>
              {course.prerequisites.map((prerequisite, index) => (
                <View key={index} className="flex-row items-center mb-1">
                  <View className="w-2 h-2 rounded-full bg-bkGolden-300 mr-2" />
                  <Text className="text-zinc-300">{prerequisite}</Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Objetivos */}
          {course.objectives && course.objectives.length > 0 && (
            <View className="mb-6">
              <Text className="text-white text-lg font-medium mb-2">Objetivos do Curso</Text>
              {course.objectives.map((objective, index) => (
                <View key={index} className="flex-row items-center mb-1">
                  <View className="w-2 h-2 rounded-full bg-bkGolden-300 mr-2" />
                  <Text className="text-zinc-300">{objective}</Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Módulos */}
          {course.modules && course.modules.length > 0 && (
            <View className="mb-6">
              <Text className="text-white text-lg font-medium mb-4">Conteúdo do Curso</Text>
              
              {course.modules.map((module, index) => (
                <View 
                  key={module.id} 
                  className="bg-bkblue-700 rounded-lg p-4 mb-3"
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center flex-1 mr-2">
                      {module.completed ? (
                        <CheckCircle size={20} color={colors.lime[300]} />
                      ) : (
                        <PlayCircle size={20} color={colors.zinc[400]} />
                      )}
                      <Text 
                        className="text-white font-medium ml-2"
                        style={{ color: module.completed ? colors.lime[300] : 'white' }}
                      >
                        {index + 1}. {module.title}
                      </Text>
                    </View>
                    <Text className="text-zinc-400">{module.duration}</Text>
                  </View>
                  
                  <Text className="text-zinc-300 ml-7">{module.description}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </PageLayout>
  );
} 