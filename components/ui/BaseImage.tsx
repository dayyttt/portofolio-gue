import Image, { ImageProps } from 'next/image'

interface BaseImageProps extends Omit<ImageProps, 'alt'> {
  alt: string // required
}

export default function BaseImage({ alt, loading = 'lazy', ...props }: BaseImageProps) {
  return <Image alt={alt} loading={loading} {...props} />
}
