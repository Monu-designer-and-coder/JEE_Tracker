/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { FcLink, FcPlanner, FcSurvey } from 'react-icons/fc';
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '../ui/card';
import { CardBlockUI } from './card-block.module';
import { Button } from '../ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import { axiosConfig } from '@/config/axios.config';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '../ui/tooltip';
import { formatDate, formatMilliseconds } from '@/lib/helpers';
import { STORAGE_KEYS } from '@/config/constants';
import { toast } from 'react-toastify';
import { useAppSelector } from '@/hooks/actions';
import { Skeleton } from '../ui/skeleton';
import { AggregatePaginateResult } from 'mongoose';
import { Badge } from '../ui/badge';
import { Container } from '../base/Container.base.component';
import { sessionActionSchema } from '@/schema/studyTask.schema';
import z from 'zod';
import { iStudyTaskListItem } from '@/types/res/system.res.types';
import { iApiResponse } from '@/types/backend/apiResponse.types';

export const CurrentTaskCard02 = ({ className }: { className?: string }) => {
	// ! Hydration Safety Pattern: Prevents mismatches between SSR and Client rendering
	const [isMounted, setIsMounted] = useState<boolean>(false);

	const [CurrentTaskList, setCurrentTaskList] = useState<
		AggregatePaginateResult<iStudyTaskListItem>
	>({
		docs: [],
		totalDocs: 0,
		limit: 20,
		page: 1,
		totalPages: 1,
		pagingCounter: 1,
		hasPrevPage: false,
		hasNextPage: false,
		prevPage: null,
		nextPage: null,
	});

	const [currentTime, setCurrentTime] = useState(
		new Intl.DateTimeFormat('en-IN', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			weekday: 'long',
			day: '2-digit',
			month: 'long',
			year: 'numeric',
			hourCycle: 'h23',
		}).format(new Date()),
	);

	function fetchCurrentTasksList() {
		axios
			.request(axiosConfig('system/study-task', 'get'))
			.then(
				(
					response: AxiosResponse<
						iApiResponse<AggregatePaginateResult<iStudyTaskListItem>>
					>,
				) => {
					setCurrentTaskList(response.data.data);
				},
			);
	}

	useEffect(() => {
		setIsMounted(true);
		const timerInterval = setInterval(() => {
			setCurrentTime(
				new Intl.DateTimeFormat('en-IN', {
					hour: '2-digit',
					minute: '2-digit',
					second: '2-digit',
					weekday: 'long',
					day: '2-digit',
					month: 'long',
					year: 'numeric',
					hourCycle: 'h23',
				}).format(new Date()),
			);
		}, 1000);

		fetchCurrentTasksList();

		return () => clearInterval(timerInterval);
	}, []);

	if (!isMounted) {
		return (
			<Skeleton className='min-h-100 w-full animate-pulse rounded-[2rem] bg-accent/20 mx-auto max-w-5xl mt-8' />
		);
	}

	return (
		<Card
			className={cn(
				'relative overflow-hidden',
				'[--card-spacing:--spacing(8)]',
				'border border-primary/30 rounded-4xl',
				className,
			)}>
			{/* ? HEADER SECTION */}
			<CardHeader>
				<CardTitle className='flex items-center gap-3 '>
					<FcSurvey />
					<Button variant={'ghost'} className='text-lg font-badge' asChild>
						<Link href={'/system/task'}>To Do:</Link>
					</Button>
				</CardTitle>
				<CardDescription>To this Task Now!</CardDescription>
				<CardAction>
					<Button variant='link' asChild>
						<Link href={'/system/'}>
							<FcLink className='w-5 h-5' />
						</Link>
					</Button>
				</CardAction>
			</CardHeader>
			<CardContent>
				<div className='grid grid-cols-3 gap-2 my-4 w-11/12 mx-auto'>
					{CurrentTaskList.docs.map((task) => (
						<Card
							key={String(task._id)}
							className={cn(
								'relative overflow-hidden',
								'[--card-spacing:--spacing(8)]',
								'border border-primary/30 rounded-4xl',
							)}>
							<CardHeader>
								<CardTitle>
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant='ghost'
													size='lg'
													className='w-full capitalize tracking-wide bg-primary/20 text-base/10 font-badge py-6 border border-primary'>
													{task.subjectDetails.name || 'Unknown Subject'}
												</Button>
											</TooltipTrigger>
											<TooltipContent
												side='top'
												sideOffset={12}
												className='z-100 min-w-45 p-4 bg-popover/95 backdrop-blur-xl border border-white/20 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] rounded-xl text-center'>
												<div className='flex flex-col gap-1.5'>
													<p className='text-sm font-bold uppercase tracking-wider text-primary'>
														Assign-Date
													</p>
													<p className='text-base font-medium text-foreground'>
														{formatDate(
															String(task.assignDate) || String(new Date()),
														)}
													</p>
												</div>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</CardTitle>
								<CardDescription className='capitalize grid-cols-6 grid px-3 gap-2 py-2'>
									<Button
										variant='ghost'
										size='lg'
										className='col-span-3 capitalize tracking-wide bg-primary/20 text-base/10 font-badge py-6 border border-primary'>
										{task.studyTask.enum || 'Unknown Subject'}
									</Button>
									<Button
										variant='ghost'
										size='lg'
										className='col-span-3 capitalize tracking-wide bg-primary/20 text-base/10 font-badge py-6 border border-primary'>
										{task.studyTask.tag || 'Unknown Subject'}
									</Button>
								</CardDescription>
								<CardAction>
									<Button variant='link' asChild>
										<Link href={'/tracker'}>
											<FcLink className='w-5 h-5' />
										</Link>
									</Button>
								</CardAction>
							</CardHeader>
							<CardContent className='flex flex-col gap-2'>
								<div className='flex flex-col items-center gap-4'>
									<button
										className='group/btn relative flex w-full flex-col items-center justify-center overflow-hidden rounded-4xl border border-primary/30 py-1 text-center  transition-all duration-300 hover:-translate-y-1 hover:bg-primary/10 hover:border-primary/10'
										aria-label={`Increment questions done for ${task.subjectDetails.name}`}>
										<div className='relative z-10 flex flex-col items-center'>
											<span className='text-xl font-normal font-badge tracking-tight md:text-2xl '>
												{formatMilliseconds(task.totalTimeSpent)}
											</span>
											<span className='my-1 text-xs font-normal capitalize tracking-wider text-muted-foreground opacity-90 transition-colors group-hover/btn:text-foreground font-heading'>
												Total Time Spent on the task
											</span>
										</div>
									</button>
								</div>
								<div className='flex flex-col items-center gap-4'>
									<button
										className='group/btn relative flex w-full flex-col items-center justify-center overflow-hidden rounded-4xl border border-primary/30 py-1 text-center  transition-all duration-300 hover:-translate-y-1 hover:bg-primary/10 hover:border-primary/10'
										aria-label={`Increment questions done for ${task.subjectDetails.name}`}>
										<div className='relative z-10 flex flex-col items-center'>
											<span className='text-xl font-normal font-badge tracking-tight md:text-2xl py-2 px-3 '>
												{task.refDetails.name}
											</span>
											<span className='my-1 text-xs font-normal capitalize tracking-wider text-muted-foreground opacity-90 transition-colors group-hover/btn:text-foreground font-heading'>
												Name of the TASK
											</span>
										</div>
									</button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
				<div className='flex items-center justify-center my-4 w-11/12 mx-auto'></div>
				<div className='flex items-center justify-center my-4 w-11/12 mx-auto'>
					<CardBlockUI
						className='grid-cols-1'
						cardBlockUIContentList={[
							{
								label: 'Time',
								value: currentTime,
								subtext: '',
								animate: true,
							},
						]}
					/>
				</div>
			</CardContent>
		</Card>
	);
};
export const CurrentTaskCard03 = ({ className }: { className?: string }) => {
	// ! Hydration Safety Pattern: Prevents mismatches between SSR and Client rendering
	const [isMounted, setIsMounted] = useState<boolean>(false);

	const [CurrentTaskList, setCurrentTaskList] = useState<
		AggregatePaginateResult<iStudyTaskListItem>
	>({
		docs: [],
		totalDocs: 0,
		limit: 20,
		page: 1,
		totalPages: 1,
		pagingCounter: 1,
		hasPrevPage: false,
		hasNextPage: false,
		prevPage: null,
		nextPage: null,
	});

	const [currentTime, setCurrentTime] = useState(
		new Intl.DateTimeFormat('en-IN', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			weekday: 'long',
			day: '2-digit',
			month: 'long',
			year: 'numeric',
			hourCycle: 'h23',
		}).format(new Date()),
	);

	const handleSessionsAxiosConfigHook = useMemo(
		() =>
			axiosConfig('system/study-task/session', 'put', {
				'Content-Type': 'application/json',
			}),
		[],
	);

	function fetchCurrentTasksList() {
		axios
			.request(axiosConfig('system/study-task', 'get'))
			.then(
				(
					response: AxiosResponse<iApiResponse<AggregatePaginateResult<iStudyTaskListItem>>>,
				) => {
					setCurrentTaskList(response.data.data);
				},
			);
	}

	function handleSessionsOperations(
		studyTaskId: string,
		action: 'done' | 'end' | 'start',
	) {
		type sessionActionsSchemaTypes = z.infer<typeof sessionActionSchema>;
		const data: sessionActionsSchemaTypes = {
			studyTaskId,
			action,
		};
		const config = {
			...handleSessionsAxiosConfigHook,
			data,
		};
		axios
			.request(config)
			.then(() => {
				toast.success('Successfully' + action + 'action Taken');
			})
			.catch((err) => {
				console.log({ err });
				toast.error(err?.response?.data?.error || 'failed');
			})
			.finally(() => {
				fetchCurrentTasksList();
			});
	}

	useEffect(() => {
		setIsMounted(true);
		const timerInterval = setInterval(() => {
			setCurrentTime(
				new Intl.DateTimeFormat('en-IN', {
					hour: '2-digit',
					minute: '2-digit',
					second: '2-digit',
					weekday: 'long',
					day: '2-digit',
					month: 'long',
					year: 'numeric',
					hourCycle: 'h23',
				}).format(new Date()),
			);
		}, 1000);

		fetchCurrentTasksList();

		return () => clearInterval(timerInterval);
	}, []);

	if (!isMounted) {
		return (
			<Skeleton className='min-h-100 w-full animate-pulse rounded-[2rem] bg-accent/20 mx-auto max-w-5xl mt-8' />
		);
	}

	return (
		<Card
			className={cn(
				'relative overflow-hidden',
				'[--card-spacing:--spacing(8)]',
				'border border-primary/30 rounded-4xl',
				className,
			)}>
			{/* ? HEADER SECTION */}
			<CardHeader>
				<CardTitle className='flex items-center gap-3 '>
					<FcSurvey />
					<Button variant={'ghost'} className='text-lg font-badge' asChild>
						<Link href={'/system/task'}>To Do:</Link>
					</Button>
				</CardTitle>
				<CardDescription>To this Task Now!</CardDescription>
				<CardAction>
					<Button variant='link' asChild>
						<Link href={'/syllabus/chapter'}>
							<FcLink className='w-5 h-5' />
						</Link>
					</Button>
				</CardAction>
			</CardHeader>
			<CardContent>
				<div className='flex items-center justify-center my-4 w-11/12 mx-auto'>
					<CardBlockUI
						className='grid-cols-1'
						cardBlockUIContentList={[
							{
								label: 'Time',
								value: currentTime,
								subtext: '',
								animate: true,
							},
						]}
					/>
				</div>
				<div className='grid grid-cols-3 gap-2 my-4 w-11/12 mx-auto'>
					{CurrentTaskList.docs.map((task) => (
						<Card
							key={String(task._id)}
							className={cn(
								'relative overflow-hidden',
								'[--card-spacing:--spacing(8)]',
								'border border-primary/30 rounded-4xl',
							)}>
							<CardHeader>
								<CardTitle>
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant='ghost'
													size='lg'
													className='w-full capitalize tracking-wide bg-primary/20 text-base/10 font-badge py-6 border border-primary'>
													{task.subjectDetails.name || 'Unknown Subject'}
												</Button>
											</TooltipTrigger>
											<TooltipContent
												side='top'
												sideOffset={12}
												className='z-100 min-w-45 p-4 bg-popover/95 backdrop-blur-xl border border-white/20 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] rounded-xl text-center'>
												<div className='flex flex-col gap-1.5'>
													<p className='text-sm font-bold uppercase tracking-wider text-primary'>
														Assign-Date
													</p>
													<p className='text-base font-medium text-foreground'>
														{formatDate(
															String(task.assignDate) || String(new Date()),
														)}
													</p>
												</div>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</CardTitle>
								<CardDescription className='capitalize text-sm flex gap-3'>
									<Badge>{task.studyTask.enum}</Badge>
									<Badge>{task.studyTask.tag}</Badge>
								</CardDescription>
								<CardAction>
									<Button variant='link' asChild>
										<Link href={'/system/study'}>
											<FcLink className='w-5 h-5' />
										</Link>
									</Button>
								</CardAction>
							</CardHeader>
							<CardContent>
								<div className='flex flex-col items-center gap-4'>
									<button
										className='group/btn relative flex w-full flex-col items-center justify-center overflow-hidden rounded-4xl border border-primary/30 py-1 text-center  transition-all duration-300 hover:-translate-y-1 hover:bg-primary/10 hover:border-primary/10'
										aria-label={`Increment questions done for ${task.subjectDetails.name}`}>
										<div className='relative z-10 flex flex-col items-center'>
											<span className='text-base font-normal font-badge px-3 py-2'>
												{task.refDetails.name}
											</span>
											<span className='my-1 text-xs font-normal capitalize tracking-wider text-muted-foreground opacity-90 transition-colors group-hover/btn:text-foreground font-heading'>
												The GOAL:
											</span>
										</div>
									</button>
									<button
										className='group/btn relative flex w-full flex-col items-center justify-center overflow-hidden rounded-4xl border border-primary/30 py-1 text-center  transition-all duration-300 hover:-translate-y-1 hover:bg-primary/10 hover:border-primary/10'
										aria-label={`Increment questions done for ${task.subjectDetails.name}`}>
										<div className='relative z-10 flex flex-col items-center'>
											<span className='text-xl font-normal font-badge tracking-tight md:text-2xl '>
												{formatMilliseconds(task.totalTimeSpent)}
											</span>
											<span className='my-1 text-xs font-normal capitalize tracking-wider text-muted-foreground opacity-90 transition-colors group-hover/btn:text-foreground font-heading'>
												Time spent on the GOAL:
											</span>
										</div>
									</button>
									<Container className='w-full grid grid-cols-2'>
										<Button
											size={'lg'}
											variant={'default'}
											className='cursor-pointer w-full'
											onClick={() => {
												handleSessionsOperations(String(task._id), 'start');
											}}
											disabled={task.isSessionActive}>
											Start
										</Button>
										<Button
											size={'lg'}
											variant={'default'}
											className='cursor-pointer w-full'
											onClick={() => {
												handleSessionsOperations(String(task._id), 'end');
											}}
											disabled={!task.isSessionActive}>
											End
										</Button>
									</Container>
									<Container className='w-full grid grid-cols-1'>
										<Button
											size={'lg'}
											variant={'default'}
											className='cursor-pointer w-full'
											onClick={() => {
												handleSessionsOperations(String(task._id), 'done');
											}}>
											Done
										</Button>
									</Container>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</CardContent>
		</Card>
	);
};

export const TodayTasksStreakCard = ({ className }: { className?: string }) => {
	//! State Management
	const currentStudySession = useAppSelector((state) => state.studySession);

	// ! Hydration Safety Pattern: Prevents mismatches between SSR and Client rendering
	const [isMounted, setIsMounted] = useState<boolean>(false);

	//* local states

	const [todaysProgressData, setTodaysProgressData] = useState<{
		totalQuestionsDone: number;
		totalTimeStudiedMs: number;
	}>({
		totalQuestionsDone: 0,
		totalTimeStudiedMs: 0,
	});

	// * UseEffects
	useEffect(() => {
		setIsMounted(true);
		const todaysProgressInLocalStorage: string | null = localStorage.getItem(
			STORAGE_KEYS.TODAYS_PROGRESS,
		);
		if (todaysProgressInLocalStorage) {
			setTodaysProgressData(JSON.parse(todaysProgressInLocalStorage));
		}
	}, []);
	useEffect(() => {
		if (currentStudySession.isStudySessionActive) return;
		const todaysProgressInLocalStorage: string | null = localStorage.getItem(
			STORAGE_KEYS.TODAYS_PROGRESS,
		);
		if (todaysProgressInLocalStorage) {
			setTodaysProgressData(JSON.parse(todaysProgressInLocalStorage));
		}
	}, [currentStudySession]);

	// ! HYDRATION FALLBACK
	// * Render a skeleton or empty wrapper before client hydration to ensure exact HTML matching
	if (!isMounted) {
		return (
			<Skeleton className='min-h-100 w-full animate-pulse rounded-[2rem] bg-accent/20 mx-auto max-w-5xl mt-8' />
		);
	}
	return (
		<Card className={cn('relative overflow-hidden my-1 ', className)}>
			<CardHeader className=' gap-4'>
				<CardTitle className='flex items-center gap-3 text-2xl font-bold tracking-tight text-foreground'>
					<FcPlanner className='h-5 w-5' />
					<Button variant={'ghost'} className='text-base' asChild>
						<Link href={'/tracker'} className='text-base'>
							Current Study Session
						</Link>
					</Button>
				</CardTitle>
				<CardDescription className='text-sm text-muted-foreground ml-13'>
					Tracking progress towards your current goal.
				</CardDescription>
				<CardAction>
					<Button variant='link' asChild>
						<Link href={'/tracker'}>
							<FcLink className='w-5 h-5' />
						</Link>
					</Button>
				</CardAction>
			</CardHeader>
			<CardContent className='p-6 md:p-10'>
				<div className='flex items-center justify-center my-4 w-11/12 mx-auto'>
					<CardBlockUI
						className='grid-cols-1'
						cardBlockUIContentList={[
							{
								label: 'Starts At:',
								value: currentStudySession.subjectDetails.subjectName,
								subtext: currentStudySession.isStudySessionActive
									? new Date(
											currentStudySession.sessionStartTime,
										).toLocaleString()
									: new Date().toLocaleString(),
								animate: currentStudySession.isStudySessionActive,
							},
						]}
					/>
				</div>
				<div className='flex items-center justify-center my-4 w-11/12 mx-auto'>
					<CardBlockUI
						className='grid-cols-1'
						cardBlockUIContentList={[
							{
								label: 'Total Questions Done',
								value: String(todaysProgressData.totalQuestionsDone),
								subtext: '',
								animate: currentStudySession.isStudySessionActive,
							},
							{
								label: 'Total Time Studied',
								value: formatMilliseconds(
									todaysProgressData.totalTimeStudiedMs,
								),
								subtext: '',
								animate: true,
							},
						]}
					/>
				</div>
			</CardContent>
		</Card>
	);
};
