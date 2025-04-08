import React from "react";
import { Stack } from "expo-router";

export default function ReportsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="fixed-job" />
      <Stack.Screen name="user-services" />
    </Stack>
  );
} 