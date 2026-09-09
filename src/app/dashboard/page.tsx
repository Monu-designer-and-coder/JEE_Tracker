/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from '@/components/ui/chart';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { AggregatePaginateResult } from 'mongoose';

import { iApiResponse } from '@/types/backend/apiResponse.types';
import {
	iDailyRecordDocument,
	iExtendedDetailedSubjectStreakDocumentResponse,
} from '@/types/res/subjectStreak.res.types';
import { iStudyTaskListItem } from '@/types/res/system.res.types';
import {
	tChapterStatusUpdateSchema,
	tCreateStudyTaskSchema,
	tSessionActionSchema,
} from '@/types/schema/system.schema.types';

import { axiosConfig } from '@/config/axios.config';
import { RefObject, useEffect, useMemo, useRef, useState } from 'react';
import {
	capitalizeWords,
	formatDate,
	formatMilliseconds,
	formatTime,
	getDaysAgoText,
	getRandomInt,
	getColorsClassAsPerPercentage,
} from '@/lib/helpers';
import { Skeleton } from '@/components/ui/skeleton';

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { useAppDispatch, useAppSelector } from '@/hooks/actions';
import { endStudySession, startStudySession } from '@/reducers/streak.slice';
import {
	CALCULATE_PERCENT_TARGET_ACHIEVED,
	calculateDayScore,
	CHAPTER_COMPLETION_SEQUENCE,
	DAILY_STUDY_TARGETS,
	STORAGE_KEYS,
	TOPIC_COMPLETION_SEQUENCE,
} from '@/config/constants';
import { WEEKLY_STUDY_TARGETS } from '@/config/constants';
import { iDetailedChapterResponse } from '@/types/res/chapter.res.types';
import {
	eStudyTaskOptions,
	eStudyTaskOptionsChapterTags,
	eStudyTaskOptionsTopicTags,
} from '@/types/model/study-task.model.types';
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from '@/components/ui/item';
import { FcLink, FcOpenedFolder, FcRight } from 'react-icons/fc';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { Bubble, BubbleContent, BubbleReactions } from '@/components/ui/bubble';
import { RadialProgress } from '@/components/ui/radial-progress';

