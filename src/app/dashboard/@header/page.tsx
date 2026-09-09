/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { CardBlockUI } from '@/components/module/card-block.module';
import { Badge } from '@/components/ui/badge';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { axiosConfig } from '@/config/axios.config';
import {
	calculateDayScore,
	DAILY_STUDY_TARGETS,
	STORAGE_KEYS,
} from '@/config/constants';
import {
	homePageConfig,
	START_DATE,
	TARGET_DATE,
} from '@/config/frontend/homePage.config';
import { useAppSelector } from '@/hooks/actions';
import {
	formatMilliseconds,
	getColorsClassAsPerPercentage,
	getRandomInt,
} from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { iApiResponse } from '@/types/backend/apiResponse.types';
import { iDetailedChapterResponse } from '@/types/res/chapter.res.types';
import { iExtendedDetailedSubjectStreakDocumentResponse } from '@/types/res/subjectStreak.res.types';
import { iStudyTaskListItem } from '@/types/res/system.res.types';
import axios, { AxiosResponse } from 'axios';
import { AggregatePaginateResult } from 'mongoose';
import { useEffect, useMemo, useState } from 'react';
import { FcClock, FcOvertime } from 'react-icons/fc';
import { FcPlanner } from 'react-icons/fc';
import { toast } from 'react-toastify';

const timeFormatter = new Intl.DateTimeFormat('en-IN', {
	hour: '2-digit',
	minute: '2-digit',
	second: '2-digit',
	hourCycle: 'h23',
});

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
	weekday: 'long',
	day: '2-digit',
	month: 'long',
	year: 'numeric',
});

