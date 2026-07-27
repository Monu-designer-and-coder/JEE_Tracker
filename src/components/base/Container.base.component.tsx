import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

export const Container = ({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) => {
	return <div className={cn('', className)}>{children}</div>;
};
