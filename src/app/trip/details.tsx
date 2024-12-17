import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Modal } from "@/components/modal";
import { Participant, ParticipantProps } from "@/components/participant";
import { TripLink, TripLinkProps } from "@/components/tripLink";
import { linksServer } from "@/server/links-server";
import { participantsServer } from "@/server/participants-server";
import { tripStorage } from "@/storage/trip";
import { colors } from "@/styles/colors";
import { validateInput } from "@/utils/validateInput";
import { Plus } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, FlatList, Text, View } from "react-native";

export function Details({ tripId }: { tripId: string }) {
  const [showModal, setShowModal] = useState(false);

  // Loading
  const [isCreatingLink, setIsCreatingLink] = useState(false);

  // DATA

  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [links, setLinks] = useState<TripLinkProps[]>([]);

  const [participants, setParticipants] = useState<ParticipantProps[]>([]);
  async function handleResetCookies() {
    await tripStorage.remove();
  }

  function resetNewLink() {
    setLinkTitle("");
    setLinkUrl("");
    setShowModal(false);
  }

  async function handleCreateTripLink() {
    try {
      if (!validateInput.url(linkUrl)) {
        return Alert.alert("Link inválido", "Por favor, insira uma URL válida");
      }

      if (!linkTitle.trim()) {
        return Alert.alert(
          "Nome inválido",
          "Por favor, insira um nome para o link"
        );
      }

      setIsCreatingLink(true);

      await linksServer.create({
        tripId,
        title: linkTitle,
        url: linkUrl,
      });

      Alert.alert("Link", "Link cadastrado com sucesso!");
      await getTripLinks();
    } catch (error) {
      console.log(error);
    } finally {
      resetNewLink();
      setIsCreatingLink(false);
    }
  }

  async function getTripLinks() {
    try {
      const links = await linksServer.getLinksByTripId(tripId);
      setLinks(links);
    } catch (error) {
      console.log(error);
    }
  }

  async function getTripParticipants() {
    try {
      const participants = await participantsServer.getByTripId(tripId);
      setParticipants(participants);
      console.log(participants);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getTripLinks();
    getTripParticipants();
  }, []);

  return (
    <View className="flex-1 mt-10">
      <Text className="text-zinc-50 text-2xl font-semibold mb-2">
        Links importantes
      </Text>

      <View className="flex-1">
        {links.length > 0 ? (
          <FlatList
            data={links}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TripLink data={item} />}
          />
        ) : (
          <Text className="text-zinc-100 text-base">
            Nenhum link cadastrado para esta viagem
          </Text>
        )}
        <Button variant="secondary" onPress={() => setShowModal(true)}>
          <Plus color={colors.zinc[200]} size={20} />

          <Button.Title>Cadastrar novo link</Button.Title>
        </Button>
      </View>

      <View className="flex-1 border-t border-zinc-800 mt-6">
        <Text className="text-zinc-50 text-2xl font-semibold my-6">
          Convidados
        </Text>
        <FlatList
          data={participants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Participant data={item} />}
          contentContainerClassName="gap-4 pb-44"
        />
      </View>

      <Modal
        title="Cadastrar link"
        subtitle="Os convidados podem visualizar os links importantes"
        visible={showModal}
        onClose={() => setShowModal(false)}
      >
        <View className="gap-2 mb-3">
          <Input variant="secondary">
            <Input.Field
              placeholder="Título do link"
              value={linkTitle}
              onChangeText={(text) => setLinkTitle(text)}
            ></Input.Field>
          </Input>

          <Input variant="secondary">
            <Input.Field
              placeholder="URL"
              value={linkUrl}
              onChangeText={(text) => setLinkUrl(text)}
            ></Input.Field>
          </Input>
        </View>
        <Button isLoading={isCreatingLink} onPress={handleCreateTripLink}>
          <Button.Title>Salvar link</Button.Title>
        </Button>
      </Modal>

      {/* <Button onPress={handleResetCookies}>
        <Button.Title>Resetar Cookies</Button.Title>
      </Button> */}
    </View>
  );
}
