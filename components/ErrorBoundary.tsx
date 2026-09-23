import React, { Component, ErrorInfo, ReactNode } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = { children: ReactNode };
type State = { error: Error | null };

// Filet de sécurité : sans lui, un crash de rendu donne une page blanche.
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] Crash de rendu :", error, info.componentStack);
  }

  handleReload = () => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.location.reload();
      return;
    }
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>😕</Text>
        <Text style={styles.title}>Oups, un problème est survenu</Text>
        <Text style={styles.message}>{error.message || "Erreur inconnue."}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={this.handleReload}
          accessibilityRole="button"
          accessibilityLabel="Recharger l'application"
        >
          <Text style={styles.buttonText}>Recharger</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F7F8FA",
  },
  emoji: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 20, fontWeight: "900", color: "#222", textAlign: "center" },
  message: { marginTop: 10, color: "#6B7280", textAlign: "center" },
  button: {
    marginTop: 24,
    backgroundColor: "#F28C28",
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#FFF", fontWeight: "900" },
});
