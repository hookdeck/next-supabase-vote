"use client";

import React, { useEffect } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import RegisterForm, { RegistrationSubmitHandler } from "./register-form";
import VerifyForm, { VerificationSubmitHandler } from "./verify-form";
import { Alert, AlertTitle } from "../ui/alert";
import { AlertCircle } from "lucide-react";
import { User, VerifyMobileOtpParams } from "@supabase/supabase-js";
import toast from "react-hot-toast";

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

  const handleRegisterSubmit: RegistrationSubmitHandler = async ({
    phoneNumber,
  }) => {
    setPhoneNumber(phoneNumber);

    const { error } = await supabase.auth.updateUser({
      phone: phoneNumber,
    });

    if (error) {
      console.error(error);
      setStep(VerifySteps.ERROR);
    } else {
      setStep(VerifySteps.VERIFY);
    }
  };

  const handleVerifySubmit: VerificationSubmitHandler = ({
    phoneNumber,
    code,
  }) => {
    const otpParams: VerifyMobileOtpParams = {
      phone: phoneNumber!,
      token: code,
      type: "phone_change",
    };

    const verify = async () => {
      const { error } = await supabase.auth.verifyOtp(otpParams);

      if (error) {
        console.error(error);
        setStep(VerifySteps.ERROR);
      } else {
        setStep(VerifySteps.SUCCESS);
      }
    };

    toast.promise(verify(), {
      loading: "Verifying code...",
      success: "Successfully verified",
      error: "Fail to verify",
    });
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
            <RegisterForm onSubmit={handleRegisterSubmit} />
          )}
          {step === VerifySteps.VERIFY && (
            <VerifyForm
              phoneNumber={phoneNumber!}
              onSubmit={handleVerifySubmit}
            />
          )}
          {step === VerifySteps.ERROR && <span>Something went wrong</span>}
        </Alert>
      )}
    </>
  );
}
