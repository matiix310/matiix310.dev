import { useState } from "react";
import { Client } from "./columns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

type ClientsSelectorProps = {
  availableClients: Client[];
  defaultClients?: string[];
  onChange?: (newValue: Client["id"][]) => unknown;
};

export default function ClientsSelector({
  availableClients,
  defaultClients,
  onChange = () => {},
}: ClientsSelectorProps) {
  const [selectedClients, setSelectedClients] = useState(defaultClients ?? []);
  const [open, setOpen] = useState(false);

  return (
    <div className="flex gap-2">
      {selectedClients.map((clientId) => (
        <p
          key={clientId}
          className="bg-input/30 hover:cursor-pointer hover:bg-destructive w-fit rounded-md border px-2 py-1 text-sm"
          onClick={() => setSelectedClients((old) => old.filter((c) => c !== clientId))}
        >
          {availableClients.find(({ id }) => id === clientId)?.name ?? "unknown"}
        </p>
      ))}
      {selectedClients.length < availableClients.length && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="bg-input/30 flex items-center justify-center hover:cursor-pointer rounded-md border aspect-square p-1 hover:bg-accent hover:text-accent-foreground">
              <Plus className="h-4 w-4" />
            </div>
          </PopoverTrigger>
          <PopoverContent className="p-0" side="right" align="start">
            <Command>
              <CommandInput placeholder="Search a client to add..." />
              <CommandList>
                <CommandEmpty>No clients found.</CommandEmpty>
                <CommandGroup>
                  {availableClients
                    .filter((c) => !selectedClients.includes(c.id))
                    .map((client) => (
                      <CommandItem
                        key={client.id}
                        value={client.name}
                        onSelect={() => {
                          onChange([...selectedClients, client.id]);
                          setSelectedClients((old) => [...old, client.id]);
                          setOpen(false);
                        }}
                      >
                        {client.name}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
