import React, { useState } from "react";

import { Role } from "../../types";
import RoleSelectScreen from "../RoleSelectScreen";
import LoginScreen from "./LoginScreen";
import RegisterScreen from "./RegisterScreen";
import OtpScreen from "./OtpScreen";

type Step = "role" | "login" | "register" | "otp";

/**
 * Choix du rôle → Connexion / Inscription → OTP → compte créé + connecté.
 * Une fois la session ouverte (authStore.login / verifyRegistrationOtp),
 * App.tsx détecte le rôle et bascule automatiquement vers la bonne interface.
 */
export default function AuthNavigator() {
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<Exclude<Role, null>>("client");

  if (step === "login") {
    return (
      <LoginScreen
        role={role}
        onBack={() => setStep("role")}
        onRegister={() => setStep("register")}
      />
    );
  }

  if (step === "register" && role !== "admin") {
    return (
      <RegisterScreen
        role={role}
        onBack={() => setStep("login")}
        onSubmitted={() => setStep("otp")}
      />
    );
  }

  if (step === "otp" && role !== "admin") {
    return <OtpScreen role={role} onBack={() => setStep("register")} />;
  }

  return (
    <RoleSelectScreen
      onSelectRole={(selected) => {
        setRole(selected);
        setStep("login");
      }}
    />
  );
}
