/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Item } from '@/components/ui/item';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';
import { axiosConfig } from '@/config/axios.config';
import { CHAPTER_COMPLETION_SEQUENCE, STORAGE_KEYS } from '@/config/constants';
import { cn } from '@/lib/utils';
import { addChapterToSystem } from '@/schema/system.schema';
import { finalResultData } from '@/types/res/syllabusDataResponse.types';
import {
	getPendingChapter,
	getPendingChapterSubjectWiseList,
} from '@/types/res/SystemResponse.types';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosResponse } from 'axios';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import z from 'zod';

export default function SyllabusHomePage() {
	// ! HYDRATION & STATE MANAGEMENT
	// * Use a single 'mounted' state to prevent React hydration mismatch errors on time-based UI
	const [isMounted, setIsMounted] = useState(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [syllabusData, setSyllabusData] = useState<finalResultData[]>([]);

	const [currentStudySession, setCurrentStudySession] = useState({
		isStudySessionActive: false,
		subjectDetails: {
			_id: '',
			subjectName: 'No Study Session',
		},
		sessionStartTime: 0,
	});

	const [pendingChapterSubjectWiseList, setPendingChapterSubjectWiseList] =
		useState<getPendingChapterSubjectWiseList[]>([
			{
				_id: 'loading',
				name: 'loading',
				chapterList: [
					{
						_id: '_id',
						seqNumber: 0,
						name: 'loading',
					},
				],
			},
		]);
	const [InProgressChaptersList, setInProgressChaptersList] = useState<
		getPendingChapter[]
	>([
		{
			_id: '_id',
			seqNumber: 0,
			name: 'loading',
		},
	]);
	const [upcomingChaptersList, setUpcomingChaptersList] = useState<
		getPendingChapter[]
	>([
		{
			_id: '_id',
			seqNumber: 0,
			name: 'loading',
		},
	]);

	// * Memoized Axios Configuration - Performance optimization
	const axiosConfigHook = useMemo(
		() =>
			axiosConfig('system', 'put', {
				'Content-Type': 'application/json',
			}),
		[],
	);

	// * Enhanced Chapter Form with Improved Validation

	type markChapterUpcomingType = z.infer<typeof addChapterToSystem>;

	const markChapterAsUpComingForm = useForm<markChapterUpcomingType>({
		resolver: zodResolver(addChapterToSystem),
		defaultValues: {
			_id: '',
		},
		mode: 'onChange',
	});

	// * Enhanced Chapter Submit Handler with Improved Logic
	const handleMarkChapterAsUpComing = useCallback(
		async (values: markChapterUpcomingType) => {
			try {
				const config = {
					...axiosConfigHook,
					data: { ...values, type: 'markChapterAsUpComing' },
				};
				await axios.request(config);
				markChapterAsUpComingForm.setValue('_id', 'loading');
				axios
					.request(axiosConfig('system?type=getPendingList', 'get'))
					.then(
						(response: AxiosResponse<getPendingChapterSubjectWiseList[]>) => {
							setPendingChapterSubjectWiseList(response.data);
						},
					);
				axios
					.request(axiosConfig('system?type=getUpcomingList', 'get'))
					.then((response: AxiosResponse<getPendingChapter[]>) => {
						setUpcomingChaptersList(response.data);
					});
			} catch (error: any) {
				const ErrorMessage = error?.response?.data || 'Error';
				toast.error(ErrorMessage);
			}
		},
		[axiosConfigHook, markChapterAsUpComingForm],
	);

	const handleMarkAsUnfinished = async (_id: string) => {
		const config = {
			...axiosConfigHook,
			data: { _id, type: 'markChapterAsUnfinished' },
		};
		await axios.request(config);
		axios
			.request(axiosConfig('system', 'get'))
			.then((response: AxiosResponse<getPendingChapter[]>) => {
				setInProgressChaptersList(response.data);
			});
	};
	const handleMarkAsInProgress = async (_id: string) => {
		const config = {
			...axiosConfigHook,
			data: { _id, type: 'addChapterToSystem' },
		};
		await axios.request(config);
		axios
			.request(axiosConfig('system', 'get'))
			.then((response: AxiosResponse<getPendingChapter[]>) => {
				setInProgressChaptersList(response.data);
			});
		axios
			.request(axiosConfig('system?type=getUpcomingList', 'get'))
			.then((response: AxiosResponse<getPendingChapter[]>) => {
				setUpcomingChaptersList(response.data);
			});
	};

	// ! SIDE EFFECTS
	useEffect(() => {
		setIsMounted(true);
		setIsLoading(false);

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

		axios
			.request(axiosConfig('system?type=getPendingList', 'get'))
			.then((response: AxiosResponse<getPendingChapterSubjectWiseList[]>) => {
				setPendingChapterSubjectWiseList(response.data);
			});
		axios
			.request(axiosConfig('system?type=getUpcomingList', 'get'))
			.then((response: AxiosResponse<getPendingChapter[]>) => {
				setUpcomingChaptersList(response.data);
			});
		axios
			.request(axiosConfig('system', 'get'))
			.then((response: AxiosResponse<getPendingChapter[]>) => {
				setInProgressChaptersList(response.data);
			});
		axios.get('/api/syllabus').then((res: AxiosResponse<finalResultData[]>) => {
			setSyllabusData(res.data);
		});
	}, []);

	// ! HYDRATION FALLBACK
	// * Render a skeleton or empty wrapper before client hydration to ensure exact HTML matching
	if (!isMounted) {
		return (
			<div className='min-h-100 w-full animate-pulse rounded-[2rem] bg-accent/20 mx-auto max-w-5xl mt-8' />
		);
	}

	return (
		<main className='relative min-h-[80vh] w-full overflow-hidden overflow-y-auto bg-background px-4 py-8 md:px-8'>
			{/* * Ambient Background Effects (Aceternity / Minimalist styling) */}
			<div className='pointer-events-none absolute inset-0 z-0 overflow-hidden'>
				<div className='absolute -left-[10%] top-[20%] h-125 w-125 rounded-full bg-primary/10 blur-[120px] mix-blend-screen' />
				<div className='absolute right-[5%] top-[10%] h-100 w-100 rounded-full bg-primary/10 blur-[100px] mix-blend-screen' />
			</div>

			{/* * Content Section */}
			<section className='relative z-10 mx-auto max-w-7xl h-[80vh] flex flex-col justify-center'>
				{isLoading ? (
					// * Loading State
					<div className='flex h-64 items-center justify-center'>
						<div className='h-8 w-8 animate-spin rounded-full border-b-2 border-primary' />
					</div>
				) : (
					<div className='w-full h-full'>
						<header className='flex items-center justify-between w-full'>
							<h1 className='text-primary text-6xl font-black'>SYSTEM</h1>
							<Badge
								className={`text-xl px-7 py-4 my-5 mx-2 font-mono`}
								variant={
									currentStudySession.isStudySessionActive
										? 'default'
										: 'destructive'
								}>
								Current Study Session:
								{''}
								{currentStudySession.subjectDetails.subjectName}{' '}
							</Badge>
						</header>
						<Button className='w-full' asChild variant='outline'>
							<Link href='/system/task'> Open Tasks Page</Link>
						</Button>
						<Sheet>
							<SheetTrigger asChild>
								<Button className='w-full'>Open Tasks InProgress</Button>
							</SheetTrigger>
							<SheetContent side='bottom' className='overflow-auto '>
								<SheetHeader>
									<SheetTitle>List of Tasks</SheetTitle>
									<SheetDescription>
										List of tasks to do for the inProgress Chapters.
									</SheetDescription>
								</SheetHeader>
								<div className='grid grid-flow-col w-full h-[70vh]'>
									{syllabusData.map((subject) => (
										<div key={subject._id} className='p-4 '>
											<h3 className='capitalize text-lg underline text-center'>
												{subject.name}:
											</h3>
											<div className='w-full grid grid-flow-col gap-2 py-2'>
												{subject.chapterList
													.filter((chapter) => {
														return InProgressChaptersList.some(
															(inProgressChapter) =>
																inProgressChapter._id === chapter._id,
														);
													})
													.map((filteredChapter) => (
														<div key={filteredChapter._id} className={`w-full`}>
															<Badge className={`text-base py-4 w-full`}>
																{filteredChapter.name}
															</Badge>
															{filteredChapter[
																CHAPTER_COMPLETION_SEQUENCE[0]
															] ? (
																<></>
															) : (
																<Badge
																	variant='destructive'
																	className='w-full my-2 capitalize'>
																	{CHAPTER_COMPLETION_SEQUENCE[0]}
																</Badge>
															)}
															{filteredChapter[
																CHAPTER_COMPLETION_SEQUENCE[1]
															] ? (
																<></>
															) : (
																<Badge
																	variant='destructive'
																	className='w-full my-2 capitalize'>
																	{CHAPTER_COMPLETION_SEQUENCE[1]}
																</Badge>
															)}
															{filteredChapter[
																CHAPTER_COMPLETION_SEQUENCE[2]
															] ? (
																<></>
															) : (
																<Badge
																	variant='destructive'
																	className='w-full my-2 capitalize'>
																	{CHAPTER_COMPLETION_SEQUENCE[2]}
																</Badge>
															)}
															{filteredChapter[
																CHAPTER_COMPLETION_SEQUENCE[3]
															] ? (
																<></>
															) : (
																<Badge
																	variant='destructive'
																	className='w-full my-2 capitalize'>
																	{CHAPTER_COMPLETION_SEQUENCE[3]}
																</Badge>
															)}

															{filteredChapter.topicsList.length -
																filteredChapter.totalTopicsCompleted ===
															0 ? (
																<></>
															) : (
																<Badge
																	variant='outline'
																	className='w-full my-2 capitalize'>
																	Topics To Complete:{' '}
																	{filteredChapter.topicsList.length -
																		filteredChapter.totalTopicsCompleted}
																</Badge>
															)}
															{filteredChapter.topicsList
																.filter((topicToFilter) => !topicToFilter.done)
																.map((topic) => (
																	<Item key={topic._id}>{topic.name}</Item>
																))}
														</div>
													))}
											</div>
										</div>
									))}
								</div>
							</SheetContent>
						</Sheet>
						<section className='grid grid-cols-2 gap-3'>
							<div>
								<EnhancedCard className='w-full my-5 mx-2'>
									<CardHeader>
										<CardTitle
											className={cn(
												'text-2xl font-bold bg-linear-to-r from-chart-1 to-primary bg-clip-text text-transparent capitalize',
												'scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance',
											)}>
											{' '}
											Chapters in the System
										</CardTitle>
										<CardDescription className='text-secondary-foreground'>
											List of all the chapters in Progress
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className='grid grid-cols-1 gap-2 grid-flow-row my-4'>
											{InProgressChaptersList.map((chapter, index) => (
												<EnhancedCard key={chapter._id}>
													<CardHeader>
														<CardTitle
															className={cn(
																'text-2xl font-bold bg-linear-to-r from-chart-1 to-primary bg-clip-text text-transparent capitalize',
																'scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance',
																'capitalize text-base/8',
															)}>
															{index + 1}. {chapter.name}
															<Badge
																variant={
																	chapter.totalTopics === 0
																		? 'ghost'
																		: chapter.totalTopicsCompleted ===
																			  chapter.totalTopics
																			? 'default'
																			: 'destructive'
																}
																className='text-base/9 mx-3'>
																{chapter.totalTopicsCompleted}/
																{chapter.totalTopics}
															</Badge>
														</CardTitle>
													</CardHeader>
													<CardContent>
														<div className='grid grid-cols-2 grid-rows-2 gap-2 w-full'>
															{CHAPTER_COMPLETION_SEQUENCE.map(
																(task, taskIndex) => (
																	<Field
																		className='space-y-2'
																		key={taskIndex + task}>
																		<div className='flex items-center space-x-3 p-3 rounded-xl bg-white/20 dark:bg-black/20 border border-white/20 hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-300 group'>
																			<Checkbox
																				id={`${chapter._id}-${task}`}
																				checked={chapter[task]}
																				className='enhanced-checkbox data-[state=checked]:bg-primary data-[state=checked]:border-primary border-2 border-slate-300 dark:border-slate-600'
																			/>
																			<FieldLabel
																				className='text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer group-hover:text-primary dark:group-hover:text-chart-1 transition-colors duration-300 capitalize'
																				htmlFor={`${chapter._id}-${task}`}>
																				{taskIndex + 1}. {task}
																			</FieldLabel>
																		</div>
																	</Field>
																),
															)}
															<Button
																onClick={() => {
																	handleMarkAsUnfinished(chapter._id);
																}}
																className='hover:pointer'>
																Mark As Unfinished
															</Button>
														</div>
													</CardContent>
												</EnhancedCard>
											))}
										</div>
									</CardContent>
								</EnhancedCard>
							</div>
							<div>
								<EnhancedCard className='w-full my-5 mx-2'>
									<CardHeader>
										<CardTitle
											className={cn(
												'text-2xl font-bold bg-linear-to-r from-chart-1 to-primary bg-clip-text text-transparent capitalize',
												'scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance',
											)}>
											{' '}
											Select Upcoming Chapter
										</CardTitle>
										<CardDescription className='text-secondary-foreground'>
											List of all the chapters of the subject
										</CardDescription>
									</CardHeader>
									<CardContent>
										<form
											onSubmit={markChapterAsUpComingForm.handleSubmit(
												handleMarkChapterAsUpComing,
											)}
											className='space-y-6'>
											<Controller
												control={markChapterAsUpComingForm.control}
												name='_id'
												render={({ field }) => (
													<Field>
														<EnhancedInputContainer>
															<FieldLabel className='text-sm font-semibold text-primary'>
																Chapter
															</FieldLabel>
															<Select
																onValueChange={field.onChange}
																defaultValue={field.value}>
																<SelectTrigger className='glass-select w-full'>
																	<SelectValue placeholder='Select the chapter' />
																</SelectTrigger>
																<SelectContent className='glass-content'>
																	<SelectItem
																		defaultChecked
																		disabled
																		value={'loading'}
																		className='hover:bg-primary'>
																		Select The Chapter{' '}
																	</SelectItem>
																	{pendingChapterSubjectWiseList.map(
																		(subject) => (
																			<div key={subject._id}>
																				<SelectGroup key={subject._id}>
																					<SelectLabel className='capitalize'>
																						{subject.name}
																					</SelectLabel>
																					{subject.chapterList.map(
																						(chapter) => (
																							<SelectItem
																								key={chapter._id}
																								value={chapter._id}
																								className='hover:bg-primary'>
																								{chapter.seqNumber +
																									'. ' +
																									chapter.name}
																							</SelectItem>
																						),
																					)}
																				</SelectGroup>
																				<SelectSeparator />
																			</div>
																		),
																	)}
																</SelectContent>
															</Select>
														</EnhancedInputContainer>
														<FieldDescription className='text-xs text-secondary-foreground'>
															Select the chapter.
														</FieldDescription>
													</Field>
												)}
											/>
											<Button
												type='submit'
												className='w-full bg-linear-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]'>
												Add Chapter
											</Button>
										</form>
									</CardContent>
								</EnhancedCard>
								<EnhancedCard className='w-full my-5 mx-2'>
									<CardHeader>
										<CardTitle
											className={cn(
												'text-2xl font-bold bg-linear-to-r from-chart-1 to-primary bg-clip-text text-transparent capitalize',
												'scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance',
											)}>
											{' '}
											NEAR FUTURE
										</CardTitle>
										<CardDescription className='text-secondary-foreground'>
											List of all the chapters upcoming
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className='grid grid-cols-1 gap-2 grid-flow-row my-4'>
											{upcomingChaptersList.map((chapter, index) => (
												<EnhancedCard key={chapter._id}>
													<CardHeader>
														<CardTitle
															className={cn(
																'text-2xl font-bold bg-linear-to-r from-chart-1 to-primary bg-clip-text text-transparent capitalize',
																'scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance',
																'capitalize text-base/8',
															)}>
															{index + 1}. {chapter.name}
														</CardTitle>
													</CardHeader>
													<CardContent>
														<div className='w-full'>
															<Button
																onClick={() => {
																	handleMarkAsInProgress(chapter._id);
																}}
																className='hover:pointer w-full'>
																Mark As In Progress
															</Button>
														</div>
													</CardContent>
												</EnhancedCard>
											))}
										</div>
									</CardContent>
								</EnhancedCard>
							</div>
						</section>
					</div>
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
				'rounded-2xl overflow-hidden',
				'transition-all duration-500 hover:shadow-3xl hover:shadow-primary/20',
				'hover:bg-white/50 dark:hover:bg-black/30',
				className,
			)}>
			{children}
		</Card>
	);
};

// * Enhanced Input Container Component with Glass Morphism
const EnhancedInputContainer = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => {
	return (
		<div
			className={cn(
				'flex w-full flex-col space-y-3 group',
				'transition-all duration-300',
				className,
			)}>
			{children}
		</div>
	);
};
