/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { finalResultData } from '@/types/res/syllabusDataResponse.types';
import axios, { AxiosResponse } from 'axios';
import { useEffect, useState } from 'react';
import { CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CurrentTaskSubjectStudySessionController } from '@/components/module/current-task.module';
import {
	ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function SyllabusHomePage() {
	interface iChartData {
		subjectName: string;
		totalChapters: number;
		completedTheory: number;
		completedMainsPYQs: number;
		completedAdvancedPYQs: number;
		completedChapters: number;
	}

	// ! HYDRATION & STATE MANAGEMENT
	// * Use a single 'mounted' state to prevent React hydration mismatch errors on time-based UI
	const [isMounted, setIsMounted] = useState(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const [syllabusData, setSyllabusData] = useState<finalResultData[]>([]);
	const [chartData, setChartData] = useState<iChartData[]>([]);

	const chartConfig = {
		totalChapters: {
			label: 'Total Chapters',
			color: 'var(--chart-1)',
		},
		completedTheory: {
			label: 'Theory Completed',
			color: 'var(--chart-2)',
		},
		completedMainsPYQs: {
			label: 'Mains PYQs',
			color: 'var(--chart-3)',
		},
		completedAdvancedPYQs: {
			label: 'Advanced PYQs',
			color: 'var(--chart-4)',
		},
		completedChapters: {
			label: 'Completed Chapters',
			color: 'var(--chart-5)',
		},
	} satisfies ChartConfig;

	// ! SIDE EFFECTS
	useEffect(() => {
		setIsMounted(true);
		setIsLoading(false);

		axios.get('/api/syllabus').then((res: AxiosResponse<finalResultData[]>) => {
			setSyllabusData(res.data);
		});
	}, []);

	useEffect(() => {
		const FilteredChartData: iChartData[] = syllabusData.map((subject) => ({
			subjectName: subject.name,
			totalChapters: subject.totalChapters,
			completedTheory: subject.completedTheory,
			completedMainsPYQs: subject.completedMainsPYQs,
			completedAdvancedPYQs: subject.completedAdvancedPYQs,
			completedChapters: subject.completedChapters,
		}));
		setChartData(FilteredChartData);
	}, [syllabusData]);

	//! Helper Functions

	// ! HYDRATION FALLBACK
	// * Render a skeleton or empty wrapper before client hydration to ensure exact HTML matching
	if (!isMounted) {
		return (
			<Skeleton className='min-h-100 w-full animate-pulse rounded-[2rem] bg-accent/20 mx-auto max-w-5xl mt-8' />
		);
	}

	return (
		<main className='relative w-full px-4 py-8'>
			{/* * Content Section */}
			<section className='relative z-10 mx-auto flex flex-col justify-center'>
				{isLoading ? (
					// * Loading State
					<div className='flex h-64 items-center justify-center'>
						<div className='h-8 w-8 animate-spin rounded-full border-b-2 border-primary' />
					</div>
				) : (
					<section className='w-full py-2 px-3 gap-2 grid grid-cols-12'>
						<Card size='sm' className='col-span-12'>
							<CardHeader>
								<CardTitle>Syllabus Progress</CardTitle>
								<CardDescription>Track the syllabus Progress.</CardDescription>
							</CardHeader>
							<CardContent className='w-full'>
								<ChartContainer
									config={chartConfig}
									className='w-full h-[30vh]'>
									<BarChart accessibilityLayer data={chartData}>
										<CartesianGrid />
										<XAxis
											dataKey='subjectName'
											tickLine={false}
											tickMargin={10}
											axisLine={false}
											// tickFormatter={(value) => value.slice(0, 3)}
										/>
										<ChartTooltip
											cursor={false}
											content={<ChartTooltipContent indicator='line' />}
										/>

										<ChartLegend content={<ChartLegendContent />} />
										<Bar
											dataKey='totalChapters'
											fill='var(--color-totalChapters)'
											radius={4}
										/>
										<Bar
											dataKey='completedTheory'
											fill='var(--color-completedTheory)'
											radius={4}
										/>
										<Bar
											dataKey='completedMainsPYQs'
											fill='var(--color-completedMainsPYQs)'
											radius={4}
										/>
										<Bar
											dataKey='completedAdvancedPYQs'
											fill='var(--color-completedAdvancedPYQs)'
											radius={4}
										/>
										<Bar
											dataKey='completedChapters'
											fill='var(--color-completedChapters)'
											radius={4}
										/>
									</BarChart>
								</ChartContainer>
							</CardContent>
						</Card>
						<CurrentTaskSubjectStudySessionController className='w-full col-span-4' />
						<Card size='sm' className='col-span-8 border border-primary/50 bg-primary/10'>
							<CardHeader>
								<CardTitle>Topics Details:</CardTitle>
							</CardHeader>
							<CardContent className='flex flex-col gap-1'>
								{syllabusData.map((subject) => {
									const totalTopicsInTheSubject = subject.chapterList.reduce(
										(acc, currentChapter) => {
											return acc + (currentChapter.totalTopics || 0);
										},
										0,
									);
									const totalCompletedTopicsInTheSubject =
										subject.chapterList.reduce((acc, currentChapter) => {
											return acc + (currentChapter.totalTopicsCompleted || 0);
										}, 0);
									const totalCompletedTheoryTopicsInTheSubject =
										subject.chapterList.reduce((acc, currentChapter) => {
											return (
												acc + (currentChapter.totalTopicsTheoryCompleted || 0)
											);
										}, 0);
									const totalCompletedTopicsInTheSubjectPercent =
										(totalCompletedTopicsInTheSubject * 100) /
										totalTopicsInTheSubject;
									const totalCompletedTheoryTopicsInTheSubjectPercent =
										(totalCompletedTheoryTopicsInTheSubject * 100) /
										totalTopicsInTheSubject;
									return (
										<div
											key={subject._id}
											className='w-full rounded-full border border-primary/30  px-10 py-6 space-y-4 flex items-center justify-center gap-2'>
											<div className='w-1/2'>
												<div className='flex justify-between items-end text-xs font-medium'>
													<span className='text-muted-foreground capitalize'>
														Total Topics Theory Completed: {subject.name}
														<Badge>
															{totalCompletedTheoryTopicsInTheSubject}/
															{totalTopicsInTheSubject}
														</Badge>
													</span>
													<span className='text-primary text-lg font-bold'>
														{totalCompletedTheoryTopicsInTheSubject
															? totalCompletedTheoryTopicsInTheSubjectPercent.toFixed(
																	3,
																)
															: 0}
														%
													</span>
												</div>
												<div className='relative overflow-hidden rounded-full bg-accent/50 p-1 shadow-inner'>
													<Progress
														value={
															totalCompletedTheoryTopicsInTheSubjectPercent
														}
														className='h-3 rounded-full bg-transparent [&>div]:bg-linear-to-r [&>div]:from-primary [&>div]:to-primary/80'
														aria-label='Countdown Progress'
													/>
												</div>
											</div>
											<div className='w-1/2'>
												<div className='flex justify-between items-end text-xs font-medium'>
													<span className='text-muted-foreground capitalize'>
														Total Topics Completed: {subject.name}
														<Badge>
															{totalCompletedTopicsInTheSubject}/
															{totalTopicsInTheSubject}
														</Badge>
													</span>
													<span className='text-primary text-lg font-bold'>
														{totalCompletedTopicsInTheSubject
															? totalCompletedTopicsInTheSubjectPercent.toFixed(
																	3,
																)
															: 0}
														%
													</span>
												</div>
												<div className='relative overflow-hidden rounded-full bg-accent/50 p-1 shadow-inner'>
													<Progress
														value={totalCompletedTopicsInTheSubjectPercent}
														className='h-3 rounded-full bg-transparent [&>div]:bg-linear-to-r [&>div]:from-primary [&>div]:to-primary/80'
														aria-label='Countdown Progress'
													/>
												</div>
											</div>
										</div>
									);
								})}
							</CardContent>
						</Card>
					</section>
				)}
			</section>
		</main>
	);
}
