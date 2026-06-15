import { SyllabusAppSidebar } from '@/components/syllabus-app-sidebar';
import { cn } from '@/lib/utils';

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<main
				className={cn(
					'mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden rounded-4xl border border-neutral-200 bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-neutral-800',
					'h-full',
				)}>
				<SyllabusAppSidebar />
				{children}
			</main>
		</>
	);
}
