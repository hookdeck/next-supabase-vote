"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { VerifyMobileOtpParams } from "@supabase/supabase-js";
import toast from "react-hot-toast";

const VerifyFormSchema = z.object({ code: z.string() });

export type SuccessfulVerificationHandler = ({
  phoneNumber,
}: {
  phoneNumber: string;
}) => void;
export type VerifyFormProps = {
  phoneNumber: string;
  onVerificationSuccess: SuccessfulVerificationHandler;
};

export default function VerifyForm({
  phoneNumber,
  onVerificationSuccess,
}: VerifyFormProps) {
  const [loading, setLoading] = React.useState(false);
  const supabase = createSupabaseBrowser();

  const verifyForm = useForm<z.infer<typeof VerifyFormSchema>>({
    mode: "onSubmit",
    resolver: zodResolver(VerifyFormSchema),
    defaultValues: {
      code: "",
    },
  });

  async function onVerifySubmit(data: z.infer<typeof VerifyFormSchema>) {
    setLoading(true);

    const otpParams: VerifyMobileOtpParams = {
      phone: phoneNumber,
      token: data.code,
      type: "phone_change",
    };

    const verify = async () => {
      const { error } = await supabase.auth.verifyOtp(otpParams);

      setLoading(false);

      if (error) {
        console.error(error);
        throw error;
      } else {
        onVerificationSuccess({ phoneNumber });
      }
    };

    toast.promise(verify(), {
      loading: "Verifying code...",
      success: "Successfully verified",
      error: "Fail to verify",
    });
  }

  return (
    <Form {...verifyForm}>
      <form
        onSubmit={verifyForm.handleSubmit(onVerifySubmit)}
        className="space-y-8"
        name="verify-form"
      >
        <FormField
          control={verifyForm.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Verification Code</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter the verification code you receive via SMS"
                  {...field}
                  disabled={loading}
                  autoComplete="off"
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={false}>
          Verify
        </Button>
      </form>
    </Form>
  );
}
