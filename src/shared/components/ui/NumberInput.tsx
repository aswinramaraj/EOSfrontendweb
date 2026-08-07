import { forwardRef, type InputHTMLAttributes } from "react";
import { TextInput } from "./TextInput";

type NumberInputProps = InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean };

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ step = "any", inputMode = "decimal", ...rest }, ref) => (
    <TextInput ref={ref} type="number" step={step} inputMode={inputMode} {...rest} />
  ),
);

NumberInput.displayName = "NumberInput";
