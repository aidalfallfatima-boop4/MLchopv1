import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { ChatMessage } from "../types";
import { getBotResponse, getQuickReplies } from "../services/chatbot";
import { useCartStore, getCartCount } from "../store/cartStore";
import { useOrderStore } from "../store/orderStore";
import { useProductStore } from "../store/productStore";

const TRACKABLE = new Set(["pending", "confirmed", "preparing", "shipping"]);
const TYPING_DELAY_MS = 700;

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MLChopChatbot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const cart = useCartStore();
  const orders = useOrderStore();
  const products = useProductStore();

  const context = useMemo(
    () => ({
      cartCount: getCartCount(cart),
      activeOrder: orders.find((order) => TRACKABLE.has(order.status)) ?? null,
      products,
    }),
    [cart, orders, products]
  );

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "bot",
      text: "Bonjour 👋 Je suis l'assistant ML CHOP. Comment puis-je vous aider ?",
      createdAt: new Date().toISOString(),
    },
  ]);

  function send(text: string) {
    const cleanMessage = text.trim();
    if (!cleanMessage) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: cleanMessage,
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, userMessage]);
    setMessage("");
    setTyping(true);

    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: `${Date.now()}-bot`,
        sender: "bot",
        text: getBotResponse(cleanMessage, context),
        createdAt: new Date().toISOString(),
      };
      setMessages((current) => [...current, botMessage]);
      setTyping(false);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    }, TYPING_DELAY_MS);

    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }

  if (!open) {
    return (
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setOpen(true)}
      >
        <Text style={styles.floatingIcon}>
          💬
        </Text>

        <View style={styles.onlineDot} />
      </TouchableOpacity>
    );
  }

  const quickReplies = getQuickReplies(context);

  return (
    <View style={styles.wrapper}>
      <KeyboardAvoidingView
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
        style={styles.chatContainer}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.botIcon}>
              <Text style={styles.botIconText}>
                🤖
              </Text>
            </View>

            <View>
              <Text style={styles.headerTitle}>
                Assistant ML CHOP
              </Text>

              <Text style={styles.onlineText}>
                {typing ? "● en train d'écrire..." : "● En ligne"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setOpen(false)}
          >
            <Text style={styles.close}>
              ×
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={{
            padding: 14,
          }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((item) => (
            <View
              key={item.id}
              style={[
                styles.messageRow,
                item.sender === "user" &&
                  styles.userRow,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  item.sender === "user"
                    ? styles.userBubble
                    : styles.botBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    item.sender === "user" &&
                      styles.userText,
                  ]}
                >
                  {item.text}
                </Text>
              </View>
              <Text
                style={[
                  styles.timestamp,
                  item.sender === "user" && styles.timestampUser,
                ]}
              >
                {timeLabel(item.createdAt)}
              </Text>
            </View>
          ))}

          {typing ? (
            <View style={styles.messageRow}>
              <View style={[styles.messageBubble, styles.botBubble, styles.typingBubble]}>
                <View style={styles.typingDot} />
                <View style={[styles.typingDot, styles.typingDotMid]} />
                <View style={styles.typingDot} />
              </View>
            </View>
          ) : null}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickReplies}
          contentContainerStyle={{ paddingHorizontal: 10 }}
        >
          {quickReplies.map((reply) => (
            <TouchableOpacity
              key={reply}
              style={styles.quickReplyChip}
              onPress={() => send(reply)}
            >
              <Text style={styles.quickReplyText}>{reply}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Écrivez votre message..."
            placeholderTextColor="#999"
            style={styles.input}
            onSubmitEditing={() => send(message)}
          />

          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => send(message)}
          >
            <Text style={styles.sendIcon}>
              ➤
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    right: 18,
    bottom: 88,
    width: 340,
    maxWidth: "90%",
    height: 540,
    zIndex: 999,
  },

  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 88,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#6D28D9",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    zIndex: 999,
  },

  floatingIcon: {
    fontSize: 28,
  },

  onlineDot: {
    position: "absolute",
    right: 3,
    top: 3,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#22A06B",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  chatContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEEEEE",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  header: {
    height: 72,
    backgroundColor: "#6D28D9",
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  botIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  botIconText: {
    fontSize: 18,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  onlineText: {
    marginTop: 3,
    color: "#EDE9FE",
    fontSize: 10,
  },

  close: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "300",
  },

  messages: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },

  messageRow: {
    width: "100%",
    marginBottom: 12,
    alignItems: "flex-start",
  },

  userRow: {
    alignItems: "flex-end",
  },

  messageBubble: {
    maxWidth: "82%",
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 15,
  },

  botBubble: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },

  userBubble: {
    backgroundColor: "#6D28D9",
  },

  messageText: {
    fontSize: 13,
    color: "#333333",
    lineHeight: 19,
  },

  userText: {
    color: "#FFFFFF",
  },

  timestamp: {
    marginTop: 3,
    fontSize: 9,
    color: "#B0B4BC",
  },

  timestampUser: {
    textAlign: "right",
  },

  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#C4C4C4",
  },

  typingDotMid: {
    opacity: 0.6,
  },

  quickReplies: {
    maxHeight: 44,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    backgroundColor: "#FFFFFF",
  },

  quickReplyChip: {
    alignSelf: "center",
    backgroundColor: "#F3E8FF",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
  },

  quickReplyText: {
    color: "#6D28D9",
    fontSize: 11,
    fontWeight: "800",
  },

  inputContainer: {
    minHeight: 62,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    flex: 1,
    height: 44,
    backgroundColor: "#F5F5F5",
    borderRadius: 13,
    paddingHorizontal: 13,
    fontSize: 13,
    color: "#222222",
  },

  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 13,
    marginLeft: 8,
    backgroundColor: "#6D28D9",
    justifyContent: "center",
    alignItems: "center",
  },

  sendIcon: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
});
