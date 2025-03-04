import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Image,
  RefreshControl
} from "react-native";
import { PageLayout } from "@/components/PageLayout";
import { api } from "@/server/api";
import { colors } from "@/styles/colors";
import { useUser } from "@/contexts/UserContext";
import { Calendar, Clock, BookOpen, ChevronRight, Award } from "lucide-react-native";
import { router } from "expo-router";

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
}

export default function CoursesPage() {
  const { user } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      setError(null);
      const response = await api.get("/courses/getAllCourses");
      setCourses(response.data);
    } catch (err) {
      console.error("Erro ao buscar cursos:", err);
      setError("Não foi possível carregar os cursos. Tente novamente.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCourses();
  };

  const handleCoursePress = (courseId: string) => {
    router.push(`/mashguiach/courses/${courseId}`);
  };

  const renderCourseItem = ({ item }: { item: Course }) => {
    // Determinar a cor do status de inscrição
    const getStatusColor = () => {
      switch (item.enrollmentStatus) {
        case "enrolled":
          return colors.lime[300]; // Usando lime em vez de green
        case "completed":
          return colors.bkGolden[300];
        default:
          return colors.zinc[400];
      }
    };

    // Determinar o texto do status de inscrição
    const getStatusText = () => {
      switch (item.enrollmentStatus) {
        case "enrolled":
          return "Inscrito";
        case "completed":
          return "Concluído";
        default:
          return "Disponível";
      }
    };

    return (
      <TouchableOpacity 
        className="bg-bkblue-700 rounded-lg mb-4 overflow-hidden"
        onPress={() => handleCoursePress(item.id)}
      >
        {/* Imagem do curso */}
        <View className="w-full h-40 bg-bkblue-600">
          {item.imageUrl ? (
            <Image 
              source={{ uri: item.imageUrl }} 
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <BookOpen size={48} color={colors.bkblue[400]} />
            </View>
          )}
        </View>
        
        {/* Conteúdo do curso */}
        <View className="p-4">
          {/* Status do curso */}
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-white text-lg font-bold">{item.title}</Text>
            <View 
              className="px-2 py-1 rounded-full" 
              style={{ backgroundColor: getStatusColor() + '20' }}
            >
              <Text style={{ color: getStatusColor() }}>{getStatusText()}</Text>
            </View>
          </View>
          
          <Text className="text-zinc-400 mb-3" numberOfLines={2}>
            {item.description}
          </Text>
          
          {/* Informações adicionais */}
          <View className="flex-row flex-wrap">
            <View className="flex-row items-center mr-4 mb-2">
              <Clock size={16} color={colors.zinc[400]} />
              <Text className="text-zinc-400 ml-1">{item.duration}</Text>
            </View>
            
            <View className="flex-row items-center mr-4 mb-2">
              <Award size={16} color={colors.zinc[400]} />
              <Text className="text-zinc-400 ml-1">{item.level}</Text>
            </View>
          </View>
          
          {/* Instrutor */}
          <View className="mt-2 flex-row justify-between items-center">
            <Text className="text-zinc-300">Instrutor: {item.instructor}</Text>
            <ChevronRight size={20} color={colors.bkGolden[300]} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Dados de exemplo para quando não há cursos ou para testes
  const mockCourses: Course[] = [
    {
      id: "1",
      title: "Introdução à Kashrut",
      description: "Aprenda os fundamentos da Kashrut e como aplicá-los no dia a dia.",
      duration: "8 horas",
      imageUrl: "",
      instructor: "Rabino Cohen",
      level: "Iniciante",
      enrollmentStatus: "available"
    },
    {
      id: "2",
      title: "Supervisão de Cozinhas Industriais",
      description: "Técnicas avançadas para supervisão de cozinhas industriais seguindo as leis de Kashrut.",
      duration: "12 horas",
      imageUrl: "",
      instructor: "Rabino Levi",
      level: "Avançado",
      enrollmentStatus: "enrolled"
    },
    {
      id: "3",
      title: "Certificação Kosher Internacional",
      description: "Preparação para certificação internacional de supervisão Kosher.",
      duration: "20 horas",
      imageUrl: "",
      instructor: "Rabino Goldstein",
      level: "Especialista",
      enrollmentStatus: "completed"
    }
  ];

  if (loading && !refreshing) {
    return (
      <PageLayout title="Cursos">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.bkGolden[300]} />
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Cursos">
      <View className="flex-1 px-4">
        {error ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-white text-lg mb-4">{error}</Text>
            <TouchableOpacity 
              className="bg-bkGolden-300 px-4 py-2 rounded-md"
              onPress={fetchCourses}
            >
              <Text className="text-bkblue-900 font-medium">Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        ) : courses.length > 0 ? (
          <FlatList
            data={courses}
            keyExtractor={(item) => item.id}
            renderItem={renderCourseItem}
            contentContainerStyle={{ paddingVertical: 16 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.bkGolden[300]}
                colors={[colors.bkGolden[300]]}
              />
            }
          />
        ) : (
          // Exibir cursos de exemplo quando não há cursos da API
          <FlatList
            data={mockCourses}
            keyExtractor={(item) => item.id}
            renderItem={renderCourseItem}
            contentContainerStyle={{ paddingVertical: 16 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.bkGolden[300]}
                colors={[colors.bkGolden[300]]}
              />
            }
            ListHeaderComponent={
              <View className="mb-4 p-4 bg-bkblue-700 rounded-lg">
                <Text className="text-white text-sm">
                  Exibindo cursos de exemplo. Puxe para baixo para atualizar.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </PageLayout>
  );
} 