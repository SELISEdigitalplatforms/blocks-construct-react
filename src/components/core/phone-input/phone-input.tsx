import { forwardRef, ComponentProps } from 'react';
import PhoneInput, { Country, Value } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import './phone-input.css';
import { cn } from '../../../lib/utils';

/**
 * UIPhoneInput Component
 *
 * A styled phone input component that provides international phone number formatting,
 * country selection, and validation, built as a wrapper around PhoneInput.
 *
 * Features:
 * - International phone number formatting
 * - Country code selection with dropdown
 * - Configurable default country
 * - Optional editable country calling code
 * - Consistent styling with other form elements
 * - Forward ref support for form library integration
 *
 * Props:
 * @param {(value?: Value) => void} onChange - Callback function when the phone number changes
 * @param {string} [placeholder] - Placeholder text for the input field
 * @param {Country} [defaultCountry] - Default country code to pre-select
 * @param {boolean} [countryCallingCodeEditable] - Whether the country calling code can be edited
 * @param {boolean} [international] - Whether to display the phone number in international format
 * @param {string} [className] - Additional CSS classes to apply to the component
 * @param {...PhoneInputProps} props - All other props from the underlying PhoneInput component
 *
 * @example
 * // Basic usage
 * <UIPhoneInput
 *   onChange={setPhoneNumber}
 *   placeholder="Enter phone number"
 * />
 *
 * // With default country and international format
 * <UIPhoneInput
 *   onChange={setPhoneNumber}
 *   defaultCountry="US"
 *   international={true}
 * />
 *
 * // With form control
 * const phoneInputRef = useRef(null);
 * <UIPhoneInput
 *   ref={phoneInputRef}
 *   onChange={handlePhoneChange}
 *   defaultCountry="CA"
 *   className="my-custom-class"
 * />
 */

type PhoneInputProps = ComponentProps<typeof PhoneInput>;

interface UIPhoneInputProps extends Omit<PhoneInputProps, 'value' | 'onChange'> {
  onChange(value?: Value): void;
  placeholder?: string;
  defaultCountry?: Country;
  countryCallingCodeEditable?: boolean;
  international?: boolean;
  className?: string;
}

const UIPhoneInput = forwardRef<any, UIPhoneInputProps>(
  (
    {
      onChange,
      placeholder,
      defaultCountry,
      className,
      countryCallingCodeEditable,
      international,
      ...props
    },
    ref
  ) => {
    return (
      <PhoneInput
        onChange={onChange}
        placeholder={placeholder}
        defaultCountry={defaultCountry}
        className={cn(
          'flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        countryCallingCodeEditable={countryCallingCodeEditable}
        international={international}
        ref={ref}
        {...props}
      />
    );
  }
);

UIPhoneInput.displayName = 'UIPhoneInput';

export { UIPhoneInput };
