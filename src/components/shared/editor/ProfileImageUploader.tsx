import { ImageIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";

type ProfileImageUploaderProps = {
  initialImageUrl?: string;
  onFileChange: (file: File | null) => void;
  alt?: string;
  className?: string;
  name: string;
};

export function ProfileImageUploader({
  initialImageUrl,
  onFileChange,
  alt = "이미지",
  className,
  name,
}: ProfileImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState(
    initialImageUrl || "/default-profile.png"
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    setValue,
    formState: { errors },
  } = useFormContext();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    setValue(name, file);

    if (onFileChange) {
      onFileChange(file);
    }

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onClickImage = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    setPreviewUrl(initialImageUrl || "/default-profile.png");
  }, [initialImageUrl]);

  return (
    <>
      <div
        className={`relative w-32 h-32 rounded-full overflow-hidden border-4 cursor-pointer group border-[var(--primary)] ${className}`}
        onClick={onClickImage}
      >
        <img
          src={previewUrl}
          alt={alt}
          className="w-full h-full object-cover rounded-full"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ImageIcon className="w-8 h-8 text-white" />
        </div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={onChange}
        />
      </div>
      {errors[name] && (
        <p className="text-sm text-red-500 -mt-1">
          {errors[name]?.message as string}
        </p>
      )}
    </>
  );
}
