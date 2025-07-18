import { useState } from "react";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

interface PasswordInputProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
  name: string;
  placeholder?: string;
  defaultValue?: string;
}

export function PasswordInput({
  register,
  errors,
  name,
  placeholder,
  defaultValue,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={name}
        className="text-sm text-gray-600 dark:text-gray-300"
      >
        {placeholder}
      </label>
      <div
        className="flex items-center rounded-md px-3 py-2 text-sm border transition-colors duration-300
                      focus-within:border-2 focus-within:border-gray-700
                      dark:bg-gray-800 dark:border-gray-600 dark:focus-within:border-blue-500"
      >
        <FaLock className="text-brown-400 dark:text-yellow-400 mr-2" />
        <input
          {...register(name)}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          className="flex-1 border-none p-0 focus:outline-none focus:ring-0 bg-transparent
                     text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          defaultValue={defaultValue}
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
        <p className="text-sm text-red-500 -mt-1">
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  );
}
