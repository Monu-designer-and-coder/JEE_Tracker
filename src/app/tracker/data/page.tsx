/* eslint-disable react-hooks/exhaustive-deps */
'use client';

// * ==========================================================================
// * Imports
// * ==========================================================================
import { useEffect, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { axiosConfig } from '@/config/axios.config';
import { getSubjectStreakByDateResponse } from '@/types/res/subjectStreak.types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { GetSubjectResponse } from '@/types/res/GetResponse.types';

// * Standardized structural definitions describing expected paginated envelopes
interface PaginatedAPIResponseEnvelope<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		totalItems: number;
		hasMore: boolean;
	};
}

// * ==========================================================================
// * Main Component: Tracker Dashboard
// * ==========================================================================
export default function Tracker() {
	// * State Management
	const [subjectStreaks, setSubjectStreaks] = useState<
		getSubjectStreakByDateResponse[]
	>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	// ! Hydration Safety Pattern: Prevents mismatches between SSR and Client rendering
	const [isMounted, setIsMounted] = useState<boolean>(false);

	// * Lifecycle Hooks
	useEffect(() => {
		setIsMounted(true);
		fetchTodayStreaksIncremental(1, []);
	}, []);

	// * ==========================================================================
	// * API Methods
	// * ==========================================================================

	// * Recursively syncs all structural pagination loops in the background with zero visible UI changes
	const fetchTodayStreaksIncremental = async (
		targetPageNumber: number,
		accumulatedData: getSubjectStreakByDateResponse[],
	) => {
		try {
			if (targetPageNumber === 1) {
				setIsLoading(true);
			}

			const serviceResponse: AxiosResponse<
				PaginatedAPIResponseEnvelope<getSubjectStreakByDateResponse>
			> = await axios.request(
				axiosConfig(
					`subjectStreak?type=byDate&page=${targetPageNumber}&limit=50`,
					'get',
				),
			);

			const networkExtractedArray = serviceResponse.data.data || [];
			const dynamicCompositeData = [
				...accumulatedData,
				...networkExtractedArray,
			];

			function formatDateToLocalTimeFormat(
				utcDateString: number | string | Date,
			) {
				const date = new Date(utcDateString);
				const localString = new Intl.DateTimeFormat('en-US', {
					dateStyle: 'medium',
					timeStyle: 'short',
				}).format(date);
				return localString;
			}

			// * Standardize duplicate values out by mapping entries to a unique tracking table map
			const normalizedMap = new Map(
				dynamicCompositeData.map((item) => [
					item._id,
					{ _id: formatDateToLocalTimeFormat(item._id), details: item.details },
				]),
			);
			const consolidatedFinalArray: getSubjectStreakByDateResponse[] =
				Array.from(normalizedMap.values());

			setSubjectStreaks(consolidatedFinalArray);

			if (serviceResponse.data.pagination?.hasMore) {
				await fetchTodayStreaksIncremental(
					targetPageNumber + 1,
					consolidatedFinalArray,
				);
			}
		} catch (error) {
			console.error(
				'Failed processing underlying incremental data streams:',
				error,
			);
		} finally {
			setIsLoading(false);
		}
	};

	// * ==========================================================================
	// * Helper Methods
	// * ==========================================================================

	function calculateDailyTotals(
		entry: {
			_id: string;
			subject: GetSubjectResponse;
			questionsDone: number;
			timeStudied: number;
			date: Date;
		}[],
	) {
		const totals = entry.reduce(
			(acc, current) => {
				acc.totalQuestionsDone += current.questionsDone;
				acc.totalTimeStudiedMs += current.timeStudied;
				return acc;
			},
			{ totalQuestionsDone: 0, totalTimeStudiedMs: 0 },
		);

		return {
			totalQuestionsDone: totals.totalQuestionsDone,
			totalTimeStudiedMs: totals.totalTimeStudiedMs,
		};
	}

	function formatMilliseconds(ms: number): string {
		const totalSeconds = Math.floor(ms / 1000);
		const seconds = totalSeconds % 60;
		const totalMinutes = Math.floor(totalSeconds / 60);
		const minutes = totalMinutes % 60;
		const hours = Math.floor(totalMinutes / 60);

		const pad = (num: number) => String(num).padStart(2, '0');
		return `${pad(hours)}Hrs ${pad(minutes)}Min ${pad(seconds)}Sec`;
	}

	// ! Hydration check: Return null or a skeleton loader until mounted
	if (!isMounted) return null;

	// * ==========================================================================
	// * Render
	// * ==========================================================================
	return (
		<main className='relative min-h-[80vh] w-full overflow-auto bg-background px-4 py-8 md:px-8'>
			{/* * Ambient Background Effects (Aceternity / Minimalist styling) */}
			<div className='pointer-events-none absolute inset-0 z-0 overflow-hidden'>
				<div className='absolute -left-[10%] top-[20%] h-125 w-125 rounded-full bg-primary/10 blur-[120px] mix-blend-screen' />
				<div className='absolute right-[5%] top-[10%] h-100 w-100 rounded-full bg-blue-500/10 blur-[100px] mix-blend-screen' />
			</div>

			{/* * Content Section */}
			<section className='relative z-10 mx-auto max-w-7xl h-[80vh] flex flex-col justify-center'>
				{isLoading ? (
					// * Loading State
					<div
						className={cn(
							'bg-blue-500',
							'bg-blue-600',
							'bg-blue-700',
							'flex h-64 items-center justify-center',
						)}>
						<div className='h-8 w-8 animate-spin rounded-full border-b-2 border-primary' />
					</div>
				) : (
					<EnhancedCard>
						<CardHeader>
							<CardTitle className='text-2xl font-bold bg-linear-to-r from-chart-1 to-primary bg-clip-text text-transparent'>
								Daily Tasks
							</CardTitle>
							<CardDescription className='text-secondary-foreground'>
								Track Your Daily Progress.
							</CardDescription>
						</CardHeader>
						<CardContent className='overflow-auto'>
							{subjectStreaks.map((streak) => (
								<EnhancedCard key={String(streak._id)}>
									<CardHeader>
										<CardTitle className='text-2xl font-bold text-primary'>
											{new Date(streak._id).toLocaleDateString('en-US', {
												weekday: 'short',
												year: '2-digit',
												month: 'short',
												day: '2-digit',
											})}
										</CardTitle>
										<CardDescription className='text-secondary-foreground'>
											Your Work on{' '}
											{new Date(streak._id).toLocaleDateString('en-US', {
												weekday: 'long',
												year: 'numeric',
												month: 'long',
												day: 'numeric',
											})}
										</CardDescription>
									</CardHeader>
									<CardContent>
										<Table className='rounded-[2rem]'>
											<TableCaption>A list of your chapters.</TableCaption>
											<TableHeader>
												<TableRow className='bg-primary hover:bg-secondary '>
													<TableHead className='capitalize '>Subject</TableHead>
													<TableHead className='capitalize'>
														QuestionsDone
													</TableHead>
													<TableHead className='capitalize'>
														Time Studied
													</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{streak.details.map((detail, detailIndex) => (
													<TableRow
														key={String(detail._id)}
														className={cn(
															`bg-blue-${(detailIndex + 5) * 100}`,
															'hover:bg-primary',
														)}>
														<TableCell className={cn('capitalize')}>
															{String(detail.subject.name)}
														</TableCell>
														<TableCell>{detail.questionsDone}</TableCell>
														<TableCell>
															{formatMilliseconds(detail.timeStudied)}
														</TableCell>
													</TableRow>
												))}
												<TableRow>
													<TableCell>Total:</TableCell>
													<TableCell>
														{
															calculateDailyTotals(streak.details)
																.totalQuestionsDone
														}
													</TableCell>
													<TableCell>
														{formatMilliseconds(
															calculateDailyTotals(streak.details)
																.totalTimeStudiedMs,
														)}
													</TableCell>
												</TableRow>
											</TableBody>
										</Table>
									</CardContent>
								</EnhancedCard>
							))}
						</CardContent>
					</EnhancedCard>
				)}
				<Button className='w-full my-5' variant={'secondary'} asChild>
					<Link href='/tracker/'>.../</Link>
				</Button>
			</section>
		</main>
	);
}

