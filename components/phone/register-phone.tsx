"use client";

import React, { useEffect } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import RegisterForm, { RegistrationSuccessHandler } from "./register-form";
import VerifyForm, { SuccessfulVerificationHandler } from "./verify-form";
import { Alert, AlertTitle } from "../ui/alert";
import { AlertCircle } from "lucide-react";
import { User } from "@supabase/supabase-js";

enum VerifySteps {
  REGISTER,
  VERIFY,
  SUCCESS,
  ERROR,
}

export default function RegisterPhone() {
  const [step, setStep] = React.useState<VerifySteps>(VerifySteps.REGISTER);
  const [phoneNumber, setPhoneNumber] = React.useState<undefined | string>();
  const [user, setUser] = React.useState<null | User>(null);

  const supabase = createSupabaseBrowser();

  useEffect(() => {
    const checkUser = async () => {
      setUser((await supabase.auth.getUser()).data.user);
    };
    checkUser();
  }, [supabase.auth]);

  const handleRegisterSubmit: RegistrationSuccessHandler = ({
    phoneNumber,
  }) => {
    setPhoneNumber(phoneNumber);
    setStep(VerifySteps.VERIFY);
  };

  const handleVerifySubmit: SuccessfulVerificationHandler = () => {
    setStep(VerifySteps.SUCCESS);
  };

  const displayPrompt = user && !user.phone && step !== VerifySteps.SUCCESS;

  return (
    <>
      {displayPrompt && (
        <Alert className="ring-2 mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="mb-6">
            Register your phone number to vote via SMS
          </AlertTitle>
          {step === VerifySteps.REGISTER && (
            <RegisterForm onSuccessfulSubmit={handleRegisterSubmit} />
          )}
          {step === VerifySteps.VERIFY && (
            <VerifyForm
              phoneNumber={phoneNumber!}
              onVerificationSuccess={handleVerifySubmit}
            />
          )}
          {step === VerifySteps.ERROR && <span>Something went wrong</span>}
        </Alert>
      )}
    </>
  );
}