export default function SidebarHeader() {
	const currentStudySession = useAppSelector((state) => state.studySession);

	const [isMounted, setIsMounted] = useState<boolean>(false);

	const [todayCompletedTaskList, setTodayTaskList] = useState<
		AggregatePaginateResult<iStudyTaskListItem>
	>({
		docs: [],
		totalDocs: 0,
		limit: 20,
		totalPages: 1,
		pagingCounter: 1,
		hasPrevPage: false,
		hasNextPage: false,
	});

	const [InProgressChaptersList, setInProgressChaptersList] = useState<
		iDetailedChapterResponse[]
	>([]);

	const [subjectStreaks, setSubjectStreaks] = useState<
		iExtendedDetailedSubjectStreakDocumentResponse[]
	>([]);

	const [todaysProgressData, setTodaysProgressData] = useState<{
		totalQuestionsDone: number;
		totalTimeStudiedMs: number;
		physics: {
			totalQuestionsDone: number;
			totalTimeStudiedMs: number;
		};
		chemistry: {
			totalQuestionsDone: number;
			totalTimeStudiedMs: number;
		};
		mathematics: {
			totalQuestionsDone: number;
			totalTimeStudiedMs: number;
		};
	}>({
		totalQuestionsDone: 0,
		totalTimeStudiedMs: 0,
		physics: {
			totalQuestionsDone: 0,
			totalTimeStudiedMs: 0,
		},
		chemistry: {
			totalQuestionsDone: 0,
			totalTimeStudiedMs: 0,
		},
		mathematics: {
			totalQuestionsDone: 0,
			totalTimeStudiedMs: 0,
		},
	});

	const fetchTodayStreaks = async () => {
		try {
			const serviceResponse: AxiosResponse<
				iApiResponse<iExtendedDetailedSubjectStreakDocumentResponse[]>
			> = await axios.request(axiosConfig(`subjectStreak?type=today`, 'get'));

			setSubjectStreaks(serviceResponse.data.data);
		} catch (error) {
			console.error(
				'Failed processing underlying incremental data streams:',
				error,
			);
		} finally {
		}
	};

	function fetchChaptersInProgressLists() {
		axios
			.request(axiosConfig('system', 'get'))
			.then(
				(response: AxiosResponse<iApiResponse<iDetailedChapterResponse[]>>) => {
					setInProgressChaptersList(response.data.data);
				},
			);
	}

	function fetchTodayTasksList() {
		axios
			.request(axiosConfig('system/today', 'get'))
			.then(
				(
					response: AxiosResponse<
						iApiResponse<AggregatePaginateResult<iStudyTaskListItem>>
					>,
				) => {
					setTodayTaskList(response.data.data);
				},
			)
			.catch((error) => console.log({ error }));
	}

	useEffect(() => {
		setIsMounted(true);
		fetchChaptersInProgressLists();
	}, []);
	useEffect(() => {
		fetchTodayStreaks();
		fetchTodayTasksList();
	}, [currentStudySession]);

	useEffect(() => {
		const totals = subjectStreaks.reduce(
			(acc, current) => {
				acc.totalQuestionsDone += current.questionsDone;
				acc.totalTimeStudiedMs += current.timeStudied;
				return acc;
			},
			{ totalQuestionsDone: 0, totalTimeStudiedMs: 0 },
		);

		localStorage.setItem(
			STORAGE_KEYS.TODAYS_PROGRESS,
			JSON.stringify({
				totalQuestionsDone: totals.totalQuestionsDone,
				totalTimeStudiedMs: totals.totalTimeStudiedMs,
			}),
		);
		const physicsTodaysStreakDetails = subjectStreaks.filter(
			(subject) => subject.subject.name === 'physics',
		)[0];
		const chemistryTodaysStreakDetails = subjectStreaks.filter(
			(subject) => subject.subject.name === 'chemistry',
		)[0];
		const mathematicsTodaysStreakDetails = subjectStreaks.filter(
			(subject) => subject.subject.name === 'mathematics',
		)[0];
		setTodaysProgressData({
			totalQuestionsDone: totals.totalQuestionsDone,
			totalTimeStudiedMs: totals.totalTimeStudiedMs,
			physics: {
				totalQuestionsDone: physicsTodaysStreakDetails?.questionsDone || 0,
				totalTimeStudiedMs: physicsTodaysStreakDetails?.timeStudied || 0,
			},
			chemistry: {
				totalQuestionsDone: chemistryTodaysStreakDetails?.questionsDone || 0,
				totalTimeStudiedMs: chemistryTodaysStreakDetails?.timeStudied || 0,
			},
			mathematics: {
				totalQuestionsDone: mathematicsTodaysStreakDetails?.questionsDone || 0,
				totalTimeStudiedMs: mathematicsTodaysStreakDetails?.timeStudied || 0,
			},
		});
	}, [subjectStreaks]);

	if (!isMounted) {
		return (
			<header className='w-full h-2/12 grid py-3 px-5 gap-4 grid-cols-12'>
				<Skeleton className='h-full w-full animate-pulse rounded-[2rem] bg-accent/20 mx-auto col-span-12 md:col-span-6 lg:col-span-3' />
				<Skeleton className='h-full w-full animate-pulse rounded-[2rem] bg-accent/20 mx-auto col-span-12 md:col-span-6 lg:col-span-3' />
				<Skeleton className='h-full w-full animate-pulse rounded-[2rem] bg-accent/20 mx-auto col-span-12 md:col-span-6 lg:col-span-3' />
				<Skeleton className='h-full w-full animate-pulse rounded-[2rem] bg-accent/20 mx-auto col-span-12 md:col-span-6 lg:col-span-3' />
			</header>
		);
	}

	return (
		<header className='w-full h-2/12 grid py-3 px-5 gap-4 grid-cols-12'>
			<div className='col-span-12 bg-primary/5 border border-complementary/35 md:col-span-6 lg:col-span-3 rounded-4xl flex flex-col items-center justify-center'>
				<div className='w-full px-4'>
					<h3 className='text-sm md:text-base xl:text-lg 2xl:text-xl font-clock font-black'>
						Todays&apos; Goals:{' '}
						<Badge
							className={cn(
								getColorsClassAsPerPercentage(
									(calculateDayScore(
										todaysProgressData.totalQuestionsDone,
										todaysProgressData.totalTimeStudiedMs,
									) *
										100) /
										DAILY_STUDY_TARGETS.score,
								),
							)}
							variant={'outline'}>
							{' '}
							Score:
							{calculateDayScore(
								todaysProgressData.totalQuestionsDone,
								todaysProgressData.totalTimeStudiedMs,
							)}
							/{`							${DAILY_STUDY_TARGETS.score.toLocaleString()} `}
						</Badge>
						<Badge>{todayCompletedTaskList.docs.length.toLocaleString()}</Badge>
					</h3>
				</div>
				<div className='w-full px-4'>
					<div className='flex justify-end items-end'>
						<span className='text-primary text-xs md:text-sm xl:text-base font-clock font-thin'>
							Completed{' '}
							{todayCompletedTaskList.docs.filter(
								(task) => task.studyTask.enum == 'topic',
							).length / 2}{' '}
							Topics Out of{' '}
							{Math.ceil(
								(InProgressChaptersList.map(
									(chapter) => chapter.topicsList.length,
								).reduce((prev, curr) => (prev += curr), 0) *
									1.2) /
									7,
							)}
						</span>
					</div>

					{/* * Shadcn Progress with customized height and inner shadow styling */}
					<div className='relative overflow-hidden rounded-full bg-accent/50 p-1 shadow-inner'>
						<Progress
							value={
								((todayCompletedTaskList.docs.filter(
									(task) => task.studyTask.enum == 'topic',
								).length /
									2) *
									100) /
								Math.ceil(
									(InProgressChaptersList.map(
										(chapter) => chapter.topicsList.length,
									).reduce((prev, curr) => (prev += curr), 0) *
										1.2) /
										7,
								)
							}
							className='h-3 rounded-full bg-transparent'
							aria-label='Countdown Progress'
						/>
					</div>
				</div>
				<div className='w-full px-4'>
					<div className='flex justify-end items-end'>
						<span className='text-primary text-xs md:text-sm xl:text-base font-clock font-thin'>
							Studied{' '}
							{formatMilliseconds(todaysProgressData.totalTimeStudiedMs)} Hours
							Out of {formatMilliseconds(DAILY_STUDY_TARGETS.timeStudied)}
						</span>
					</div>

					{/* * Shadcn Progress with customized height and inner shadow styling */}
					<div className='relative overflow-hidden rounded-full bg-accent/50 p-1 shadow-inner'>
						<Progress
							value={
								(todaysProgressData.totalTimeStudiedMs * 100) /
								DAILY_STUDY_TARGETS.timeStudied
							}
							className='h-3 rounded-full bg-transparent'
							aria-label='Countdown Progress'
						/>
					</div>
				</div>
			</div>
			<TimeBlock className='col-span-12 bg-primary/5 border border-complementary/35 md:col-span-6 lg:col-span-3' />
			<MissionCountBlock className='w-full h-full col-span-12 bg-primary/5 border border-complementary/35 lg:col-span-6' />
		</header>
	);
}

