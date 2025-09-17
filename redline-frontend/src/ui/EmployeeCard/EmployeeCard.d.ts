import type { ImgHTMLAttributes } from 'react';
export interface EmployeeCardProps {
    avatarUrl: string;
    name: string;
    position: string;
    className?: string;
    imgProps?: Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>;
}
export declare const EmployeeCard: ({ avatarUrl, name, position, className, imgProps, }: EmployeeCardProps) => import("react/jsx-runtime").JSX.Element;


