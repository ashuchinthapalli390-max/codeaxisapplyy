"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import { Terminal } from "lucide-react";

interface ImageWithFallbackProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
  containerClassName?: string;
}

const DEFAULT_BRANDED_FALLBACK = "/assets/cards/modules/module-01-foundations-vibe-coding.png";

export default function ImageWithFallback({
  src,
  alt,
  fallbackSrc = DEFAULT_BRANDED_FALLBACK,
  className,
  containerClassName = "",
  ...rest
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);

  const handleError = () => {
    if (!error) {
      setError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      <Image
        {...rest}
        src={error ? fallbackSrc : (src || fallbackSrc)}
        alt={alt || "CodeXa Media Asset"}
        className={`${className || ""} object-cover transition-opacity duration-300`}
        onError={handleError}
      />
    </div>
  );
}
