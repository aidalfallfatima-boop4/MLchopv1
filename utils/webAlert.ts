import { Alert, AlertButton, Platform } from "react-native";

// Sur react-native-web, Alert.alert ne fait RIEN : erreurs invisibles et
// callbacks de boutons jamais appelés. On le remplace (web uniquement) par
// window.alert / window.confirm pour corriger tous les appels d'un coup.

function buildText(title: string, message?: string): string {
  return message ? `${title}\n\n${message}` : title;
}

function runButton(button: AlertButton | undefined) {
  try {
    button?.onPress?.();
  } catch (error) {
    console.error("[webAlert] Erreur dans le callback du bouton :", error);
  }
}

function webAlert(title: string, message?: string, buttons?: AlertButton[]) {
  if (typeof window === "undefined") return;

  const list = buttons ?? [];
  const text = buildText(title, message);

  // 0 ou 1 bouton : simple information, puis on déclenche le bouton éventuel.
  if (list.length <= 1) {
    window.alert(text);
    runButton(list[0]);
    return;
  }

  // 2+ boutons : confirmation. OK = dernier bouton non "cancel", Annuler = bouton "cancel".
  const cancelButton = list.find((button) => button.style === "cancel");
  const confirmCandidates = list.filter((button) => button.style !== "cancel");
  const confirmButton = confirmCandidates[confirmCandidates.length - 1];

  const hint =
    confirmButton?.text || cancelButton?.text
      ? `\n\n[OK] ${confirmButton?.text ?? "OK"}   ·   [Annuler] ${cancelButton?.text ?? "Annuler"}`
      : "";

  if (window.confirm(`${text}${hint}`)) {
    runButton(confirmButton);
  } else {
    runButton(cancelButton);
  }
}

let installed = false;

export function installWebAlert() {
  if (Platform.OS !== "web" || installed) return;
  installed = true;
  Alert.alert = webAlert as typeof Alert.alert;
}
