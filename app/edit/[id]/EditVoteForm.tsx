"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { CalendarIcon } from "@radix-ui/react-icons";
import toast from "react-hot-toast";

import {
  cn,
  nextWeek,
  toDisplayedPhoneNumberFormat,
  toStoredPhoneNumberFormat,
} from "@/lib/utils";
import { format } from "date-fns";

import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { IVote } from "@/lib/types";
import { updateVoteById } from "@/lib/actions/vote";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAvailablePhoneNumbers } from "@/lib/hook";
import { useState } from "react";

const FormSchema = z.object({
  title: z.string().min(5, { message: "Title has a minimum characters of 5" }),
  end_date: z.date(),
  description: z.string().optional(),
  phone_number: z.string(),
});

export default function EditVoteForm({ vote }: { vote: IVote }) {
  const form = useForm<z.infer<typeof FormSchema>>({
    mode: "onSubmit",
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: vote.title,
      end_date: new Date(vote.end_date),
      description: vote.description || "",
      phone_number: vote.phone_number || "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    toast.promise(updateVoteById(data, vote.id), {
      loading: "update...",
      success: "Successfully update",
      error: (err) => "Fail to update vote. " + err.toString(),
    });
  }

  const [phoneNumber, setPhoneNumber] = useState("");
  const { data: availablePhoneNumbers } = useAvailablePhoneNumbers();
  const doesNotContainVoteNumber =
    availablePhoneNumbers &&
    vote.phone_number &&
    availablePhoneNumbers.filter(
      (number) =>
        number.e164 === toStoredPhoneNumberFormat(vote.phone_number as string)
    ).length === 0;

  if (availablePhoneNumbers && vote.phone_number && doesNotContainVoteNumber) {
    availablePhoneNumbers.push({
      e164: toStoredPhoneNumberFormat(vote.phone_number),
      displayNumber: toDisplayedPhoneNumberFormat(vote.phone_number),
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Alert className="ring-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription className="text-gray-400">
            Your change may not take effect immediately on page vote/
            {vote.id} due to speed page revalidation.
          </AlertDescription>
        </Alert>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="vote for best of... "
                  {...field}
                  autoFocus
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="(optional) your vote description.."
                  {...field}
                  className="resize-none"
                />
              </FormControl>
              <FormDescription>This is be for SEO description</FormDescription>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="end_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>End date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date > nextWeek() || date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem className="flex flex-col items-start">
              <FormLabel>Vote by Phone Number</FormLabel>
              {availablePhoneNumbers && availablePhoneNumbers.length == 0 ? (
                <FormDescription>No numbers available</FormDescription>
              ) : (
                <FormControl>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal justify-start"
                        )}
                      >
                        {field.value || "Not enabled"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuRadioGroup
                        value={phoneNumber}
                        onValueChange={(value) => {
                          setPhoneNumber(value);
                          field.onChange(value);
                        }}
                      >
                        <DropdownMenuRadioItem value="">
                          {availablePhoneNumbers &&
                          availablePhoneNumbers.length == 0 ? (
                            <span>No numbers available</span>
                          ) : (
                            <span>Not enabled</span>
                          )}
                        </DropdownMenuRadioItem>
                        {availablePhoneNumbers &&
                          availablePhoneNumbers.map((number) => (
                            <DropdownMenuRadioItem
                              key={number.e164}
                              value={number.e164}
                            >
                              {number.displayNumber}
                            </DropdownMenuRadioItem>
                          ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </FormControl>
              )}

              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={!form.formState.isValid}
        >
          update
        </Button>
      </form>
    </Form>
  );
}
