import React, { useState } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Header from "../../components/Header";
import { getRoleTheme } from "../../constants/roleTheme";
import {
  Feedback,
  FeedbackStatus,
  FeedbackType,
  setFeedbackStatus,
  useFeedbackList,
} from "../../store/feedbackStore";

type Props = { onBack: () => void };

const TYPE_BADGE: Record<FeedbackType, { label: string; color: string; background: string }> = {
  bug: { label: "🐞 Bug", color: "#B91C1C", background: "#FEE2E2" },
  suggestion: { label: "💡 Suggestion", color: "#1D4ED8", background: "#DBEAFE" },
  security: { label: "🔒 Sécurité", color: "#92400E", background: "#FEF3C7" },
};

const STATUS_LABEL: Record<FeedbackStatus, string> = {
  new: "Nouveau",
  seen: "Vu",
  fixed: "Corrigé",
};

const STATUS_COLOR: Record<FeedbackStatus, string> = {
  new: "#DC2626",
  seen: "#B45309",
  fixed: "#16A34A",
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

export default function AdminFeedback({ onBack }: Props) {
  const items = useFeedbackList();
  const [busyId, setBusyId] = useState<string | null>(null);
  const newCount = items.filter((item) => item.status === "new").length;

  async function changeStatus(item: Feedback, status: FeedbackStatus) {
    setBusyId(item.id);
    try {
      await setFeedbackStatus(item.id, status);
    } catch {
      Alert.alert("Mise à jour impossible", "Réessayez dans un instant.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Retours testeurs"
        subtitle={`${items.length} retour(s) · ${newCount} nouveau(x)`}
        onBack={onBack}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {items.length === 0 ? (
          <Text style={styles.empty}>Aucun retour pour l'instant.</Text>
        ) : null}

        {items.map((item) => {
          const badge = TYPE_BADGE[item.type] ?? TYPE_BADGE.bug;
          const roleTheme = getRoleTheme(item.role);
          const isBusy = busyId === item.id;
          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.row}>
                <Text style={[styles.badge, { color: badge.color, backgroundColor: badge.background }]}>
                  {badge.label}
                </Text>
                <Text style={[styles.status, { color: STATUS_COLOR[item.status] ?? "#64748B" }]}>
                  {STATUS_LABEL[item.status] ?? item.status}
                </Text>
              </View>

              <Text style={styles.meta}>
                {roleTheme.emoji} {roleTheme.label} · écran {item.screen} · {formatDate(item.createdAt)}
              </Text>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.userAgent} numberOfLines={2}>
                {item.userAgent}
              </Text>

              <View style={styles.actions}>
                {item.status !== "seen" && item.status !== "fixed" ? (
                  <TouchableOpacity
                    style={[styles.action, styles.actionSeen, isBusy && styles.disabled]}
                    onPress={() => changeStatus(item, "seen")}
                    disabled={isBusy}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.actionText, { color: "#B45309" }]}>👁 Marquer vu</Text>
                  </TouchableOpacity>
                ) : null}
                {item.status !== "fixed" ? (
                  <TouchableOpacity
                    style={[styles.action, styles.actionFixed, isBusy && styles.disabled]}
                    onPress={() => changeStatus(item, "fixed")}
                    disabled={isBusy}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.actionText, { color: "#16A34A" }]}>✅ Corrigé</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.action, isBusy && styles.disabled]}
                    onPress={() => changeStatus(item, "new")}
                    disabled={isBusy}
                    accessibilityRole="button"
                  >
                    <Text style={styles.actionText}>↺ Rouvrir</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },
  content: { padding: 20, paddingBottom: 40 },
  empty: { marginTop: 40, textAlign: "center", color: "#64748B", fontSize: 13 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  badge: {
    fontSize: 11,
    fontWeight: "900",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: "hidden",
  },
  status: { fontWeight: "900", fontSize: 11 },
  meta: { marginTop: 8, fontSize: 11, color: "#64748B", fontWeight: "700" },
  message: { marginTop: 8, fontSize: 13, color: "#0F172A", lineHeight: 19 },
  userAgent: { marginTop: 8, fontSize: 9, color: "#94A3B8" },
  actions: { marginTop: 10, flexDirection: "row", justifyContent: "flex-end" },
  action: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  actionSeen: { borderColor: "#FCD34D" },
  actionFixed: { borderColor: "#86EFAC" },
  actionText: { fontSize: 11, fontWeight: "900", color: "#334155" },
  disabled: { opacity: 0.5 },
});
