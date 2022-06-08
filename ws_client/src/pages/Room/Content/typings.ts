
interface TextProps {
  id: string,
  target: boolean,
  name: string,
  imageUrl: string | null,
  data: string,
  date: number
}

interface ImageProps {
  id: string,
  target: boolean,
  name: string,
  imageUrl: string | null,
  data: string,
  date: number
}

interface RecordProps {
  id: string,
  target: boolean,
  name: string,
  imageUrl: string | null,
  data: string,
  date: number
}

interface EnterProps {
  id: string,
  name: string,
  date: number
}

export type {
  TextProps,
  ImageProps,
  RecordProps,
  EnterProps,
}
