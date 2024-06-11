import { Button } from "@/components/ui/button";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cn, toDisplayedPhoneNumberFormat } from "@/lib/utils";

import { FormattedNumber } from "@/lib/hook";
import { Control } from "react-hook-form";

export type PhoneNumberDropdownProps = {
  name: string;
  control: Control<any>;
  phoneNumbers: FormattedNumber[] | undefined;
};

export default function PhoneNumberDropdown({
  control,
  phoneNumbers,
  name,
}: PhoneNumberDropdownProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col items-start">
          <FormLabel>Vote by Phone Number</FormLabel>
          {!field.value && (!phoneNumbers || phoneNumbers.length == 0) ? (
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
                    {field.value
                      ? toDisplayedPhoneNumberFormat(field.value)
                      : "Not enabled"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuRadioGroup onValueChange={field.onChange}>
                    <DropdownMenuRadioItem value="">
                      <span>Not enabled</span>
                    </DropdownMenuRadioItem>
                    {phoneNumbers &&
                      phoneNumbers.map((number) => (
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
  );
}
