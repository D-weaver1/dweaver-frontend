export interface HighlightProps {
    value: string | null | undefined;
    search: string;
    className?: string;
    emptyValue?: string;
    emptyClassName?: string;
    words?: boolean;
}
