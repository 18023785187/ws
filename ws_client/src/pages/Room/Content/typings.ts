
interface TextProps {
    target: boolean,
    name: string,
    imageUrl: string | null,
    data: string,
    date: number
}

interface EnterProps {
    name: string,
    date: number
}

export type {
    TextProps,
    EnterProps
}
