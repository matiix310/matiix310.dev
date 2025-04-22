import { forwardRef, useImperativeHandle, useState } from "react";
import styles from "./textInput.module.css";

export type TextInputProps = {
  style?: React.CSSProperties;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  defaultValue?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  textInputRef?: React.Ref<HTMLInputElement>;
};

const TextInput = forwardRef(
  (
    {
      style,
      onChange,
      defaultValue,
      placeholder,
      autoFocus,
      onBlur,
      onKeyDown,
      textInputRef,
    }: TextInputProps,
    ref
  ) => {
    const [value, setValue] = useState(defaultValue);

    useImperativeHandle(ref, () => ({
      setValue,
    }));

    return (
      <div className={styles.container} style={style}>
        <input
          className={styles.input}
          type="text"
          onChange={(e) => {
            if (onChange) onChange(e);
            setValue(e.target.value);
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          value={value}
          ref={textInputRef}
        />
      </div>
    );
  }
);

export default TextInput;
