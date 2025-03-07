import { useEffect } from "react";
import { router, Redirect } from "expo-router";
import { View, Text, ActivityIndicator } from "react-native";

export default function AdminIndex() {
  return <Redirect href="/admin/(tabs)" />;
} 