export default function Dashboard() {
	// ! HOOKS
	/**
	 * * Redux dispatch hook for state management
	 * ? Used to update global application state
	 */
	const dispatch = useAppDispatch();

	const [isMounted, setIsMounted] = useState<boolean>(false);

	const [todaySessionsList, setTodaySessionsList] = useState<
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
	const [todayCompletedTaskList, setTodayTaskList] = useState<
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

	const [InProgressChaptersList, setInProgressChaptersList] = useState<
		iDetailedChapterResponse[]
	>([]);

	const [inProgressChapterListLeftTopics, setInProgressChapterListLeftTopics] =
		useState(0);

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

	const currentStudySession = useAppSelector((state) => state.studySession);
	// * State Management
	const [subjectStreaks, setSubjectStreaks] = useState<
		iExtendedDetailedSubjectStreakDocumentResponse[]
	>([]);

	const [liveTimestamp, setLiveTimestamp] = useState<number>(0);
	const [
		currentActiveSessionStreakDetails,
		setCurrentActiveSessionStreakDetails,
	] = useState<iExtendedDetailedSubjectStreakDocumentResponse[]>([]);

	const [dataToDisplay, setDataToDisplay] = useState<iDailyRecordDocument[]>(
		[],
	);

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

	const [now, setNow] = useState<Date | null>(null);

	const hasFired2359: RefObject<{
		fired: boolean;
		streakId?: string;
		streakSubject?: {
			_id: string;
			name: string;
		};
	}> = useRef({
		fired: false,
	});

	const handleSessionsAxiosConfigHook = useMemo(
		() =>
			axiosConfig('system/study-task/session', 'put', {
				'Content-Type': 'application/json',
			}),
		[],
	);

	const markChapterStatusAxiosConfigHook = useMemo(
		() =>
			axiosConfig('system/study-task/chapter-status', 'put', {
				'Content-Type': 'application/json',
			}),
		[],
	);
	const createStudyTaskAxiosConfigHook = useMemo(
		() =>
			axiosConfig('system/study-task/', 'post', {
				'Content-Type': 'application/json',
			}),
		[],
	);
	const axiosTopicFormConfigHook = useMemo(
		() =>
			axiosConfig('syllabus/topic', 'put', {
				'Content-Type': 'application/json',
			}),
		[],
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
			)
			.catch((error) => console.log({ error }));
	}

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

	function fetchTodaySessionsList() {
		axios
			.request(axiosConfig('system/today?type=sessions', 'get'))
			.then(
				(
					response: AxiosResponse<
						iApiResponse<AggregatePaginateResult<iStudyTaskListItem>>
					>,
				) => {
					setTodaySessionsList(response.data.data);
				},
			)
			.catch((error) => console.log({ error }));
	}

	function handleSessionsOperations(
		studyTaskId: string,
		action: 'done' | 'end' | 'start',
	) {
		const data: tSessionActionSchema = {
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
				if (action === 'done' || action === 'end') {
					fetchTodayTasksList();
					fetchTodaySessionsList();
					fetchChaptersInProgressLists();
				}
			});
	}

	function updateTopicTags(
		tag: 'done' | 'theory' | 'inTextQuestions' | 'inClassQuestions',
		topicId: string,
		chapterId: string,
	) {
		const dataToUpdate: {
			done?: boolean;
			theory?: boolean;
			inTextQuestions?: boolean;
			inClassQuestions?: boolean;
		} = {};
		switch (tag) {
			case 'done':
				setInProgressChaptersList((prev) => {
					const currentChapters = prev.filter(
						(chapter) => chapterId === String(chapter._id),
					);
					const restChapters = prev.filter(
						(chapter) => chapterId !== String(chapter._id),
					);
					if (currentChapters.length !== 1) return prev;

					const newTopicsList = currentChapters[0].topicsList.map((item) => {
						if (String(item._id) == topicId) {
							dataToUpdate.done = !item.done;

							dataToUpdate.theory = undefined;
							dataToUpdate.inTextQuestions = undefined;
							dataToUpdate.inClassQuestions = undefined;

							return { ...item, done: !item.done };
						} else {
							return item;
						}
					});
					const newTotalTopicsDone = newTopicsList.filter(
						(topic) => topic.done,
					).length;
					return [
						...restChapters,
						{
							...currentChapters[0],
							topicsList: newTopicsList,
							totalTopicsCompleted: newTotalTopicsDone,
							totalTopicsCompletedPercentage:
								(newTotalTopicsDone * 100) / currentChapters[0].totalTopics,
						},
					];
				});
				axios
					.request({
						...axiosTopicFormConfigHook,
						data: {
							_id: topicId,
							data: dataToUpdate,
						},
					})
					.then(() => {
						toast.success(`Successfully updated Topic`);
					});
				break;
			case 'theory':
				setInProgressChaptersList((prev) => {
					const currentChapters = prev.filter(
						(chapter) => chapterId === String(chapter._id),
					);
					const restChapters = prev.filter(
						(chapter) => chapterId !== String(chapter._id),
					);
					if (currentChapters.length !== 1) return prev;

					const newTopicsList = currentChapters[0].topicsList.map((item) => {
						if (String(item._id) == topicId) {
							dataToUpdate.theory = !item.theory;

							dataToUpdate.done = undefined;
							dataToUpdate.inTextQuestions = undefined;
							dataToUpdate.inClassQuestions = undefined;

							return { ...item, theory: !item.theory };
						} else {
							return item;
						}
					});
					const newTotalTopicsTheoryCompletedPercentage = newTopicsList.filter(
						(topic) => topic.theory,
					).length;
					return [
						...restChapters,
						{
							...currentChapters[0],
							topicsList: newTopicsList,
							totalTopicsTheoryCompleted:
								newTotalTopicsTheoryCompletedPercentage,
							totalTopicsTheoryCompletedPercentage:
								(newTotalTopicsTheoryCompletedPercentage * 100) /
								currentChapters[0].totalTopics,
						},
					];
				});
				axios
					.request({
						...axiosTopicFormConfigHook,
						data: {
							_id: topicId,
							data: dataToUpdate,
						},
					})
					.then(() => {
						toast.success(`Successfully updated Topic`);
					});
				break;
			case 'inTextQuestions':
				setInProgressChaptersList((prev) => {
					const currentChapters = prev.filter(
						(chapter) => chapterId === String(chapter._id),
					);
					const restChapters = prev.filter(
						(chapter) => chapterId !== String(chapter._id),
					);
					if (currentChapters.length !== 1) return prev;

					const newTopicsList = currentChapters[0].topicsList.map((item) => {
						if (String(item._id) == topicId) {
							dataToUpdate.inTextQuestions = !item.inTextQuestions;

							dataToUpdate.theory = undefined;
							dataToUpdate.done = undefined;
							dataToUpdate.inClassQuestions = undefined;

							return { ...item, inTextQuestions: !item.inTextQuestions };
						} else {
							return item;
						}
					});
					return [
						...restChapters,
						{
							...currentChapters[0],
							topicsList: newTopicsList,
						},
					];
				});
				axios
					.request({
						...axiosTopicFormConfigHook,
						data: {
							_id: topicId,
							data: dataToUpdate,
						},
					})
					.then(() => {
						toast.success(`Successfully updated Topic`);
					});
				break;
			case 'inClassQuestions':
				setInProgressChaptersList((prev) => {
					const currentChapters = prev.filter(
						(chapter) => chapterId == String(chapter._id),
					);
					const restChapters = prev.filter(
						(chapter) => chapterId !== String(chapter._id),
					);
					if (currentChapters.length !== 1) return prev;

					const newTopicsList = currentChapters[0].topicsList.map((item) => {
						if (String(item._id) == topicId) {
							dataToUpdate.inClassQuestions = !item.inClassQuestions;

							dataToUpdate.theory = undefined;
							dataToUpdate.inTextQuestions = undefined;
							dataToUpdate.done = undefined;

							return { ...item, inClassQuestions: !item.inClassQuestions };
						} else {
							return item;
						}
					});
					return [
						...restChapters,
						{
							...currentChapters[0],
							topicsList: newTopicsList,
						},
					];
				});
				axios
					.request({
						...axiosTopicFormConfigHook,
						data: {
							_id: topicId,
							data: dataToUpdate,
						},
					})
					.then(() => {
						toast.success(`Successfully updated Topic`);
					});
				break;
		}
	}

	function fetchStudyTrackerChartData() {
		axios
			.request(
				axiosConfig(`subjectStreak?type=byDate&page=${1}&limit=8`, 'get'),
			)
			.then(
				(
					res: AxiosResponse<
						iApiResponse<AggregatePaginateResult<iDailyRecordDocument>>
					>,
				) => {
					setDataToDisplay(res.data.data.docs);
				},
			);
	}

	// * ==========================================================================
	// * API Methods
	// * ==========================================================================

	// * Recursively syncs all structural pagination loops in the background with zero visible UI changes
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

	// * Increment question streak with Optimistic UI updates for faster UX
	const incrementQuestionStreak = async (
		streakId: string,
		subjectId: string,
	) => {
		// * Optimistically update the UI before the API responds for instant feedback
		setSubjectStreaks((prev) =>
			prev.map((item) =>
				item._id === streakId
					? { ...item, questionsDone: item.questionsDone + 1 }
					: item,
			),
		);

		try {
			// * Execute the background API call
			await axios.request(
				axiosConfig(
					'subjectStreak',
					'put',
					{ 'Content-Type': 'application/json' },
					{ _id: streakId, type: 'plusOneQuestion' },
				),
			);

			// * Optionally re-sync with server to ensure data consistency
			const response: AxiosResponse<
				iApiResponse<iExtendedDetailedSubjectStreakDocumentResponse[]>
			> = await axios.request(
				axiosConfig(`subjectStreak?type=today&subjectId=${subjectId}`, 'get'),
			);

			const serverResponsePayload = response.data.data || response.data;
			const updatedItem = Array.isArray(serverResponsePayload)
				? serverResponsePayload[0]
				: null;

			if (updatedItem) {
				setSubjectStreaks((prev) =>
					prev.map((item) =>
						item._id === updatedItem._id ? { ...item, ...updatedItem } : item,
					),
				);
			}
		} catch (error) {
			// ! Rollback on failure
			console.error('Failed to update streak, rolling back...', error);
			fetchTodayStreaks();
		}
	};

	// * Handel Toggle Study Session Button
	const studySessionToggle = async (
		streakId: string,
		subjectId: string,
		subjectName: string,
	) => {
		const currentTime = Date.now();
		if (!currentStudySession.isStudySessionActive) {
			dispatch(
				startStudySession({
					sessionStartTime: currentTime,
					subjectDetails: {
						_id: subjectId,
						subjectName: subjectName,
					},
				}),
			);
			localStorage.setItem(
				STORAGE_KEYS.STUDY_SESSION,
				JSON.stringify({
					isStudySessionActive: true,
					sessionStartTime: currentTime,
					subjectDetails: {
						_id: subjectId,
						subjectName: subjectName,
					},
				}),
			);
		} else {
			const currentTime = Date.now();
			const currentStudySessionTime: number =
				currentTime - currentStudySession.sessionStartTime;

			try {
				// * Execute the background API call
				await axios.request(
					axiosConfig(
						'subjectStreak',
						'put',
						{ 'Content-Type': 'application/json' },
						{
							_id: streakId,
							type: 'addTimeStudied',
							timeStudied: currentStudySessionTime,
						},
					),
				);

				// * Optionally re-sync with server to ensure data consistency
				const response: AxiosResponse<
					iApiResponse<iExtendedDetailedSubjectStreakDocumentResponse[]>
				> = await axios.request(
					axiosConfig(`subjectStreak?type=today&subjectId=${subjectId}`, 'get'),
				);

				const serverResponsePayload = response.data.data || response.data;
				const updatedItem = Array.isArray(serverResponsePayload)
					? serverResponsePayload[0]
					: null;

				if (updatedItem) {
					setSubjectStreaks((prev) =>
						prev.map((item) =>
							item._id === updatedItem._id ? { ...item, ...updatedItem } : item,
						),
					);
					fetchStudyTrackerChartData();
				}
			} catch (error) {
				// ! Rollback on failure
				toast.error('Failed to update streak, rolling back...');
				console.error('Failed to update streak, rolling back...', error);
				fetchTodayStreaks();
			}

			dispatch(
				endStudySession({
					subjectDetails: { _id: '', subjectName: 'No Study Session' },
				}),
			);
			localStorage.setItem(
				STORAGE_KEYS.STUDY_SESSION,
				JSON.stringify({
					isStudySessionActive: false,
					sessionStartTime: 0,
					subjectDetails: { _id: '', subjectName: 'No Study Session' },
				}),
			);
			setLiveTimestamp(0);
		}
	};

	async function handleMarkAsUnfinished(chapterId: string) {
		const data: tChapterStatusUpdateSchema = {
			chapterId,
			type: 'markAsUnfinished',
		};
		const config = {
			...markChapterStatusAxiosConfigHook,
			data,
		};
		axios
			.request(config)
			.then(() => {
				toast.success('marked as unfinished');
			})
			.catch((err: AxiosError<iApiResponse>) => {
				console.log({ err });
				toast.error(err?.response?.data.message || 'failed');
			})
			.finally(() => {
				fetchChaptersInProgressLists();
			});
	}
	async function handleCreateStudyTask(
		refType: eStudyTaskOptions,
		refId: string,
		tag: eStudyTaskOptionsTopicTags | eStudyTaskOptionsChapterTags,
	) {
		const data: tCreateStudyTaskSchema = {
			refType,
			refId,
			tag,
		};
		const config = {
			...createStudyTaskAxiosConfigHook,
			data,
		};
		axios
			.request(config)
			.then(() => {
				toast.success('created Task');
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
		const syncTime = () => setNow(new Date());

		setIsMounted(true);
		fetchCurrentTasksList();
		fetchTodayStreaks();
		fetchStudyTrackerChartData();
		fetchTodayTasksList();
		fetchTodaySessionsList();
		fetchChaptersInProgressLists();

		syncTime(); //* Set initial time on mount

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
		if (StudySessionLocalStorage.isStudySessionActive) {
			dispatch(startStudySession(StudySessionLocalStorage));
		} else {
			dispatch(endStudySession(StudySessionLocalStorage));
		}

		setNow(new Date());
		const timerInterval = setInterval(() => syncTime, 1000);

		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				syncTime();
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			clearInterval(timerInterval);
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	}, []);

	useEffect(() => {
		if (!now) return;

		const hours = now.getHours();
		const minutes = now.getMinutes();
		const seconds = now.getSeconds();

		if (hours === 23 && minutes === 59 && seconds === 59) {
			if (!hasFired2359.current.fired) {
				if (currentStudySession.isStudySessionActive) {
					hasFired2359.current.fired = true;
					hasFired2359.current.streakId = String(
						currentActiveSessionStreakDetails[0]._id,
					);
					hasFired2359.current.streakSubject = {
						_id: String(currentActiveSessionStreakDetails[0].subject._id),
						name: currentActiveSessionStreakDetails[0].subject.name,
					};
					studySessionToggle(
						String(currentActiveSessionStreakDetails[0]._id),
						String(currentActiveSessionStreakDetails[0].subject._id),
						currentActiveSessionStreakDetails[0].subject.name,
					);
				}
				hasFired2359.current.fired = false;
			}
		} else if (hours === 0 && minutes === 0 && seconds === 0) {
			if (hasFired2359.current.fired) {
				fetchTodayStreaks().then(() => {
					if (
						hasFired2359.current.streakId &&
						hasFired2359.current.streakSubject
					) {
						studySessionToggle(
							hasFired2359.current.streakId,
							hasFired2359.current.streakSubject._id,
							hasFired2359.current.streakSubject.name,
						);
					}
				});
			}
			hasFired2359.current.fired = false;
		} else {
			hasFired2359.current.fired = false;
		}
	}, [now]);

	useEffect(() => {
		if (!currentStudySession.isStudySessionActive) return;

		const interval = setInterval(() => {
			setLiveTimestamp(Date.now() - currentStudySession.sessionStartTime);
		}, 1000);

		return () => clearInterval(interval); // cleans up when session ends or component unmounts
	}, [
		currentStudySession.isStudySessionActive,
		currentStudySession.sessionStartTime,
	]);

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

	useEffect(() => {
		const filteredCurrentArrayOfCurrentStudySessionsSubjectsDetails =
			subjectStreaks.filter(
				(streak) =>
					String(streak.subject._id) ===
					String(currentStudySession.subjectDetails._id),
			);

		setCurrentActiveSessionStreakDetails(
			filteredCurrentArrayOfCurrentStudySessionsSubjectsDetails,
		);
	}, [currentStudySession, subjectStreaks]);

	useEffect(() => {
		if (!now) return;

		// Calculates exactly 00:00:00 of the CURRENT day
		const todayMidnight = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate(),
		).getTime();

		if (
			new Date(subjectStreaks[0]?.date).getTime() ||
			(new Date().getTime() < todayMidnight && !hasFired2359.current.fired)
		) {
			fetchTodayStreaks();
			fetchTodayTasksList();
			fetchTodaySessionsList();
			fetchStudyTrackerChartData();
		}
	}, [now?.getDate()]);

	useEffect(() => {
		const Response_inProgressChapterListLeftTopics = InProgressChaptersList.map(
			(chapter) => chapter.totalTopics - chapter.totalTopicsCompleted,
		).reduce((prev, curr) => prev + curr, 0);

		setInProgressChapterListLeftTopics(
			Response_inProgressChapterListLeftTopics,
		);
	}, [InProgressChaptersList]);

	if (!isMounted) {
		return (
			<Skeleton className='min-h-100 w-full animate-pulse rounded-[2rem] bg-accent/20 mx-auto max-w-5xl mt-8' />
		);
	}

	return (
		<section className=' hidden 2xl:grid w-full bg-transparent h-10/12 grid-cols-12 grid-rows-12 py-4 px-6 gap-3'>
			{/* List of Tasks to Complete. */}
			<Card className='w-full col-span-8 row-span-6 bg-primary/10 rounded-4xl py-4 px-3'>
				<CardHeader>
					<CardTitle className='font-heading text-xl'>
						List of Tasks to Complete.{' '}
						<Badge variant={'secondary'}>
							No. of incomplete topics: {inProgressChapterListLeftTopics}
						</Badge>
					</CardTitle>
					<CardAction>
						<Button
							onClick={() => {
								const randomTaskFromTodaysTaskList =
									CurrentTaskList.docs[
										getRandomInt(0, CurrentTaskList.totalDocs - 1)
									];
								toast.info(
									capitalizeWords(
										randomTaskFromTodaysTaskList.subjectDetails.name +
											'-' +
											randomTaskFromTodaysTaskList.studyTask.enum +
											'-' +
											randomTaskFromTodaysTaskList.studyTask.tag +
											'-' +
											randomTaskFromTodaysTaskList.refDetails.name,
									),
								);
							}}>
							Get Random Task.
						</Button>
					</CardAction>
				</CardHeader>
				<CardContent className='overflow-scroll no-scrollbar'>
					<Table className='w-full h-full'>
						<TableCaption>List of Tasks to Complete</TableCaption>
						<TableHeader>
							<TableRow>
								<TableHead>Subject</TableHead>
								<TableHead>[Chapter/Task]</TableHead>
								<TableHead>Name</TableHead>
								<TableHead>Task</TableHead>
								<TableHead>Total-Time</TableHead>
								<TableHead>AssignDate</TableHead>
								<TableHead>Start/End</TableHead>
								<TableHead>Complete</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody className='overflow-scroll no-scrollbar'>
							{CurrentTaskList.docs.map((task) => {
								const subjectStreakDetails = subjectStreaks.filter(
									(streak) =>
										String(streak.subject._id) ===
										String(task.subjectDetails._id),
								)[0];
								return (
									<TableRow key={String(task._id)}>
										<TableCell className='capitalize text-xs font-heading'>
											{task.subjectDetails.name}
										</TableCell>
										<TableCell className='capitalize text-xs font-content-primary'>
											{task.studyTask.enum}
										</TableCell>
										<TableCell className='capitalize text-xs font-content-primary'>
											{task.studyTask.tag}
										</TableCell>
										<TableCell className='capitalize text-xs font-content-primary'>
											{task.refDetails.name}
										</TableCell>
										<TableCell
											className={cn(
												'capitalize text-lg font-clock',
												task.isSessionActive
													? 'text-progressive-1'
													: 'text-foreground',
											)}>
											{task.isSessionActive
												? formatMilliseconds(liveTimestamp)
												: formatMilliseconds(task.totalTimeSpent)}
											<Badge>{task.workingSessions.length}</Badge>
										</TableCell>
										<TableCell
											className={cn(
												'capitalize text-lg font-clock',
												getDaysAgoText(String(task.assignDate)).className,
											)}>
											{getDaysAgoText(String(task.assignDate)).value}
										</TableCell>
										<TableCell className='capitalize text-xs font-content-primary'>
											{task.isSessionActive ? (
												<Button
													size={'lg'}
													variant={'destructive'}
													className='cursor-pointer w-full font-badge'
													onClick={() => {
														handleSessionsOperations(String(task._id), 'end');
														studySessionToggle(
															String(subjectStreakDetails._id),
															String(subjectStreakDetails.subject._id),
															subjectStreakDetails.subject.name,
														);
													}}>
													End
												</Button>
											) : (
												<Button
													size={'lg'}
													variant={'default'}
													className='cursor-pointer w-full font-badge'
													disabled={currentStudySession.isStudySessionActive}
													onClick={() => {
														handleSessionsOperations(String(task._id), 'start');
														studySessionToggle(
															String(subjectStreakDetails._id),
															String(subjectStreakDetails.subject._id),
															subjectStreakDetails.subject.name,
														);
													}}>
													Start
												</Button>
											)}
										</TableCell>
										<TableCell className='capitalize text-xs'>
											<Button
												size={'lg'}
												variant={'default'}
												disabled={currentStudySession.isStudySessionActive}
												className='cursor-pointer w-full font-badge'
												onClick={() => {
													handleSessionsOperations(String(task._id), 'done');
												}}>
												Done
											</Button>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
			<StudyTrackerDisplay
				className='w-full col-span-6 row-span-6 rounded-4xl bg-transparent border border-primary/30'
				dataToDisplay={dataToDisplay}
			/>{' '}
			{/* //? Current Study Session */}
			<div className='w-full rounded-4xl col-span-2 row-span-4 px-3 bg-primary/5 py-2 flex flex-col gap-4 items-center justify-center'>
				<RadialProgress
					value={
						(todaysProgressData.totalQuestionsDone * 100) /
						DAILY_STUDY_TARGETS.questionsDone
					}
					strokeWidth={4}
					className='w-[70%] aspect-square'
					// Reuses the exact same color function as the button, so ring + button always match
					indicatorClassName={getColorsClassAsPerPercentage(
						(todaysProgressData.totalQuestionsDone * 100) /
							DAILY_STUDY_TARGETS.questionsDone,
					)}>
					<Button
						variant={'outline'}
						className={cn(
							// Changed from w-[70%] to w-full h-full: sizing is now controlled
							// by the RadialProgress wrapper above, not the Button itself
							'bg-transparent w-full h-full rounded-full border border-primary flex items-center justify-evenly text-4xl font-clock cursor-pointer',
							getColorsClassAsPerPercentage(
								(todaysProgressData.totalQuestionsDone * 100) /
									DAILY_STUDY_TARGETS.questionsDone,
							),
						)}
						disabled={!currentStudySession.isStudySessionActive}
						onClick={() => {
							incrementQuestionStreak(
								String(currentActiveSessionStreakDetails[0]._id),
								String(currentActiveSessionStreakDetails[0].subject._id),
							);
						}}>
						{currentStudySession.isStudySessionActive
							? String(currentActiveSessionStreakDetails[0]?.questionsDone || 0)
							: `${todaysProgressData.totalQuestionsDone.toLocaleString()}/${DAILY_STUDY_TARGETS.questionsDone.toLocaleString()}`}
					</Button>
				</RadialProgress>
				<div className='w-full h-auto text-center font-heading text-xl uppercase'>
					{currentStudySession.isStudySessionActive
						? currentStudySession.subjectDetails.subjectName
						: 'No Active Session'}
				</div>
			</div>
			{/* //? Today Total Time Studied */}
			<Card className='w-full rounded-4xl col-span-2 row-span-2 border border-primary bg-primary/5 overflow-scroll no-scrollbar'>
				<CardHeader>
					<CardTitle className='font-heading text-xl'>
						Studied for:{' '}
						<Dialog>
							<DialogTrigger>
								<Badge>
									{todaySessionsList.docs
										.map((_) => _.workingSessions)
										.flat()
										.length.toLocaleString()}{' '}
									Sessions
								</Badge>{' '}
							</DialogTrigger>
							<DialogContent className='min-w-[85vh] max-w-[90vh]! max-h-[80vh]! overflow-scroll bg-transparent'>
								<DialogHeader>
									<DialogTitle>Todays Time Studied:</DialogTitle>
									<DialogDescription>
										`` Total Subject-wise time Studied for:
									</DialogDescription>
								</DialogHeader>
								{['chemistry', 'physics', 'mathematics'].map(
									(subject, index) => {
										type tSubjectKEYSforTimeStudied =
											| 'physics'
											| 'chemistry'
											| 'mathematics';
										const subjectKEYSforTimeStudied =
											subject as tSubjectKEYSforTimeStudied;
										return (
											<Item key={String(subject)} variant={'default'}>
												<ItemMedia variant='icon'>
													{index + 1}
													<FcRight />
												</ItemMedia>
												<ItemContent>
													<ItemTitle className='capitalize'>
														{subject}
													</ItemTitle>
													<div className='w-1/2 mx-auto flex items-center justify-between'>
														<Bubble className='w-2/5'>
															<BubbleContent>
																{formatMilliseconds(
																	todaysProgressData[subjectKEYSforTimeStudied]
																		?.totalTimeStudiedMs,
																) || '00.00.00'}
															</BubbleContent>
															<BubbleReactions>
																<span className='text-xs'>
																	total time studied
																</span>
															</BubbleReactions>
														</Bubble>
														<Bubble className='w-2/5'>
															<BubbleContent>
																{todaysProgressData[subjectKEYSforTimeStudied]
																	?.totalQuestionsDone || '00'}
															</BubbleContent>
															<BubbleReactions>
																<span className='text-xs'>
																	total question done
																</span>
															</BubbleReactions>
														</Bubble>
													</div>
												</ItemContent>
											</Item>
										);
									},
								)}
							</DialogContent>
						</Dialog>
					</CardTitle>
				</CardHeader>
				<CardContent
					className={cn(
						getColorsClassAsPerPercentage(
							(todaysProgressData.totalTimeStudiedMs * 100) /
								DAILY_STUDY_TARGETS.timeStudied,
						),
						'font-clock flex items-center justify-center h-full text-4xl',
					)}>
					{currentStudySession.isStudySessionActive
						? formatMilliseconds(
								liveTimestamp + todaysProgressData.totalTimeStudiedMs,
							)
						: formatMilliseconds(todaysProgressData.totalTimeStudiedMs)}
				</CardContent>
			</Card>
			{/* //? Study-System */}
			<Card className='w-full col-span-4 row-span-12 col-start-9 row-start-1 bg-transparent border border-primary rounded-4xl py-4 px-3'>
				<CardHeader>
					<CardTitle>Study-System:</CardTitle>
					<CardAction>
						<Button variant='link' asChild>
							<Link href={'/system/'}>
								<FcLink className='w-5 h-5' />
							</Link>
						</Button>
					</CardAction>
				</CardHeader>
				<CardContent className='h-full w-full flex flex-col items-center justify-center gap-2'>
					<Card size='sm' className='w-full h-full rounded-4xl'>
						<CardHeader>
							<CardTitle>Chapters InProgress</CardTitle>
						</CardHeader>
						<CardContent className='flex flex-wrap gap-2 overflow-scroll no-scrollbar'>
							{InProgressChaptersList.map((chapter, index) => (
								<Item key={String(chapter._id)} variant={'outline'}>
									<ItemMedia variant='icon'>
										{index + 1}
										<FcRight />
									</ItemMedia>
									<ItemContent>
										<ItemTitle>{chapter.name}</ItemTitle>
									</ItemContent>
									<ItemActions>
										<Badge
											className={getColorsClassAsPerPercentage(
												chapter.totalTopicsCompletedPercentage,
											)}>
											{chapter.totalTopicsCompleted}/{chapter.totalTopics}
										</Badge>
										<Button
											size={'sm'}
											onClick={() => {
												handleMarkAsUnfinished(String(chapter._id));
											}}>
											Mark Unfinished
										</Button>
										<Dialog>
											<DialogTrigger>
												<FcOpenedFolder />
											</DialogTrigger>
											<DialogContent className='min-w-[85vh] max-w-[90vh]! max-h-[80vh]! overflow-scroll bg-transparent'>
												<DialogHeader>
													<DialogTitle>List of Topics:</DialogTitle>
													<DialogDescription>
														This is all the list topics of {chapter.name}
													</DialogDescription>
													<Table className='w-full'>
														<TableCaption>Topics of the chapters</TableCaption>
														<TableHeader>
															<TableRow>
																<TableHead>S.No.</TableHead>
																<TableHead>Topic Name</TableHead>
																<TableHead>Theory</TableHead>
																<TableHead>In-Text Qs</TableHead>
																<TableHead>In-Class Qs</TableHead>
																<TableHead>Done</TableHead>
															</TableRow>
														</TableHeader>
														<TableBody>
															{chapter.topicsList.map((topic) => (
																<TableRow key={String(topic._id)}>
																	<TableCell>{topic.seqNumber}</TableCell>
																	<TableCell className='capitalize'>
																		{topic.name}
																	</TableCell>
																	<TableCell>
																		{' '}
																		<Checkbox
																			onClick={() => {
																				updateTopicTags(
																					'theory',
																					String(topic._id),
																					String(chapter._id),
																				);
																			}}
																			checked={topic.theory}
																		/>{' '}
																	</TableCell>
																	<TableCell>
																		{' '}
																		<Checkbox
																			onClick={() => {
																				updateTopicTags(
																					'inTextQuestions',
																					String(topic._id),
																					String(chapter._id),
																				);
																			}}
																			checked={topic.inTextQuestions}
																		/>{' '}
																	</TableCell>
																	<TableCell>
																		{' '}
																		<Checkbox
																			onClick={() => {
																				updateTopicTags(
																					'inClassQuestions',
																					String(topic._id),
																					String(chapter._id),
																				);
																			}}
																			checked={topic.inClassQuestions}
																		/>{' '}
																	</TableCell>
																	<TableCell>
																		{' '}
																		<Checkbox
																			onClick={() => {
																				updateTopicTags(
																					'done',
																					String(topic._id),
																					String(chapter._id),
																				);
																			}}
																			checked={topic.done}
																		/>{' '}
																	</TableCell>
																</TableRow>
															))}
														</TableBody>
													</Table>
												</DialogHeader>
											</DialogContent>
										</Dialog>
									</ItemActions>
								</Item>
							))}
						</CardContent>
					</Card>
					<Card size='sm' className='w-full h-full rounded-4xl'>
						<CardHeader>
							<CardTitle>Chapters&apos; Tasks</CardTitle>
						</CardHeader>
						<CardContent className='overflow-scroll no-scrollbar flex flex-wrap gap-2'>
							{InProgressChaptersList.map((chapter, index) => {
								if (!(chapter.totalTopics - chapter.totalTopicsCompleted)) {
									const tag = CHAPTER_COMPLETION_SEQUENCE.filter(
										(tag) => !chapter[tag],
									)[0];
									return (
										<Item variant={'outline'} key={String(chapter._id)}>
											<ItemMedia variant='icon'>
												{index + 1}
												<FcRight />
											</ItemMedia>
											<ItemContent>
												<ItemTitle className='capitalize'>
													Complete {chapter.name}&apos; {tag}
												</ItemTitle>
											</ItemContent>
											<ItemActions>
												<Button
													disabled={Boolean(
														CurrentTaskList.docs.filter(
															(task) =>
																String(task.refDetails.chapter) ==
																String(chapter._id),
														).length,
													)}
													variant={'outline'}
													size={'sm'}
													onClick={() => {
														handleCreateStudyTask(
															eStudyTaskOptions.Chapter,
															String(chapter._id),
															tag === 'theory'
																? eStudyTaskOptionsChapterTags.Theory
																: tag === 'shortNotes'
																	? eStudyTaskOptionsChapterTags.ShortNotes
																	: tag === 'PYQ_Advanced'
																		? eStudyTaskOptionsChapterTags.PYQ_Advanced
																		: tag === 'PYQ_Mains'
																			? eStudyTaskOptionsChapterTags.PYQ_Mains
																			: tag === 'Book'
																				? eStudyTaskOptionsChapterTags.Book
																				: tag === 'DPP1'
																					? eStudyTaskOptionsChapterTags.DPP1
																					: tag === 'DPP2'
																						? eStudyTaskOptionsChapterTags.DPP2
																						: tag === 'Module'
																							? eStudyTaskOptionsChapterTags.Module
																							: eStudyTaskOptionsChapterTags.mindMap,
														);
													}}>
													Start
												</Button>
											</ItemActions>
										</Item>
									);
								}
								const topic = chapter.topicsList.filter(
									(topic) => !topic.done,
								)[0];
								return (
									<Item variant={'outline'} key={String(topic._id)}>
										<ItemMedia variant='icon'>
											{index + 1}
											<FcRight />
										</ItemMedia>
										<ItemContent>
											<ItemTitle className='capitalize'>
												Complete {chapter.name}&apos; Topic- {topic.name}
											</ItemTitle>
										</ItemContent>
										<ItemActions>
											<Dialog>
												<DialogTrigger asChild>
													<Button
														disabled={Boolean(
															CurrentTaskList.docs.filter(
																(task) =>
																	String(task.refDetails.chapter) ==
																	String(String(chapter._id)),
															).length,
														)}
														variant={'outline'}
														size={'sm'}>
														Start
													</Button>
												</DialogTrigger>
												<DialogContent>
													<DialogHeader>
														<DialogTitle>{topic.name}</DialogTitle>
														<DialogDescription>
															Make this topic the current task.
														</DialogDescription>
													</DialogHeader>
													<div className='flex w-full gap-2 items-center justify-center'>
														{TOPIC_COMPLETION_SEQUENCE.filter(
															(tag) => !topic[tag],
														).map((tag, index) => (
															<Button
																key={String(topic._id) + tag}
																disabled={
																	Boolean(index) ||
																	Boolean(
																		CurrentTaskList.docs.filter(
																			(task) =>
																				String(task.refDetails.chapter) ==
																				String(String(chapter._id)),
																		).length,
																	)
																}
																variant={'outline'}
																size={'sm'}
																onClick={() => {
																	handleCreateStudyTask(
																		eStudyTaskOptions.Topic,
																		String(topic._id),
																		tag === 'theory'
																			? eStudyTaskOptionsTopicTags.Theory
																			: tag === 'inClassQuestions'
																				? eStudyTaskOptionsTopicTags.InClassQuestions
																				: eStudyTaskOptionsTopicTags.InTextQuestions,
																	);
																}}>
																{tag}
															</Button>
														))}
													</div>
												</DialogContent>
											</Dialog>
										</ItemActions>
									</Item>
								);
							})}
						</CardContent>
					</Card>
				</CardContent>
			</Card>
		</section>
	);
}

function StudyTrackerDisplay({
	className,
	dataToDisplay,
}: {
	className?: string;
	dataToDisplay: iDailyRecordDocument[];
}) {
	const chartConfig = {
		views: {
			label: 'Page Views',
		},
		questionsDone: {
			label: 'Questions',
			color: 'var(--chart-3)',
		},
		totalTimeStudied: {
			label: 'Time-Studied',
			color: 'var(--chart-2)',
		},
		score: {
			label: 'Score',
			color: 'var(--chart-4)',
		},
	} satisfies ChartConfig;

	const [chartDataToDisplay, setChartDataToDisplay] = useState<
		{
			date: string;
			score: number;
			questionsDone: number;
			totalTimeStudied: number;
		}[]
	>([]);
	const [activeChart, setActiveChart] =
		useState<keyof typeof chartConfig>('score');

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
	useEffect(() => {
		const data: {
			date: string;
			score: number;
			questionsDone: number;
			totalTimeStudied: number;
		}[] = dataToDisplay.map((streak) => ({
			date: String(streak._id),
			questionsDone: streak.details.reduce(
				(acc, curr) => acc + curr.questionsDone,
				0,
			),
			totalTimeStudied: streak.details.reduce(
				(acc, curr) => acc + curr.timeStudied,
				0,
			),
			score: calculateDayScore(
				calculateDailyTotals(streak.details).totalQuestionsDone,
				calculateDailyTotals(streak.details).totalTimeStudiedMs,
			),
		}));
		setChartDataToDisplay(data);
	}, [dataToDisplay]);

	const total = useMemo(
		() => ({
			questionsDone: chartDataToDisplay.reduce(
				(acc, curr) => acc + curr.questionsDone,
				0,
			),
			totalTimeStudied: chartDataToDisplay.reduce(
				(acc, curr) => acc + curr.totalTimeStudied,
				0,
			),
			score: chartDataToDisplay.reduce((acc, curr) => acc + curr.score, 0),
		}),
		[chartDataToDisplay],
	);

	return (
		<Card className={cn(className)}>
			<CardHeader className='flex items-stretch border-b p-0!'>
				<div className='flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-0!'>
					<CardTitle>Today and Past 7 Days</CardTitle>
					<CardDescription>Showing Total Study this week</CardDescription>
				</div>
				<div className='flex'>
					{['score', 'totalTimeStudied', 'questionsDone'].map((key) => {
						const chart = key as keyof typeof chartConfig;
						return (
							<button
								key={chart}
								data-active={activeChart === chart}
								className={cn(
									'relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:opacity-100 opacity-85 sm:border-t-0 sm:border-l sm:px-8 sm:py-6',
									chart === 'questionsDone'
										? getColorsClassAsPerPercentage(
												CALCULATE_PERCENT_TARGET_ACHIEVED('w8', {
													score: total.score,
													timeStudied: total.totalTimeStudied,
													questionsDone: total.questionsDone,
												}).questionsDone,
											)
										: chart === 'totalTimeStudied'
											? getColorsClassAsPerPercentage(
													CALCULATE_PERCENT_TARGET_ACHIEVED('w8', {
														score: total.score,
														timeStudied: total.totalTimeStudied,
														questionsDone: total.questionsDone,
													}).timeStudied,
												)
											: chart === 'score'
												? getColorsClassAsPerPercentage(
														CALCULATE_PERCENT_TARGET_ACHIEVED('w8', {
															score: total.score,
															timeStudied: total.totalTimeStudied,
															questionsDone: total.questionsDone,
														}).score,
													)
												: '',
								)}
								onClick={() => setActiveChart(chart)}>
								<span className='text-xs text-white'>
									{chartConfig[chart].label}
								</span>
								{chart === 'totalTimeStudied' ? (
									<span className={cn('text-lg leading-none font-bold')}>
										{formatMilliseconds(total.totalTimeStudied)}
									</span>
								) : chart === 'questionsDone' ? (
									<span className={cn('text-lg leading-none font-bold')}>
										{total.questionsDone.toLocaleString()}
									</span>
								) : (
									<span className={cn('text-lg leading-none font-bold')}>
										{total.score.toLocaleString()}
									</span>
								)}

								<Badge variant={'secondary'}>
									Target:{' '}
									{chart === 'questionsDone'
										? WEEKLY_STUDY_TARGETS.weekly_8D.questionsDone
										: chart === 'totalTimeStudied'
											? formatMilliseconds(
													WEEKLY_STUDY_TARGETS.weekly_8D.timeStudied,
												)
											: WEEKLY_STUDY_TARGETS.weekly_8D.score}
								</Badge>
							</button>
						);
					})}
				</div>
			</CardHeader>
			<CardContent className='px-4'>
				<ChartContainer
					config={chartConfig}
					className='aspect-auto h-50 w-full'>
					<BarChart
						accessibilityLayer
						data={chartDataToDisplay}
						margin={{
							left: 12,
							right: 12,
						}}>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey='date'
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							minTickGap={32}
							tickFormatter={(value) => {
								const date = new Date(value);
								if (date.getDate() == new Date().getDate()) return `TODAY`;
								return date
									.toLocaleDateString('en-US', {
										weekday: 'short',
									})
									.toUpperCase();
							}}
						/>
						<ChartTooltip
							content={
								<ChartTooltipContent
									className='w-37.5'
									nameKey='views'
									formatter={(value, name) => (
										<div className='flex flex-col justify-between text-xs text-muted-foreground'>
											<span>{name}</span>
											<span className='font-mono font-medium text-foreground'>
												{name === 'totalTimeStudied'
													? formatMilliseconds(Number(value))
													: value}
											</span>
										</div>
									)}
									labelFormatter={(value) => {
										return new Date(value).toLocaleDateString('en-US', {
											month: 'short',
											day: 'numeric',
											year: 'numeric',
										});
									}}
								/>
							}
						/>
						<Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
