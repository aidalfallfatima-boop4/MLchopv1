import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  FEEDBACK_MESSAGE_MAX,
  FEEDBACK_MESSAGE_MIN,
  FeedbackType,
  sendFeedback,
} from "../store/feedbackStore";

type Props = {
  /** Nom de la vue courante (ex : "client:cart"), joint au retour pour aider à reproduire. */
  screen: string;
  /** true quand une barre d'onglets est affichée en bas : le bouton se place au-dessus. */
  aboveTabs?: boolean;
};

const TYPE_OPTIONS: { key: FeedbackType; label: string; icon: string }[] = [
  { key: "bug", label: "Bug", icon: "🐞" },
  { key: "suggestion", label: "Suggestion", icon: "💡" },
  { key: "security", label: "Faille de sécurité", icon: "🔒" },
];

const TABS_OFFSET = 84;
const BASE_OFFSET = 20;

type SendState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export default function FeedbackButton({ screen, aboveTabs = false }: Props) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("bug");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<SendState>({ kind: "idle" });

  const isSending = state.kind === "sending";
  const trimmedLength = message.trim().length;

  function close() {
    if (isSending) return;
    setOpen(false);
    if (state.kind === "success") {
      setMessage("");
      setType("bug");
    }
    setState({ kind: "idle" });
  }

  async function submit() {
    if (trimmedLength < FEEDBACK_MESSAGE_MIN) {
      setState({
        kind: "error",
        message: `Décrivez le problème en au moins ${FEEDBACK_MESSAGE_MIN} caractères.`,
      });
      return;
    }
    setState({ kind: "sending" });
    try {
      await sendFeedback({ type, message, screen });
      setState({ kind: "success" });
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "Envoi impossible. Réessayez.",
      });
    }
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.fab, { bottom: aboveTabs ? TABS_OFFSET : BASE_OFFSET }]}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Signaler un problème"
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>🐞</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <KeyboardAvoidingView
          style={styles.backdrop}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.title}>Signaler un problème</Text>
              <TouchableOpacity
                onPress={close}
                disabled={isSending}
                accessibilityRole="button"
                accessibilityLabel="Fermer"
              >
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {state.kind === "success" ? (
              <View style={styles.successBox}>
                <Text style={styles.successIcon}>✅</Text>
                <Text style={styles.successText}>Merci ! Votre retour a bien été envoyé.</Text>
                <TouchableOpacity style={styles.primary} onPress={close} accessibilityRole="button">
                  <Text style={styles.primaryText}>Fermer</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.label}>Type</Text>
                <View style={styles.typeRow}>
                  {TYPE_OPTIONS.map((option) => {
                    const selected = option.key === type;
                    return (
                      <TouchableOpacity
                        key={option.key}
                        style={[styles.typeChip, selected && styles.typeChipSelected]}
                        onPress={() => setType(option.key)}
                        disabled={isSending}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                      >
                        <Text style={[styles.typeText, selected && styles.typeTextSelected]}>
                          {option.icon} {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {type === "security" ? (
                  <Text style={styles.securityHint}>
                    Ce retour n'est visible que par l'administrateur. Merci de ne pas publier la
                    faille ailleurs avant sa correction.
                  </Text>
                ) : null}

                <Text style={styles.label}>Description</Text>
                <TextInput
                  value={message}
                  onChangeText={(text) => {
                    setMessage(text);
                    if (state.kind === "error") setState({ kind: "idle" });
                  }}
                  placeholder="Qu'avez-vous fait, qu'attendiez-vous, que s'est-il passé ?"
                  multiline
                  maxLength={FEEDBACK_MESSAGE_MAX}
                  editable={!isSending}
                  style={styles.input}
                  textAlignVertical="top"
                  accessibilityLabel="Description du problème"
                />
                <Text style={styles.counter}>
                  {trimmedLength}/{FEEDBACK_MESSAGE_MAX} · écran : {screen}
                </Text>

                {state.kind === "error" ? (
                  <Text style={styles.errorText} accessibilityLiveRegion="polite">
                    {state.message}
                  </Text>
                ) : null}

                <TouchableOpacity
                  style={[styles.primary, isSending && { opacity: 0.6 }]}
                  onPress={submit}
                  disabled={isSending}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isSending, busy: isSending }}
                >
                  {isSending ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryText}>Envoyer</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 16,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    zIndex: 50,
  },
  fabIcon: { fontSize: 22 },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  sheet: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
  },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 18, fontWeight: "900", color: "#111827" },
  closeIcon: { fontSize: 18, color: "#6B7280", padding: 4 },
  label: { marginTop: 14, marginBottom: 6, fontWeight: "800", color: "#333333", fontSize: 13 },
  typeRow: { flexDirection: "row", flexWrap: "wrap" },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    marginRight: 8,
    marginBottom: 8,
  },
  typeChipSelected: { borderColor: "#F28C28", backgroundColor: "#FFF4E8" },
  typeText: { fontSize: 12, fontWeight: "700", color: "#4B5563" },
  typeTextSelected: { color: "#C2410C", fontWeight: "900" },
  securityHint: { fontSize: 11, color: "#92400E", backgroundColor: "#FEF3C7", padding: 8, borderRadius: 10 },
  input: {
    minHeight: 110,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    padding: 12,
    color: "#111827",
    fontSize: 13,
  },
  counter: { marginTop: 4, fontSize: 10, color: "#9CA3AF" },
  errorText: { marginTop: 10, fontSize: 12, fontWeight: "700", color: "#DC2626" },
  primary: {
    marginTop: 16,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#F28C28",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { color: "#FFFFFF", fontWeight: "900", fontSize: 14 },
  successBox: { alignItems: "center", paddingVertical: 14 },
  successIcon: { fontSize: 34 },
  successText: { marginTop: 8, fontSize: 14, fontWeight: "800", color: "#166534", textAlign: "center" },
});
