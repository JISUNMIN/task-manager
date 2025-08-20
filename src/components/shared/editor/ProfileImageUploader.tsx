import { ImageIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { IoPerson } from "react-icons/io5";

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
  alt = "프로필 이미지",
  className,
  name,
}: ProfileImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialImageUrl ?? null
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
    } else {
      setPreviewUrl(null);
    }
  };

  const onClickImage = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    setPreviewUrl(initialImageUrl ?? null);
  }, [initialImageUrl]);

  return (
    <>
      <div
        className={`relative w-32 h-32 rounded-full overflow-hidden border-2 cursor-pointer group border-gray-300 shadow-sm ${className}`}
        onClick={onClickImage}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={alt}
            className="w-full h-full object-cover rounded-full transition-transform duration-300 group-hover:scale-105"
            onError={() => setPreviewUrl(null)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-full">
            <IoPerson className="w-16 h-16 text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full">
          <ImageIcon className="w-7 h-7 text-white" />
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
