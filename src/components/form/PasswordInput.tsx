import { useState } from "react";
import { FieldErrors, FieldValues, Path, UseFormRegister } from "react-hook-form";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

interface PasswordInputProps<TFieldValues extends FieldValues> {
  register: UseFormRegister<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  name: Path<TFieldValues>;
  placeholder?: string;
  defaultValue?: string;
  disabled?: boolean;
  autoComplete?: string;
}

export function PasswordInput<TFieldValues extends FieldValues>({
  register,
  errors,
  name,
  placeholder,
  defaultValue,
  disabled,
  autoComplete,
}: PasswordInputProps<TFieldValues>) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col gap-1 ">
      <label htmlFor={name} className="text-sm text-gray-600 dark:text-gray-300">
        {placeholder}
      </label>
      <div className="inputDivStyle">
        <FaLock className="text-brown-400 dark:text-yellow-400 mr-2" />
        <input
          {...register(name)}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          className="flex-1 border-none p-0 focus:outline-none focus:ring-0 bg-transparent"
          defaultValue={defaultValue}
          disabled={disabled}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none dark:text-gray-400 dark:hover:text-gray-200"
          aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      {errors[name] && (
        <p className="text-sm text-red-500 -mt-1">{errors[name]?.message as string}</p>
      )}
    </div>
  );
}
