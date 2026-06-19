/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { Badge } from '@/components/ui/badge';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { STORAGE_KEYS } from '@/config/constants';
import { cn } from '@/lib/utils';
import { finalResultData } from '@/types/res/syllabusDataResponse.types';
import axios, { AxiosResponse } from 'axios';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CardContent } from '@/components/ui/card';
import { Clock, Group } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function SyllabusHomePage() {
	// ! HYDRATION & STATE MANAGEMENT
	// * Use a single 'mounted' state to prevent React hydration mismatch errors on time-based UI
	const [isMounted, setIsMounted] = useState(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const [currentStudySession, setCurrentStudySession] = useState({
		isStudySessionActive: false,
		subjectDetails: {
			_id: '',
			subjectName: 'No Study Session',
		},
		sessionStartTime: 0,
	});

	const [syllabusData, setSyllabusData] = useState<finalResultData[]>([]);
	const [syllabusProgress, setSyllabusProgress] = useState<number>(0);
	const [theoryProgress, setTheoryProgress] = useState<number>(0);

	// ! SIDE EFFECTS
	useEffect(() => {
		setIsMounted(true);
		setIsLoading(false);

		axios.get('/api/syllabus').then((res: AxiosResponse<finalResultData[]>) => {
			setSyllabusData(res.data);

			const ChapterDetails = res.data.map((subject) => ({
				totalChapters: subject.totalChapters,
				completedChapters: subject.completedChapters,
				totalCompletedTheory: subject.completedTheory,
			}));

			const syllabusProgressCalculation = ChapterDetails.reduce(
				(accumulator, currentValue) => {
					return {
						totalChapters:
							accumulator.totalChapters + currentValue.totalChapters,
						completedChapters:
							accumulator.completedChapters + currentValue.completedChapters,
						totalCompletedTheory:
							accumulator.totalCompletedTheory +
							currentValue.totalCompletedTheory,
					};
				},
			);
			setSyllabusProgress(
				Math.round(
					(syllabusProgressCalculation.completedChapters * 100) /
						syllabusProgressCalculation.totalChapters,
				),
			);
			setTheoryProgress(
				Math.round(
					(syllabusProgressCalculation.totalCompletedTheory * 100) /
						syllabusProgressCalculation.totalChapters,
				),
			);
			console.log(res.data);
		});

		const initialStateOfStudySession = {
			isStudySessionActive: false,
			subjectDetails: {
				_id: '',
				subjectName: 'No Study Session',
			},
			sessionStartTime: 0,
		};
		const StudySessionLocalStorage = JSON.parse(
			localStorage.getItem(STORAGE_KEYS.STUDY_SESSION) ||
				JSON.stringify(initialStateOfStudySession),
		);

		setCurrentStudySession(StudySessionLocalStorage);
	}, []);

	//! Helper Functions

	/**
	 * Generate progress badge color based on completion percentage
	 * @param percentage - Completion percentage (0-100)
	 * @returns Tailwind CSS color classes
	 */
	const getProgressBadgeColor = (percentage: number): string => {
		if (percentage >= 90)
			return 'bg-emerald-500 text-emerald-700 dark:text-emerald-300 border-emerald-500';
		if (percentage >= 70)
			return 'bg-blue-500 text-blue-700 dark:text-blue-300 border-blue-500';
		if (percentage >= 40)
			return 'bg-amber-500 text-amber-700 dark:text-amber-300 border-amber-500';
		return 'bg-red-600 text-red-100 border-red-500';
	};

	// ! HYDRATION FALLBACK
	// * Render a skeleton or empty wrapper before client hydration to ensure exact HTML matching
	if (!isMounted) {
		return (
			<div className='min-h-100 w-full animate-pulse rounded-[2rem] bg-accent/20 mx-auto max-w-5xl mt-8' />
		);
	}

	return (
		<main className='relative min-h-[80vh] w-full overflow-hidden bg-background px-4 py-8 md:px-8'>
			{/* * Ambient Background Effects (Aceternity / Minimalist styling) */}
			<div className='fixed inset-0 -z-10 overflow-hidden'>
				{/* Primary gradient background */}
				<div className='absolute inset-0 bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20' />

				{/* Animated linear orbs for visual depth */}
				<div className='absolute -top-40 -right-40 w-80 h-80 bg-linear-to-br from-blue-400/30 via-indigo-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse' />
				<div className='absolute -bottom-40 -left-40 w-96 h-96 bg-linear-to-tr from-purple-400/20 via-indigo-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000' />
				<div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-linear-to-r from-indigo-400/15 to-purple-400/15 rounded-full blur-2xl animate-pulse delay-2000' />

				{/* Additional ambient orbs */}
				<div
					className='absolute top-20 left-1/4 w-48 h-48 bg-linear-to-r from-emerald-400/10 to-teal-400/10 rounded-full blur-2xl animate-bounce'
					style={{ animationDuration: '3s' }}
				/>
				<div className='absolute bottom-32 right-1/4 w-56 h-56 bg-linear-to-r from-pink-400/10 to-rose-400/10 rounded-full blur-2xl animate-pulse delay-3000' />
			</div>

			{/* * Content Section */}
			<section className='relative z-10 mx-auto max-w-7xl h-[80vh] flex flex-col justify-center'>
				{isLoading ? (
					// * Loading State
					<div className='flex h-64 items-center justify-center'>
						<div className='h-8 w-8 animate-spin rounded-full border-b-2 border-primary' />
					</div>
				) : (
					<section className='overflow-auto w-full h-full'>
						<header className='flex justify-between px-4 py-2 w-full'>
							<Breadcrumb className='w-full'>
								<BreadcrumbList>
									<BreadcrumbItem>
										<BreadcrumbLink asChild>
											<Link href={'/'}>Home</Link>
										</BreadcrumbLink>
									</BreadcrumbItem>
									<BreadcrumbSeparator />
									<BreadcrumbItem>
										<BreadcrumbPage>Syllabus</BreadcrumbPage>
									</BreadcrumbItem>
								</BreadcrumbList>
							</Breadcrumb>
							<Badge
								variant={
									currentStudySession.isStudySessionActive
										? 'default'
										: 'destructive'
								}
								className={`text-lg px-7 py-4 my-5 mx-2 font-mono`}>
								Current Study Session:
								{''}
								{currentStudySession.subjectDetails.subjectName}{' '}
							</Badge>
						</header>
						<EnhancedCard className='overflow-auto'>
							<CardHeader>
								<CardTitle>Syllabus Progress</CardTitle>
								<CardDescription>Track the syllabus Progress.</CardDescription>
							</CardHeader>
							<CardContent className='overflow-auto'>
								<div className='flex flex-col gap-2 py-5'>
									<div className='mb-6 flex items-center justify-between'>
										<h2 className='flex items-center gap-2 text-xl font-semibold'>
											<Clock className='h-5 w-5' />
											OverAll Chapters Completed
										</h2>
										<Badge className={getProgressBadgeColor(syllabusProgress)}>
											{syllabusProgress}% elapsed
										</Badge>
									</div>

									{/* * Overall Progress Bar */}
									<div className='mt-6 space-y-2'>
										<div className='flex justify-between text-sm'>
											<span>Overall Progress</span>
											<span>{syllabusProgress}%</span>
										</div>
										<Progress
											value={syllabusProgress}
											className='h-3 bg-white/20'
										/>
									</div>
								</div>
								<div className='flex flex-col gap-2 py-5'>
									<div className='mb-6 flex items-center justify-between'>
										<h2 className='flex items-center gap-2 text-xl font-semibold'>
											<Clock className='h-5 w-5' />
											OverAll Theory Completed
										</h2>
										<Badge className={getProgressBadgeColor(theoryProgress)}>
											{theoryProgress}% elapsed
										</Badge>
									</div>

									{/* * Overall Progress Bar */}
									<div className='mt-6 space-y-2'>
										<div className='flex justify-between text-sm'>
											<span>Overall Progress</span>
											<span>{theoryProgress}%</span>
										</div>
										<Progress
											value={theoryProgress}
											className='h-3 bg-white/20'
										/>
									</div>
								</div>
								<div>
									<div className='mb-6 flex items-center justify-between'>
										<h2 className='flex items-center gap-2 text-xl font-semibold'>
											<Group className='h-5 w-5' />
											Subject-Wise
										</h2>
									</div>
									<div className='grid grid-cols-3 gap-2 overflow-auto'>
										{syllabusData.map((subject) => (
											<EnhancedCard key={subject._id}>
												<CardHeader>
													<CardTitle className='capitalize'>
														{subject.name}
													</CardTitle>
												</CardHeader>
												<CardContent className='overflow-y-auto overflow-x-hidden'>
													<div className='flex flex-col gap-2 py-5'>
														<div className='mb-6 flex items-center justify-between'>
															<h2 className='flex items-center gap-2 text-xl font-semibold'>
																<Clock className='h-5 w-5' />
																Chapters Completed
															</h2>
															<Badge
																className={getProgressBadgeColor(
																	Math.round(subject.percentChaptersCompleted),
																)}>
																{Math.round(subject.percentChaptersCompleted)}% elapsed
															</Badge>
														</div>

														{/* * Overall Progress Bar */}
														<div className='mt-6 space-y-2'>
															<div className='flex justify-between text-sm'>
																<span>Progress</span>
																<span>{Math.round(subject.percentChaptersCompleted)}%</span>
															</div>
															<Progress
																value={Math.round(subject.percentChaptersCompleted)}
																className='h-3 bg-white/20'
															/>
														</div>
													</div>
													<div className='flex flex-col gap-2 py-5'>
														<div className='mb-6 flex items-center justify-between'>
															<h2 className='flex items-center gap-2 text-xl font-semibold'>
																<Clock className='h-5 w-5' />
																Theory Completed
															</h2>
															<Badge
																className={getProgressBadgeColor(
																	Math.round(subject.percentTheoryCompleted),
																)}>
																{Math.round(subject.percentTheoryCompleted)}% elapsed
															</Badge>
														</div>

														{/* * Progress Bar */}
														<div className='mt-6 space-y-2'>
															<div className='flex justify-between text-sm'>
																<span>Progress</span>
																<span>{Math.round(subject.percentTheoryCompleted)}%</span>
															</div>
															<Progress
																value={Math.round(subject.percentTheoryCompleted)}
																className='h-3 bg-white/20'
															/>
														</div>
													</div>
													<div className='flex flex-col gap-2 py-5'>
														<div className='mb-6 flex items-center justify-between'>
															<h2 className='flex items-center gap-2 text-xl font-semibold'>
																<Clock className='h-5 w-5' />
																PYQs Completed
															</h2>
															<Badge
																className={getProgressBadgeColor(
																	Math.round(subject.percentPYQsSolved),
																)}>
																{Math.round(subject.percentPYQsSolved)}% elapsed
															</Badge>
														</div>

														{/* * Progress Bar */}
														<div className='mt-6 space-y-2'>
															<div className='flex justify-between text-sm'>
																<span>Progress</span>
																<span>{Math.round(subject.percentPYQsSolved)}%</span>
															</div>
															<Progress
																value={Math.round(subject.percentPYQsSolved)}
																className='h-3 bg-white/20'
															/>
														</div>
													</div>
												</CardContent>
											</EnhancedCard>
										))}
									</div>
								</div>
							</CardContent>
						</EnhancedCard>
					</section>
				)}
			</section>
		</main>
	);
}

// * Enhanced Card Component with Modern Glass Effects
const EnhancedCard = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => {
	return (
		<Card
			className={cn(
				'backdrop-blur-md bg-white/40 dark:bg-black/20',
				'border border-white/30 dark:border-white/10',
				'shadow-2xl shadow-primary/10 dark:shadow-primary/20',
				'rounded-4xl ',
				'transition-all duration hover:shadow-3xl hover:shadow-primary/20',
				'hover:bg-white/50 dark:hover:bg-black/30',
				className,
			)}>
			{children}
		</Card>
	);
};
