"use client";

import React from "react";
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

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const VerifyFormSchema = z.object({ code: z.string() });

export type VerificationSubmitHandler = ({
  phoneNumber,
  code,
}: {
  phoneNumber: string;
  code: string;
}) => void;

export type VerifyFormProps = {
  phoneNumber: string;
  onSubmit: VerificationSubmitHandler;
};

export default function VerifyForm({ phoneNumber, onSubmit }: VerifyFormProps) {
  const verifyForm = useForm<z.infer<typeof VerifyFormSchema>>({
    mode: "onSubmit",
    resolver: zodResolver(VerifyFormSchema),
    defaultValues: {
      code: "",
    },
  });

  async function onVerifySubmit(data: z.infer<typeof VerifyFormSchema>) {
    onSubmit({ phoneNumber, code: data.code });
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
