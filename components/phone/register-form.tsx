"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { parsePhoneNumber, toStoredPhoneNumberFormat } from "@/lib/utils";

const RegisterFormSchema = z
  .object({
    phone_number: z.string(),
  })
  .transform((val, ctx) => {
    const { phone_number, ...rest } = val;
    try {
      const phoneNumber = parsePhoneNumber(phone_number);

      if (!phoneNumber?.isValid()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["phone_number"],
          message: `is not a phone number`,
        });
        return z.NEVER;
      }
    } catch (e) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone_number"],
        message: `could not be parsed as a phone number`,
      });
      return z.NEVER;
    }

    return { ...rest, phone_number: toStoredPhoneNumberFormat(phone_number) };
  });

export type RegistrationSubmitHandler = ({
  phoneNumber,
}: {
  phoneNumber: string;
}) => void;

export type RegisterFormProps = {
  onSubmit: RegistrationSubmitHandler;
};

export default function RegisterForm({ onSubmit }: RegisterFormProps) {
  const registerForm = useForm<z.infer<typeof RegisterFormSchema>>({
    mode: "onSubmit",
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      phone_number: "",
    },
  });

  async function onRegisterSubmit(data: z.infer<typeof RegisterFormSchema>) {
    onSubmit({ phoneNumber: data.phone_number });
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
