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

import { cn } from "@/lib/utils";

import { FormattedNumber } from "@/lib/hook";

export type PhoneNumberDropdownProps = {
  control: any;
  selectedPhoneNumber: string;
  phoneNumbers: FormattedNumber[] | undefined;
  phoneNumberChanged: (value: string) => void;
};

export default function PhoneNumberDropdown({
  control,
  selectedPhoneNumber,
  phoneNumbers,
  phoneNumberChanged,
}: PhoneNumberDropdownProps) {
  return (
    <FormField
      control={control}
      name="phone_number"
      render={({ field }) => (
        <FormItem className="flex flex-col items-start">
          <FormLabel>Vote by Phone Number</FormLabel>
          {phoneNumbers && phoneNumbers.length == 0 ? (
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
                    value={selectedPhoneNumber}
                    onValueChange={(value) => {
                      phoneNumberChanged(value);
                      field.onChange(value);
                    }}
                  >
                    <DropdownMenuRadioItem value="">
                      {phoneNumbers && phoneNumbers.length == 0 ? (
                        <span>No numbers available</span>
                      ) : (
                        <span>Not enabled</span>
                      )}
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
