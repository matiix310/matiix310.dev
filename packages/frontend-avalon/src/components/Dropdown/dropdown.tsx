import { FocusEventHandler, useRef, useState } from "react";

import styles from "./dropdown.module.css";

import TextInput from "../TextInput";

export type DropdownProps = {
  list: { id: string; name: string }[];
  placeholder?: string;
  autofocus?: boolean;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onSelected?: (value: DropdownProps["list"][0]) => {} | void;
};

const Dropdown = ({
  list,
  placeholder,
  autofocus,
  onBlur,
  onSelected,
}: DropdownProps) => {
  const [selected, setSelected] = useState(0);
  const [predictions, setPredictions] = useState<DropdownProps["list"]>(list);
  const textInputRef = useRef<HTMLInputElement>(null);

  return (
    <div style={{ position: "relative" }}>
      <TextInput
        placeholder={placeholder}
        onChange={(event: any) => {
          const search = event.target.value ?? "";
          const newPredictions = list.filter((element) =>
            element.name
              .toLowerCase()
              .replace(" ", "")
              .includes(search.toLowerCase().replace(" ", ""))
          );
          if (selected >= newPredictions.length)
            setSelected(Math.max(0, newPredictions.length - 1));
          setPredictions(newPredictions);
        }}
        autoFocus={autofocus}
        onBlur={onBlur}
        onKeyDown={(e) => {
          if (e.code == "ArrowDown" || e.code == "ArrowUp") {
            e.preventDefault();
            const delta = e.code == "ArrowUp" ? -1 : 1;
            const newSelected = selected + delta;

            if (newSelected < 0 || newSelected >= predictions.length) return;

            setSelected(newSelected);
          }

          if (e.code == "Enter" && onSelected) {
            e.preventDefault();
            if (predictions.length <= selected) return;
            textInputRef.current?.blur();
            onSelected(predictions[selected]);
          }
        }}
        textInputRef={textInputRef}
      />
      <div className={styles.propositions}>
        {predictions.map((e, i) => (
          <a
            key={e.id}
            className={styles.proposition + (selected == i ? " " + styles.selected : "")}
          >
            {e.name}
          </a>
        ))}
      </div>
    </div>
  );
};

export default Dropdown;
