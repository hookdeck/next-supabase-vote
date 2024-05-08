"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import parsePhoneNumber from "libphonenumber-js";
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
import { toStoredPhoneNumberFormat } from "@/lib/utils";

const RegisterFormSchema = z
  .object({
    phone_number: z.string(),
  })
  .transform((val, ctx) => {
    const { phone_number, ...rest } = val;
    const phoneNumber = parsePhoneNumber(phone_number);

    if (!phoneNumber?.isValid()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone_number"],
        message: `is not a phone number`,
      });
      return z.NEVER;
    }

    return { ...rest, phone_number: toStoredPhoneNumberFormat(phone_number) };
  });

export type RegistrationSuccessHandler = ({
  phoneNumber,
}: {
  phoneNumber: string;
}) => void;
export type RegisterFormProps = {
  onSuccessfulSubmit: RegistrationSuccessHandler;
};

export default function RegisterForm({
  onSuccessfulSubmit,
}: RegisterFormProps) {
  const supabase = createSupabaseBrowser();

  const registerForm = useForm<z.infer<typeof RegisterFormSchema>>({
    mode: "onSubmit",
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      phone_number: "",
    },
  });

  async function onRegisterSubmit(data: z.infer<typeof RegisterFormSchema>) {
    const { data: result, error } = await supabase.auth.updateUser({
      phone: data.phone_number,
    });

    if (error) {
      console.error(error);
    } else {
      onSuccessfulSubmit({ phoneNumber: data.phone_number });
    }
  }

  return (
    <Form {...registerForm}>
      <form
        onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
        className="space-y-8"
        name="register-form"
      >
        <FormField
          control={registerForm.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter your phone number" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={false}>
          Register
        </Button>
      </form>
    </Form>
  );
}