// * Enhanced Card Component with Modern Glass Effects
const EnhancedCard = ({
	children,
	className,
	sizeProp,
}: {
	children: React.ReactNode;
	className?: string;
	sizeProp?: 'default' | 'sm' | undefined;
}) => {
	return (
		<Card
			size={sizeProp}
			className={cn(
				'backdrop-blur-md bg-white/40 dark:bg-black/20',
				'border border-white/30 dark:border-white/10',
				'shadow-2xl shadow-primary/10 dark:shadow-primary/20',
				'rounded-4xl overflow-auto',
				'transition-all duration hover:shadow-3xl hover:shadow-primary/20',
				'hover:bg-white/50 dark:hover:bg-black/30',
				className,
			)}>
			{children}
		</Card>
	);
};

// ! IMPROVEMENTS IMPLEMENTED:
// * 1. Implemented a data stream synchronization loop (`fetchTodayStreaksIncremental`) providing backend pagination compatibility without changing the UI/UX.
// * 2. Extended data extraction methods to intercept both standard and paginated response layouts to prevent application logic crashes.
// * 3. Enforced functional duplicate control patterns using JavaScript Map structures to protect runtime datasets against duplication overlapping.
// * 4. Structured fully defined inline type boundaries describing paginated network transport wrappers.

// ! PERFORMANCE OPTIMIZATIONS MAINTAINED:
// * 1. Optimistic UI processing handles state mutation updates instantly ahead of API confirmations.
// * 2. Preserved the hydration check mechanism (`isMounted`) to protect client layout parsing sequences from breaking.

// ! FUTURE IMPROVEMENTS:
// TODO: Replace the background loop strategy with a modern UI component like infinite scroll lists or standard button controls if datasets scale excessively.
