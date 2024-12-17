import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Loading } from "@/components/loading";
import { TripDetails, tripServer } from "@/server/trip-server";
import { colors } from "@/styles/colors";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import {
  CalendarRange,
  Info,
  MapIcon,
  MapPin,
  Settings2,
  Calendar as IconCalendar,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Keyboard, Text, TouchableOpacity, View } from "react-native";
import { set } from "zod";
import { TripActivities } from "./activities";
import { Details } from "./details";
import { Modal } from "@/components/modal";
import { Calendar } from "@/components/calendar";
import { DateData } from "react-native-calendars";
import { calendarUtils, DatesSelected } from "@/utils/calendarUtils";

export type TripData = TripDetails & {
  when: string;
};

enum MODAL {
  NONE = 0,
  CALENDAR = 1,
  UPDATE_TRIP = 2,
}

export default function Trip() {
  // Loading
  const [isLoadingTrip, setIsLoadingTrip] = useState(true);

  // Modal

  const [isModalVisible, setIsModalVisible] = useState(MODAL.NONE);

  // DATA
  const [trip, setTrip] = useState({} as TripData);
  const [option, setOption] = useState<"activity" | "details">("activity");
  const [destination, setDestination] = useState("");
  const tripId = useLocalSearchParams<{ id: string }>().id;
  const [selectedDates, setSelectedDates] = useState({} as DatesSelected);
  const [isUpdatingTrip, setIsUpdatingTrip] = useState(false);

  async function getTripDetails() {
    try {
      setIsLoadingTrip(true);
      if (!tripId) {
        return router.back();
      }
      const trip = await tripServer.getById(tripId);

      const maxLegthDestination = 10;
      const destination =
        trip.destination.length > maxLegthDestination
          ? trip.destination.slice(0, maxLegthDestination) + "..."
          : trip.destination;

      const start_at = dayjs(trip.starts_at).format("DD");
      const end_at = dayjs(trip.ends_at).format("DD");
      const month = dayjs(trip.starts_at).format("MMMM");

      setDestination(trip.destination);

      setTrip({
        ...trip,
        when: `${destination} de ${start_at} até ${end_at} de ${month}`,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingTrip(false);
    }
  }

  function handleSelectDate(selectedDay: DateData) {
    const dates = calendarUtils.orderStartsAtAndEndsAt({
      startsAt: selectedDates.startsAt,
      endsAt: selectedDates.endsAt,
      selectedDay,
    });

    setSelectedDates(dates);
  }

  async function handleUpdateTrip() {
    try {
      if (!tripId) {
        return router.back();
      }

      if (!destination || !selectedDates.startsAt || !selectedDates.endsAt) {
        return Alert.alert(
          "Atualizar viagem",
          "Lembre-se, além de preencher o destino, selecione data de início e fim de viagem."
        );
      }

      await tripServer.update({
        id: tripId,
        destination,
        starts_at: dayjs(selectedDates.startsAt.dateString).toString(),
        ends_at: dayjs(selectedDates.endsAt.dateString).toString(),
      });

      Alert.alert("Viagem atualizada", "Viagem atualizada com sucesso.", [
        {
          text: "Ok",
          onPress: () => {
            setIsModalVisible(MODAL.NONE);
            getTripDetails();
          },
        },
      ]);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getTripDetails();
  }, []);

  if (isLoadingTrip) {
    return <Loading />;
  }

  return (
    <View className="flex-1 px-5 pt-16">
      <Input variant="tertiary">
        <MapPin color={colors.zinc[400]} size={20} />
        <Input.Field value={trip.when} readOnly />

        <TouchableOpacity
          activeOpacity={0.6}
          className="w-9 h-9 bg-zinc-800 items-center justify-center rounded-xl"
          onPress={() => setIsModalVisible(MODAL.UPDATE_TRIP)}
        >
          <Settings2 color={colors.zinc[400]} size={20} />
        </TouchableOpacity>
      </Input>

      {option === "activity" ? (
        <TripActivities tripDetails={trip} />
      ) : (
        <Details tripId={trip.id} />
      )}

      <View className="w-full absolute -bottom-1 self-center justify-end pb-5 z-10 bg-zinc-950">
        <View className="w-full flex-row bg-zinc-900 p-4 rounded-lg border border-zinc-800 gap-2">
          <Button
            className="flex-1"
            variant={option === "activity" ? "primary" : "secondary"}
            onPress={() => setOption("activity")}
          >
            <CalendarRange
              color={
                option === "activity" ? colors.lime[950] : colors.lime[300]
              }
              size={20}
            />
            <Button.Title>Atividades</Button.Title>
          </Button>
          <Button
            className="flex-1"
            variant={option === "details" ? "primary" : "secondary"}
            onPress={() => setOption("details")}
          >
            <Info
              color={option === "details" ? colors.lime[950] : colors.lime[300]}
              size={20}
            />

            <Button.Title>Detalhes</Button.Title>
          </Button>
        </View>
      </View>

      <Modal
        title="Atualizar viagem"
        subtitle="Somente quem criou a viagem pode editar."
        visible={isModalVisible === MODAL.UPDATE_TRIP}
        onClose={() => setIsModalVisible(MODAL.NONE)}
      >
        <View className="gap-2 my-4">
          <Input variant="secondary">
            <MapIcon color={colors.zinc[400]} size={20} />
            <Input.Field
              placeholder="Para onde?"
              onChangeText={setDestination}
              value={destination}
            />
          </Input>

          <Input variant="secondary">
            <IconCalendar color={colors.zinc[400]} size={20} />
            <Input.Field
              placeholder="Quando?"
              value={selectedDates.formatDatesInText}
              onPressIn={() => setIsModalVisible(MODAL.CALENDAR)}
              onFocus={() => Keyboard.dismiss()}
            />
          </Input>
        </View>
        <Button onPress={handleUpdateTrip} isLoading={isUpdatingTrip}>
          <Button.Title>Atualizar</Button.Title>
        </Button>
      </Modal>

      <Modal
        title="Selecionar datas"
        subtitle="Selecione a data de ida e volta de viagem"
        visible={isModalVisible === MODAL.CALENDAR}
        onClose={() => setIsModalVisible(MODAL.NONE)}
      >
        <View className="gap-4 mt-4">
          <Calendar
            minDate={dayjs().toISOString()}
            onDayPress={handleSelectDate}
            markedDates={selectedDates.dates}
          />
          <Button onPress={() => setIsModalVisible(MODAL.UPDATE_TRIP)}>
            <Button.Title>Confirmar</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  );
}
