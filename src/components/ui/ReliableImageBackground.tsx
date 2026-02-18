import { ReactNode, useEffect, useState } from 'react';
import { ImageBackground, ImageBackgroundProps } from 'react-native';

type ReliableImageBackgroundProps = Omit<ImageBackgroundProps, 'source'> & {
  uri?: string;
  fallbackUri: string;
  children?: ReactNode;
};

export function ReliableImageBackground({
  uri,
  fallbackUri,
  children,
  onError,
  ...rest
}: ReliableImageBackgroundProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [uri, fallbackUri]);

  const currentUri = !failed && uri ? uri : fallbackUri;

  return (
    <ImageBackground
      {...rest}
      source={{ uri: currentUri }}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
    >
      {children}
    </ImageBackground>
  );
}
