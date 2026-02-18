import { useEffect, useState } from 'react';
import { Image, ImageProps } from 'react-native';

type ReliableImageProps = Omit<ImageProps, 'source'> & {
  uri?: string;
  fallbackUri: string;
};

export function ReliableImage({ uri, fallbackUri, onError, ...rest }: ReliableImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [uri, fallbackUri]);

  const currentUri = !failed && uri ? uri : fallbackUri;

  return (
    <Image
      {...rest}
      source={{ uri: currentUri }}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
    />
  );
}