function MissionCountBlock({ className }: { className?: string }) {
	const d = new Date();
	const [currentTimeMs, setCurrentTimeMs] = useState<number>(Number(d));

	// ! DERIVED STATE CALCULATIONS (Memoized for performance)
	const {
		days,
		hours,
		minutes,
		seconds,
		percentageElapsed,
		totalDaysRemaining,
	} = useMemo(() => {
		// * Calculate exact bounds
		const totalTimeSpanMs = Math.max(
			1,
			TARGET_DATE.getTime() - START_DATE.getTime(),
		);
		const timeLeftMs = Math.max(0, TARGET_DATE.getTime() - currentTimeMs);

		// * Time breakdown math
		const d = Math.floor(timeLeftMs / (1000 * 60 * 60 * 24));
		const h = Math.floor(
			(timeLeftMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
		);
		const m = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
		const s = Math.floor((timeLeftMs % (1000 * 60)) / 1000);

		// * Progress calculations
		const percentageRemaining = (timeLeftMs / totalTimeSpanMs) * 100;
		// ? Bounded between 0 and 100 to prevent layout shifts or bar overflow
		const pElapsed = Math.min(100, Math.max(0, 100 - percentageRemaining));

		return {
			days: d,
			hours: h,
			minutes: m,
			seconds: s,
			percentageElapsed: pElapsed,
			totalDaysRemaining: d * 24 + h, // * Original metric calculation preserved
		};
	}, [currentTimeMs]);

	useEffect(() => {
		const timerInterval = setInterval(() => {
			setCurrentTimeMs(Date.now());
		}, 1000);
		return () => clearInterval(timerInterval);
	}, []);

	return (
		<Card
			className={cn('relative overflow-hidden rounded-4xl', className)}
			size='sm'>
			<CardHeader>
				<CardTitle className='text-sm md:text-base xl:text-lg 2xl:text-xl font-clock font-black flex items-center gap-3 '>
					<FcOvertime />
					Mission Countdown
				</CardTitle>
			</CardHeader>
			<CardContent>
				<CardBlockUI
					cardBlockUIContentList={[
						{
							label: 'Days',
							value: String(days),
							subtext: `of ${homePageConfig.TOTAL_DAYS} total`,
							className:
								'text-xs md:text-sm xl:text-base 2xl:text-lg font-clock font-black border-0',
						},
						{
							label: 'Hours',
							value: String(hours).padStart(2, '0'),
							subtext: `${totalDaysRemaining} total left`,
							className:
								'text-xs md:text-sm xl:text-base 2xl:text-lg font-clock font-black border-0',
						},
						{
							label: 'Minutes',
							value: String(minutes).padStart(2, '0'),
							className:
								'text-xs md:text-sm xl:text-base 2xl:text-lg font-clock font-black border-0',
						},
						{
							label: 'Seconds',
							value: String(seconds).padStart(2, '0'),
							animate: true,
							className:
								'text-xs md:text-sm xl:text-base 2xl:text-lg font-clock font-black border-0',
						},
					]}
				/>
			</CardContent>
			<CardFooter className='w-full rounded-full border border-primary/30 px-10 py-6 space-y-4'>
				<div className='w-full'>
					<div className='flex justify-between items-end text-sm font-medium'>
						<span className='text-muted-foreground'>
							Overall Timeline Progress
						</span>
						<span className='text-primary text-lg font-bold'>
							{Math.round(percentageElapsed)}%
						</span>
					</div>

					{/* * Shadcn Progress with customized height and inner shadow styling */}
					<div className='relative overflow-hidden rounded-full bg-accent/50 p-1 shadow-inner'>
						<Progress
							value={percentageElapsed}
							className='h-3 rounded-full bg-transparent [&>div]:bg-linear-to-r [&>div]:from-primary [&>div]:to-primary/80'
							aria-label='Countdown Progress'
						/>
					</div>
				</div>
			</CardFooter>
		</Card>
	);
}
function TimeBlock({ className }: { className?: string }) {
	const [now, setNow] = useState<Date | null>(null);

	useEffect(() => {
		setNow(new Date());
		const timerInterval = setInterval(() => {
			setNow(new Date());
		}, 1000);

		return () => clearInterval(timerInterval);
	}, []);

	const currentTime = useMemo(
		() => (now ? timeFormatter.format(now) : ''),
		[now],
	);
	const currentDate = useMemo(
		() => (now ? dateFormatter.format(now) : ''),
		[now],
	);

	return (
		<Card className={cn(className, 'py-2 px-4')}>
			<div className='w-full h-full rounded-4xl flex flex-col items-center justify-center gap-2'>
				<h3 className='text-base sm:text-lg md:text-xl xl:text-2xl 2xl:text-3xl font-clock font-black text-complementary w-full text-center flex items-center justify-around'>
					<FcClock onClick={()=>{
						toast("watch ep: " + getRandomInt(1, 18).toLocaleString())
					}} className='text-lg md:text-xl xl:text-2xl 2xl:text-3xl font-clock font-black text-complementary' />
					{currentTime}
				</h3>
				<Badge
					variant={'outline'}
					className=' text-sm md:text-base xl:text-lg 2xl:text-xl font-clock font-black text-primary py-6 px-2'>
					<FcPlanner className=' text-lg md:text-xl xl:text-2xl 2xl:text-3xl font-clock font-black text-complementary' />{' '}
					{currentDate}
				</Badge>
			</div>
		</Card>
	);
}
