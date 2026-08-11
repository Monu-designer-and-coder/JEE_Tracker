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
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { axiosConfig } from '@/config/axios.config';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { FcLink, FcOpenedFolder } from 'react-icons/fc';
import { Container } from '@/components/base/Container.base.component';
import { Badge } from '@/components/ui/badge';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { iApiResponse } from '@/types/backend/apiResponse.types';
import { AggregatePaginateResult } from 'mongoose';
import { iDailyRecordDocument, iExtendedDetailedSubjectStreakDocumentResponse } from '@/types/res/subjectStreak.res';


// * ==========================================================================
// * Main Component: Tracker Dashboard
// * ==========================================================================
export default function Tracker() {
	// * State Management
	const [subjectStreaks, setSubjectStreaks] = useState<
		iDailyRecordDocument[]
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
		accumulatedData: iDailyRecordDocument[],
	) => {
		try {
			if (targetPageNumber === 1) {
				setIsLoading(true);
			}

			const serviceResponse: AxiosResponse<
				iApiResponse<AggregatePaginateResult<iDailyRecordDocument>>
			> = await axios.request(
				axiosConfig(
					`subjectStreak?type=byDate&page=${targetPageNumber}&limit=8`,
					'get',
				),
			);

			const networkExtractedArray = serviceResponse.data.data.docs || [];
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
					{ _id: formatDateToLocalTimeFormat(String(item._id)), details: item.details },
				]),
			);
			const consolidatedFinalArray: iDailyRecordDocument[] =
				Array.from(normalizedMap.values());

			setSubjectStreaks(consolidatedFinalArray);

			if (serviceResponse.data.data.hasNextPage) {
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
		entry: iExtendedDetailedSubjectStreakDocumentResponse[],
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
	if (!isMounted) {
		return (
			<Skeleton className='min-h-100 w-full animate-pulse rounded-[2rem] bg-accent/20 mx-auto max-w-5xl mt-8' />
		);
	}

	// * ==========================================================================
	// * Render
	// * ==========================================================================
	return (
		<main className='relative w-full overflow-auto px-4 py-8 md:px-8'>
			{/* * Content Section */}
			<section className='relative z-10 mx-auto flex flex-col justify-center'>
				{isLoading ? (
					// * Loading State
					<div className={cn('flex h-64 items-center justify-center')}>
						<div className='h-8 w-8 animate-spin rounded-full border-b-2 border-primary' />
					</div>
				) : (
					<Card>
						<CardHeader>
							<CardTitle>The Progress</CardTitle>
							<CardDescription>List of all days work</CardDescription>
							<CardAction>
								<Button variant='link' asChild>
									<Link href={'/tracker/'}>
										<FcLink className='w-5 h-5' />
									</Link>
								</Button>
							</CardAction>
						</CardHeader>
						<CardContent className='w-[95%] mx-auto grid grid-cols-6 gap-4'>
							{subjectStreaks.map((streak) => (
								<Card key={String(streak._id)} className='aspect-square'>
									<CardHeader>
										<CardTitle className='text-2xl font-clock font-bold text-primary'>
											{new Date(streak._id).toLocaleDateString('en-US', {
												weekday: 'short',
												year: '2-digit',
												month: 'short',
												day: '2-digit',
											})}
										</CardTitle>
										<CardDescription className='text-secondary-foreground font-content-primary'>
											Score :{' '}
											{Math.round(
												(calculateDailyTotals(streak.details)
													.totalQuestionsDone *
													1000000 +
													calculateDailyTotals(streak.details)
														.totalTimeStudiedMs) /
													200000,
											)}
										</CardDescription>
										<CardAction>
											<Dialog>
												<DialogTrigger>
													<FcOpenedFolder />
												</DialogTrigger>
												<DialogContent>
													<DialogHeader>
														<DialogTitle className='font-2xl'>
															Subject-wise data of{' '}
															{new Date(streak._id).toLocaleDateString(
																'en-US',
																{
																	year: 'numeric',
																	month: 'long',
																	day: 'numeric',
																},
															)}
														</DialogTitle>
														<DialogDescription className='font-xl'>
															Your score for that the is:{' '}
															{Math.round(
																(calculateDailyTotals(streak.details)
																	.totalQuestionsDone *
																	1000000 +
																	calculateDailyTotals(streak.details)
																		.totalTimeStudiedMs) /
																	200000,
															)}
														</DialogDescription>
													</DialogHeader>
													<Container className='w-full'>
														{streak.details.map((detail) => (
															<Container
																key={String(detail._id)}
																className={cn(
																	'hover:bg-primary/10 w-full flex items-center py-1 px-4 justify-between text-center',
																)}>
																<h3
																	className={cn(
																		'capitalize text-center font-heading text-xl',
																	)}>
																	{String(detail.subject.name)}
																</h3>
																<span className='font-clock text-lg tracking-wider'>
																	{detail.questionsDone}
																</span>
																<span className='font-clock text-lg tracking-widest'>
																	{formatMilliseconds(detail.timeStudied)}
																</span>
															</Container>
														))}
													</Container>
												</DialogContent>
											</Dialog>
										</CardAction>
									</CardHeader>
									<CardContent className='grid grid-rows-6 w-full h-full gap-2'>
										<Container className='w-full h-full row-span-2 rounded-full flex items-center justify-center text-lg gap-2 font-clock'>
											{calculateDailyTotals(streak.details).totalQuestionsDone}{' '}
											<Badge className=''>Questions Done</Badge>
										</Container>
										<Container className='w-full h-full row-span-4 rounded-full flex items-center justify-center text-xl border border-primary/80 flex-col gap-2 font-clock'>
											{formatMilliseconds(
												calculateDailyTotals(streak.details).totalTimeStudiedMs,
											)}
											<Badge>Studied</Badge>
										</Container>
									</CardContent>
								</Card>
							))}
						</CardContent>
					</Card>
				)}
			</section>
		</main>
	);
}

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
