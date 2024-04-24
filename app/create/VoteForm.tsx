"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useEffect, useRef, useState } from "react";
import { Input } from "../../components/ui/input";
import { CalendarIcon, TrashIcon } from "@radix-ui/react-icons";
import toast from "react-hot-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { cn, nextWeek } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "../../components/ui/calendar";
import { createVote } from "@/lib/actions/vote";
import { Textarea } from "../../components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { parsePhoneNumber } from "libphonenumber-js";

const FormSchema = z
  .object({
    vote_options: z
      .array(z.string())
      .refine((value) => value.length >= 2 && value.length <= 6, {
        message: "You have to select at least two items and max at six items.",
      }),
    title: z
      .string()
      .min(5, { message: "Title has a minimum characters of 5" }),
    description: z.string().optional(),
    end_date: z.date(),
    phone_number: z.string(),
  })
  .refine(
    (data) => {
      const vote_options = [...new Set([...data.vote_options])];
      return vote_options.length === data.vote_options.length;
    },
    { message: "Vote option need to be uniqe", path: ["vote_options"] }
  );

type FormattedNumber = {
  e164: string;
  displayNumber: string;
};

export default function VoteForm() {
  const supabase = createSupabaseBrowser();
  const optionRef = useRef() as React.MutableRefObject<HTMLInputElement>;

  const [options, setOptions] = useState<{ id: string; label: string }[]>([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const form = useForm<z.infer<typeof FormSchema>>({
    mode: "onSubmit",
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      vote_options: [],
      phone_number: "",
    },
  });

  const [availablePhoneNumbers, setAvailablePhoneNumbers] = useState<
    FormattedNumber[]
  >([]);
  useEffect(() => {
    const configuredPhoneNumbers = process.env.NEXT_PUBLIC_PHONE_NUMBERS
      ? process.env.NEXT_PUBLIC_PHONE_NUMBERS.split(",")
      : [];

    const getPhoneNumbers = async () => {
      // Get phone numbers used in all active polls
      const { error, data } = await supabase
        .from("vote")
        .select("phone_number")
        .filter("end_date", "gte", new Date().toISOString());

      if (error) {
        console.error(error);
        return;
      }
      const usedPhoneNumbers = data.map((number) => number.phone_number);
      const availableNumbers = configuredPhoneNumbers
        .filter((tel) => !usedPhoneNumbers.includes(tel))
        .map((tel) => {
          const parsedNumber = parsePhoneNumber(tel);
          return {
            e164: parsedNumber.format("E.164"),
            displayNumber: parsedNumber.formatInternational(),
          };
        });

      setAvailablePhoneNumbers(availableNumbers);
    };

    getPhoneNumbers();
  }, [supabase]);

  function addOptions() {
    const optionValue = optionRef.current.value.trim();

    if (optionValue) {
      if (!form.getValues("vote_options").includes(optionValue)) {
        form.setValue("vote_options", [
          ...options.map((option) => option.id),
          optionValue,
        ]);

        setOptions((options) => [
          ...options,
          {
            id: optionValue,
            label: optionValue,
          },
        ]);
        optionRef.current.value = "";
      } else {
        toast.error("You can not have the same option.");
      }
    }
  }

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const vote_options: { [key: string]: number } = {};
    data.vote_options.forEach((option) => {
      vote_options[option] = 0;
    });
    const insertData = { ...data, vote_options };
    toast.promise(createVote(insertData), {
      loading: "creating...",
      success: "Successfully create a vote",
      error: "Fail to create vote",
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="this vote for... " {...field} />
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
                  placeholder="(optional) your vote description..."
                  {...field}
                  className="resize-none"
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="vote_options"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Vote Options</FormLabel>
                <FormDescription>
                  You can not edit your vote option. Please double check 📌.
                </FormDescription>
              </div>

              {options.map((item) => {
                return (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name="vote_options"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item.id}
                          className="flex justify-between items-center py-3"
                        >
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, item.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal text-lg">
                              {item.label}
                            </FormLabel>
                          </div>
                          <TrashIcon
                            className="w-5 h-5 cursor-pointer hover:scale-115 transition-all"
                            onClick={() => {
                              setOptions((options) =>
                                options.filter(
                                  (option) => option.id !== item.id
                                )
                              );
                            }}
                          />
                        </FormItem>
                      );
                    }}
                  />
                );
              })}
              <Input
                type="text"
                ref={optionRef}
                placeholder="Press enter to add more options"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addOptions();
                  }
                }}
              />

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
              {availablePhoneNumbers.length == 0 ? (
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
                          {availablePhoneNumbers.length == 0 ? (
                            <span>No numbers available</span>
                          ) : (
                            <span>Not enabled</span>
                          )}
                        </DropdownMenuRadioItem>
                        {availablePhoneNumbers.map((number) => (
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
          disabled={!(options.length >= 2)}
        >
          Create
        </Button>
      </form>
    </Form>
  );
}
