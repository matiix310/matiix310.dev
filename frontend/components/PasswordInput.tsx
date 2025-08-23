"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { FormControl } from "./ui/form";

export type PasswordInputProps = {
  inputProps?: React.ComponentProps<"input">;
  className?: string;
  asFormInput?: boolean;
};

export default function PasswordInput({
  inputProps,
  className,
  asFormInput = false,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={"relative flex items-center " + (className ?? "")}>
      {asFormInput ? (
        <FormControl>
          <Input
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
            type={visible ? "text" : "password"}
            {...inputProps}
          />
        </FormControl>
      ) : (
        <Input type={visible ? "text" : "password"} {...inputProps} />
      )}
      <Button
        className="absolute right-0"
        variant="ghost"
        tabIndex={-1}
        onClick={(e) => {
          e.preventDefault();
          setVisible((o) => !o);
        }}
      >
        {visible ? <EyeOff /> : <Eye />}
      </Button>
    </div>
  );
}
