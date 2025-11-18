
import React, { useState, useEffect } from 'react';

interface ImageWithBlurUpProps {
  src?: string;
  alt?: string;
  className?: string; // This will be applied to the container
  imgClassName?: string;
  onError?: React.ReactEventHandler<HTMLImageElement>;
  loading?: "lazy" | "eager";
}

const ImageWithBlurUp: React.FC<ImageWithBlurUpProps> = ({
  src,
  alt,
  className,
  imgClassName,
  onError,
  loading = 'lazy'
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        // Reset state when src changes
        setIsLoaded(false);
        setHasError(false);
    }, [src]);
    
    const handleLoad = () => {
        setIsLoaded(true);
    };
    
    const handleError: React.ReactEventHandler<HTMLImageElement> = (e) => {
        setHasError(true);
        if(onError) {
            onError(e);
        }
    };

    return (
        <div className={`relative overflow-hidden bg-gray-200 ${className}`}>
            <img
                src={src}
                alt={alt}
                onLoad={handleLoad}
                onError={handleError}
                className={`w-full h-full transition-all duration-700 ease-in-out ${imgClassName} ${
                    isLoaded && !hasError ? 'blur-0 scale-100' : 'blur-xl scale-110'
                }`}
                loading={loading}
            />
        </div>
    );
};

export default ImageWithBlurUp;
