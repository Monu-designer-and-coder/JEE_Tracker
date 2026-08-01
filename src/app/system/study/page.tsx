/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { Container } from '@/components/base/Container.base.component';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { axiosConfig } from '@/config/axios.config';
import { syllabusDetailedDataChapter } from '@/types/res/syllabusDataResponse.types';
import axios, { AxiosResponse } from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { CardTitle } from '@/components/ui/card';
import {
	Item,
	ItemActions,
	ItemContent,
	ItemMedia,
	ItemTitle,
} from '@/components/ui/item';
import { FcRight } from 'react-icons/fc';
import { Button } from '@/components/ui/button';
import {
	CHAPTER_COMPLETION_SEQUENCE,
	TOPIC_COMPLETION_SEQUENCE,
} from '@/config/constants';
import {
	chapterStatusUpdateSchema,
	createStudyTaskSchema,
	studyTaskOptions,
	studyTaskOptionsChapterTags,
	studyTaskOptionsTopicTags,
} from '@/schema/studyTask.schema';
import z from 'zod';
import { toast } from 'react-toastify';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { studyTaskListItem } from '@/types/res/studyTaskResponse.types';
import { AggregatePaginateResult } from 'mongoose';

export default function Page() {
	// ! HYDRATION & STATE MANAGEMENT
	// * Use a single 'mounted' state to prevent React hydration mismatch errors on time-based UI
	const [isMounted, setIsMounted] = useState(false);

	const [InProgressChaptersList, setInProgressChaptersList] = useState<
		syllabusDetailedDataChapter[]
	>([]);
	const [CurrentTaskList, setCurrentTaskList] = useState<
		AggregatePaginateResult<studyTaskListItem>
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

	// * Memoized Axios Configuration - Performance optimization
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

	function fetchTaskLists() {
		axios
			.request(axiosConfig('system', 'get'))
			.then((response: AxiosResponse<syllabusDetailedDataChapter[]>) => {
				setInProgressChaptersList(response.data);
			});
	}
	function fetchCurrentTasksList() {
		axios
			.request(axiosConfig('system/study-task', 'get'))
			.then(
				(
					response: AxiosResponse<AggregatePaginateResult<studyTaskListItem>>,
				) => {
					setCurrentTaskList(response.data);
				},
			);
	}

	async function handleMarkAsUnfinished(chapterId: string) {
		type markChapterUpcomingType = z.infer<typeof chapterStatusUpdateSchema>;
		const data: markChapterUpcomingType = {
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
			.catch((err) => {
				console.log({ err });
				toast.error(err?.response?.data?.error || 'failed');
			})
			.finally(() => {
				fetchTaskLists();
			});
	}
	async function handleCreateStudyTask(
		refType: studyTaskOptions,
		refId: string,
		tag: studyTaskOptionsTopicTags | studyTaskOptionsChapterTags,
	) {
		type createStudyTaskSchemaType = z.infer<typeof createStudyTaskSchema>;
		const data: createStudyTaskSchemaType = {
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

	// ! SIDE EFFECTS
	useEffect(() => {
		setIsMounted(true);
		fetchTaskLists();
		fetchCurrentTasksList();
	}, []);

	// ! SIDE EFFECTS
	useEffect(() => {
		setIsMounted(true);
	}, []);

	// ! HYDRATION FALLBACK
	// * Render a skeleton or empty wrapper before client hydration to ensure exact HTML matching
	if (!isMounted) {
		return (
			<Skeleton className='min-h-100 w-full animate-pulse rounded-[2rem] bg-accent/20 mx-auto max-w-5xl mt-8' />
		);
	}

	return (
		<Container className='w-full h-[85vh] p-5 flex flex-col gap-2'>
			<Card className='w-full overflow-scroll no-scrollbar h-[30%]' size='sm'>
				<CardHeader>
					<CardTitle>CHAPTERS.</CardTitle>
					<CardDescription>List of chapters in progress.</CardDescription>
				</CardHeader>
				<CardContent className='flex flex-col gap-1'>
					<Container className='flex gap-2'>
						{InProgressChaptersList.map((chapter, index) => (
							<Item key={chapter._id} variant={'outline'}>
								<ItemMedia variant='icon'>
									{index + 1}
									<FcRight />
								</ItemMedia>
								<ItemContent>
									<ItemTitle>{chapter.name}</ItemTitle>
								</ItemContent>
								<ItemActions>
									<Button
										size={'sm'}
										onClick={() => {
											handleMarkAsUnfinished(chapter._id);
										}}>
										Mark Unfinished
									</Button>
								</ItemActions>
							</Item>
						))}
					</Container>
					<Container className='flex gap-2'>
						{CurrentTaskList.docs.map((task, index) => (
							<Item key={String(task._id)} variant={'outline'}>
								<ItemMedia variant='icon'>
									{index + 1}
									<FcRight />
								</ItemMedia>
								<ItemContent>
									<ItemTitle>{task.refDetails.name}</ItemTitle>
								</ItemContent>
								<ItemActions>
									<Button size={'sm'} onClick={() => {}}>
										Done
									</Button>
								</ItemActions>
							</Item>
						))}
					</Container>
				</CardContent>
			</Card>
			<Container className='w-full grid grid-cols-2 h-[70%] gap-4 overflow-scroll no-scrollbar'>
				{InProgressChaptersList.map((chapter) => {
					return (
						<Card key={chapter._id} className='w-full'>
							<CardHeader>
								<CardTitle className='uppercase'>{chapter.name}</CardTitle>
								<CardDescription>
									Topics and Tags left to complete.
								</CardDescription>
							</CardHeader>
							<CardContent className='grid grid-cols-2 gap-1 overflow-scroll no-scrollbar'>
								<Container>
									TOPICS LEFT:{' '}
									{chapter.topicsList.filter((topic) => !topic.done).length}
									<Container className='w-full'>
										{chapter.topicsList
											.filter((topic) => !topic.done)
											.map((filteredTopic, index) => (
												<Item key={filteredTopic._id}>
													<ItemContent>
														<ItemTitle className='capitalize'>
															{filteredTopic.name}
														</ItemTitle>
													</ItemContent>
													<ItemActions>
														<Dialog>
															<DialogTrigger asChild>
																<Button
																	disabled={
																		Boolean(index) ||
																		Boolean(
																			CurrentTaskList.docs.filter(
																				(task) =>
																					String(task.refDetails.chapter) ==
																					String(chapter._id),
																			).length,
																		)
																	}
																	variant={'outline'}
																	size={'sm'}>
																	Start
																</Button>
															</DialogTrigger>
															<DialogContent>
																<DialogHeader>
																	<DialogTitle>
																		{filteredTopic.name}
																	</DialogTitle>
																	<DialogDescription>
																		Make this topic the current task.
																	</DialogDescription>
																</DialogHeader>
																<Container className='flex w-full gap-2 items-center justify-center'>
																	{TOPIC_COMPLETION_SEQUENCE.filter(
																		(tag) => !filteredTopic[tag],
																	).map((tag, index) => (
																		<Button
																			key={filteredTopic._id + tag}
																			disabled={
																				Boolean(index) ||
																				Boolean(
																					CurrentTaskList.docs.filter(
																						(task) =>
																							String(task.refDetails.chapter) ==
																							String(chapter._id),
																					).length,
																				)
																			}
																			variant={'outline'}
																			size={'sm'}
																			onClick={() => {
																				handleCreateStudyTask(
																					studyTaskOptions.Topic,
																					filteredTopic._id,
																					tag === 'theory'
																						? studyTaskOptionsTopicTags.Theory
																						: tag === 'inClassQuestions'
																							? studyTaskOptionsTopicTags.InClassQuestions
																							: studyTaskOptionsTopicTags.InTextQuestions,
																				);
																			}}>
																			{tag}
																		</Button>
																	))}
																</Container>
															</DialogContent>
														</Dialog>
													</ItemActions>
												</Item>
											))}
									</Container>
								</Container>
								<Container>
									TAGS LEFT:
									{
										CHAPTER_COMPLETION_SEQUENCE.filter((tag) => !chapter[tag])
											.length
									}
									<Container className='w-full'>
										{CHAPTER_COMPLETION_SEQUENCE.filter(
											(tag) => !chapter[tag],
										).map((tag, index) => (
											<Item key={chapter._id + tag}>
												<ItemContent>
													<ItemTitle className='capitalize'>{tag}</ItemTitle>
												</ItemContent>
												<ItemActions>
													<Button
														disabled={
															Boolean(index) ||
															Boolean(
																chapter.totalTopics -
																chapter.totalTopicsCompleted,
															) ||
															Boolean(
																CurrentTaskList.docs.filter(
																	(task) =>
																		String(task.subjectDetails._id) ==
																		String(chapter.subject._id),
																).length,
															)
														}
														variant={'outline'}
														size={'sm'}
														onClick={() => {
															handleCreateStudyTask(
																studyTaskOptions.Chapter,
																chapter._id,
																tag === 'theory'
																	? studyTaskOptionsChapterTags.Theory
																	: tag === 'shortNotes'
																		? studyTaskOptionsChapterTags.ShortNotes
																		: tag === 'PYQ_Advanced'
																			? studyTaskOptionsChapterTags.PYQ_Advanced
																			: tag === 'PYQ_Mains'
																				? studyTaskOptionsChapterTags.PYQ_Mains
																				: tag === 'Book'
																					? studyTaskOptionsChapterTags.Book
																					: tag === 'DPP1'
																						? studyTaskOptionsChapterTags.DPP1
																						: tag === 'DPP2'
																							? studyTaskOptionsChapterTags.DPP2
																							: tag === 'Module'
																								? studyTaskOptionsChapterTags.Module
																								: studyTaskOptionsChapterTags.mindMap,
															);
														}}>
														Start
													</Button>
												</ItemActions>
											</Item>
										))}
									</Container>
								</Container>
							</CardContent>
						</Card>
					);
				})}
			</Container>
		</Container>
	);
}
