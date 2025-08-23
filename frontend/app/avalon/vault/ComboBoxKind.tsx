import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

// TODO: fetch from api
const kinds = [
  {
    value: "username",
    label: "Username",
  },
  {
    value: "email",
    label: "Email",
  },
  {
    value: "password",
    label: "Password",
  },
];

// TODO: Add `value` and `onChange`
type CompoBoxProps = {
  defaultValue?: string;
  onChange?: (newValue: string) => unknown;
};

export default function ComboboxKind({
  defaultValue = "",
  onChange = () => {},
}: CompoBoxProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue ?? "");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? kinds.find((kind) => kind.value === value)?.label
            : "Select a vault entry kind..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search vault entry kind..." className="h-9" />
          <CommandList>
            <CommandEmpty>No vault entry kind found.</CommandEmpty>
            <CommandGroup>
              {kinds.map((kind) => (
                <CommandItem
                  key={kind.value}
                  value={kind.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue);
                    setOpen(false);
                    onChange(currentValue);
                  }}
                >
                  {kind.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === kind.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
