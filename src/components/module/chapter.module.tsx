/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
	HTMLInputTypeAttribute,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { Skeleton } from '../ui/skeleton';
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '../ui/card';
import { FcDataSheet, FcEditImage } from 'react-icons/fc';
import { Button } from '../ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { syllabusDetailedDataChapter } from '@/types/res/syllabusDataResponse.types';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from '../ui/chart';
import { LabelList, PolarGrid, RadialBar, RadialBarChart } from 'recharts';
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '../ui/table';
import { Checkbox } from '../ui/checkbox';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '../ui/breadcrumb';
import { toast } from 'react-toastify';
import { axiosConfig } from '@/config/axios.config';
import axios from 'axios';
import { IoMdAddCircle } from 'react-icons/io';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '../ui/dialog';
import { TopicValidationSchema } from '@/schema/topic.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';
import { Field, FieldDescription, FieldError, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';

export const ChapterModularUI = ({
	className,
	chapterDetails,
}: {
	className?: string;
	chapterDetails: syllabusDetailedDataChapter;
}) => {
	// ! HYDRATION & STATE MANAGEMENT
	// * Use a single 'mounted' state to prevent React hydration mismatch errors on time-based UI
	const [isMounted, setIsMounted] = useState(false);
	const [chapter, setChapter] =
		useState<syllabusDetailedDataChapter>(chapterDetails);

	// * Memoized Axios Configuration - Performance optimization
	const axiosChapterFormConfigHook = useMemo(
		() =>
			axiosConfig('syllabus/chapter', 'put', {
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

	// ! SIDE EFFECTS
	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setIsMounted(true);
		setChapter(chapterDetails);
	}, [chapterDetails]);

	const chartConfig = {
		value: {
			label: 'value',
		},
		topicsCompleted: {
			label: String(chapter.totalTopicsCompletedPercentage.toFixed(1)) + '%',
			color: 'var(--chart-1)',
		},
		topicsTheory: {
			label:
				String(chapter.totalTopicsTheoryCompletedPercentage.toFixed(1)) + '%',
			color: 'var(--chart-2)',
		},
		totalTopics: {
			label: 'Total Topics',
			color: 'var(--chart-3)',
		},
	} satisfies ChartConfig;

	function updateChapterTags(
		tag:
			| 'done'
			| 'theory'
			| 'shortNotes'
			| 'PYQ_Mains'
			| 'PYQ_Advanced'
			| 'DPP1'
			| 'mindMap'
			| 'Module'
			| 'DPP2'
			| 'Book',
	) {
		switch (tag) {
			case 'done':
				setChapter((prev) => ({ ...prev, done: !prev.done }));
				axios
					.request({
						...axiosChapterFormConfigHook,
						data: {
							_id: chapter._id,
							data: {
								done: !chapter.done,
							},
						},
					})
					.then(() => {
						toast.success(
							`Successfully updated ${chapter.name}'s ${tag} as ${!chapter[tag]}`,
						);
					})
					.catch((error) => {
						console.log({ error });
					});
				break;

			case 'theory':
				setChapter((prev) => ({ ...prev, theory: !prev.theory }));
				axios
					.request({
						...axiosChapterFormConfigHook,
						data: {
							_id: chapter._id,
							data: {
								theory: !chapter.theory,
							},
						},
					})
					.then(() => {
						toast.success(
							`Successfully updated ${chapter.name}'s ${tag} as ${!chapter[tag]}`,
						);
					})
					.catch((error) => {
						console.log({ error });
					});
				break;

			case 'shortNotes':
				setChapter((prev) => ({ ...prev, shortNotes: !prev.shortNotes }));
				axios
					.request({
						...axiosChapterFormConfigHook,
						data: {
							_id: chapter._id,
							data: {
								shortNotes: !chapter.shortNotes,
							},
						},
					})
					.then(() => {
						toast.success(
							`Successfully updated ${chapter.name}'s ${tag} as ${!chapter[tag]}`,
						);
					})
					.catch((error) => {
						console.log({ error });
					});
				break;

			case 'PYQ_Mains':
				setChapter((prev) => ({ ...prev, PYQ_Mains: !prev.PYQ_Mains }));
				axios
					.request({
						...axiosChapterFormConfigHook,
						data: {
							_id: chapter._id,
							data: {
								PYQ_Mains: !chapter.PYQ_Mains,
							},
						},
					})
					.then(() => {
						toast.success(
							`Successfully updated ${chapter.name}'s ${tag} as ${!chapter[tag]}`,
						);
					})
					.catch((error) => {
						console.log({ error });
					});
				break;

			case 'PYQ_Advanced':
				setChapter((prev) => ({ ...prev, PYQ_Advanced: !prev.PYQ_Advanced }));
				axios
					.request({
						...axiosChapterFormConfigHook,
						data: {
							_id: chapter._id,
							data: {
								PYQ_Advanced: !chapter.PYQ_Advanced,
							},
						},
					})
					.then(() => {
						toast.success(
							`Successfully updated ${chapter.name}'s ${tag} as ${!chapter[tag]}`,
						);
					})
					.catch((error) => {
						console.log({ error });
					});
				break;

			case 'DPP1':
				setChapter((prev) => ({ ...prev, DPP1: !prev.DPP1 }));
				axios
					.request({
						...axiosChapterFormConfigHook,
						data: {
							_id: chapter._id,
							data: {
								DPP1: !chapter.DPP1,
							},
						},
					})
					.then(() => {
						toast.success(
							`Successfully updated ${chapter.name}'s ${tag} as ${!chapter[tag]}`,
						);
					})
					.catch((error) => {
						console.log({ error });
					});
				break;

			case 'mindMap':
				setChapter((prev) => ({ ...prev, mindMap: !prev.mindMap }));
				axios
					.request({
						...axiosChapterFormConfigHook,
						data: {
							_id: chapter._id,
							data: {
								mindMap: !chapter.mindMap,
							},
						},
					})
					.then(() => {
						toast.success(
							`Successfully updated ${chapter.name}'s ${tag} as ${!chapter[tag]}`,
						);
					})
					.catch((error) => {
						console.log({ error });
					});
				break;

			case 'Module':
				setChapter((prev) => ({ ...prev, Module: !prev.Module }));
				axios
					.request({
						...axiosChapterFormConfigHook,
						data: {
							_id: chapter._id,
							data: {
								Module: !chapter.Module,
							},
						},
					})
					.then(() => {
						toast.success(
							`Successfully updated ${chapter.name}'s ${tag} as ${!chapter[tag]}`,
						);
					})
					.catch((error) => {
						console.log({ error });
					});
				break;

			case 'DPP2':
				setChapter((prev) => ({ ...prev, DPP2: !prev.DPP2 }));
				axios
					.request({
						...axiosChapterFormConfigHook,
						data: {
							_id: chapter._id,
							data: {
								DPP2: !chapter.DPP2,
							},
						},
					})
					.then(() => {
						toast.success(
							`Successfully updated ${chapter.name}'s ${tag} as ${!chapter[tag]}`,
						);
					})
					.catch((error) => {
						console.log({ error });
					});
				break;

			case 'Book':
				setChapter((prev) => ({ ...prev, Book: !prev.Book }));
				axios
					.request({
						...axiosChapterFormConfigHook,
						data: {
							_id: chapter._id,
							data: {
								Book: !chapter.Book,
							},
						},
					})
					.then(() => {
						toast.success(
							`Successfully updated ${chapter.name}'s ${tag} as ${!chapter[tag]}`,
						);
					})
					.catch((error) => {
						console.log({ error });
					});
				break;
		}
	}
	function updateTopicTags(
		tag: 'done' | 'theory' | 'inTextQuestions' | 'inClassQuestions',
		topicId: string,
	) {
		const dataToUpdate: {
			done?: boolean;
			theory?: boolean;
			inTextQuestions?: boolean;
			inClassQuestions?: boolean;
		} = {};
		switch (tag) {
			case 'done':
				setChapter((prev) => {
					const newTopicsList = prev.topicsList.map((item) => {
						if (item._id == topicId) {
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
					return {
						...prev,
						topicsList: newTopicsList,
						totalTopicsCompleted: newTotalTopicsDone,
						totalTopicsCompletedPercentage:
							(newTotalTopicsDone * 100) / prev.totalTopics,
					};
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
				setChapter((prev) => {
					const newTopicsList = prev.topicsList.map((item) => {
						if (item._id == topicId) {
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
					return {
						...prev,
						topicsList: newTopicsList,
						totalTopicsCompleted: newTotalTopicsTheoryCompletedPercentage,
						totalTopicsTheoryCompletedPercentage:
							(newTotalTopicsTheoryCompletedPercentage * 100) /
							prev.totalTopics,
					};
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
				setChapter((prev) => ({
					...prev,
					topicsList: prev.topicsList.map((item) => {
						if (item._id == topicId) {
							dataToUpdate.inTextQuestions = !item.inTextQuestions;

							dataToUpdate.done = undefined;
							dataToUpdate.theory = undefined;
							dataToUpdate.inClassQuestions = undefined;

							return { ...item, inTextQuestions: !item.inTextQuestions };
						} else {
							return item;
						}
					}),
				}));
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
				setChapter((prev) => ({
					...prev,
					topicsList: prev.topicsList.map((item) => {
						if (item._id == topicId) {
							dataToUpdate.inClassQuestions = !item.inClassQuestions;

							dataToUpdate.done = undefined;
							dataToUpdate.theory = undefined;
							dataToUpdate.inTextQuestions = undefined;

							return { ...item, inClassQuestions: !item.inClassQuestions };
						} else {
							return item;
						}
					}),
				}));
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

	// ! HYDRATION FALLBACK
	// * Render a skeleton or empty wrapper before client hydration to ensure exact HTML matching
	if (!isMounted) {
		return (
			<Skeleton className='min-h-100 w-full animate-pulse rounded-[2rem] bg-accent/20 mx-auto max-w-5xl mt-8' />
		);
	}

	return (
		<Card className={cn('relative my-1', className)}>
			<CardHeader>
				<CardTitle className='flex items-center gap-3 '>
					<FcDataSheet />
					<Button variant={'ghost'} className='text-lg font-badge' asChild>
						<Link href={'/system/'}>{chapter.name}</Link>
					</Button>
				</CardTitle>
				<CardDescription>
					{(() => {
						const num = chapter.seqNumber;
						const j = num % 10;
						const k = num % 100;

						let suffix = 'th';
						if (j === 1 && k !== 11) {
							suffix = 'st';
						} else if (j === 2 && k !== 12) {
							suffix = 'nd';
						} else if (j === 3 && k !== 13) {
							suffix = 'rd';
						}

						return (
							<>
								This chapter is {num}
								<sup>{suffix}</sup> chapter of{' '}
								{chapter.subject.name.toUpperCase()}
							</>
						);
					})()}
				</CardDescription>
				<CardAction>
					<Button variant='ghost' size={'icon'}>
						<FcEditImage className='w-5 h-5' />
					</Button>
				</CardAction>
			</CardHeader>
			<CardContent className='grid grid-cols-12 gap-4'>
				{/* Tags  */}
				<div className='col-span-10 rounded-tl-xl p-3 grid grid-cols-10 gap-2 '>
					<div
						className={`flex items-center gap-4 col-span-2 border border-primary rounded-full pl-3 ${chapter.done ? 'bg-primary/90' : 'bg-primary/5'}`}>
						<Switch
							size='sm'
							onClick={() => {
								updateChapterTags('done');
							}}
							id={`${chapter._id}-done-checkbox`}
							checked={chapter.done}
						/>
						<Label
							htmlFor={`${chapter._id}-done-checkbox`}
							className='capitalize font-badge text-lg '>
							done
						</Label>
					</div>

					<div
						className={`flex items-center gap-4 col-span-2 border border-primary rounded-full pl-3 ${chapter.theory ? 'bg-chart-2/70' : 'bg-chart-2/5'}`}>
						<Switch
							size='sm'
							onClick={() => {
								updateChapterTags('theory');
							}}
							id={`${chapter._id}-theory-checkbox`}
							checked={chapter.theory}
						/>
						<Label
							htmlFor={`${chapter._id}-theory-checkbox`}
							className='capitalize font-badge text-lg'>
							theory- 01
						</Label>
					</div>

					<div
						className={`flex items-center gap-4 col-span-2 border border-primary rounded-full pl-3 ${chapter.shortNotes ? 'bg-chart-3/70' : 'bg-chart-3/5'}`}>
						<Switch
							size='sm'
							onClick={() => {
								updateChapterTags('shortNotes');
							}}
							id={`${chapter._id}-shortNotes-checkbox`}
							checked={chapter.shortNotes}
						/>
						<Label
							htmlFor={`${chapter._id}-shortNotes-checkbox`}
							className='capitalize font-badge text-lg'>
							shortNotes- 02
						</Label>
					</div>

					<div
						className={`flex items-center gap-4 col-span-2 border border-primary rounded-full pl-3 ${chapter.PYQ_Mains ? 'bg-progressive-1/70' : 'bg-progressive-1/5'}`}>
						<Switch
							size='sm'
							onClick={() => {
								updateChapterTags('PYQ_Mains');
							}}
							id={`${chapter._id}-PYQ_Mains-checkbox`}
							checked={chapter.PYQ_Mains}
						/>
						<Label
							htmlFor={`${chapter._id}-PYQ_Mains-checkbox`}
							className='capitalize font-badge text-lg'>
							PYQ_Mains- 03
						</Label>
					</div>

					<div
						className={`flex items-center gap-4 col-span-2 border border-primary rounded-full pl-3 ${chapter.PYQ_Advanced ? 'bg-informative-1/70' : 'bg-informative-1/5'}`}>
						<Switch
							size='sm'
							onClick={() => {
								updateChapterTags('PYQ_Advanced');
							}}
							id={`${chapter._id}-PYQ_Advanced-checkbox`}
							checked={chapter.PYQ_Advanced}
						/>
						<Label
							htmlFor={`${chapter._id}-PYQ_Advanced-checkbox`}
							className='capitalize font-badge text-lg'>
							PYQ_Advanced- 04
						</Label>
					</div>

					<div
						className={`flex items-center gap-4 col-span-2 border border-primary rounded-full pl-3 ${chapter.DPP1 ? 'bg-chart-4/70' : 'bg-chart-4/5'}`}>
						<Switch
							size='sm'
							onClick={() => {
								updateChapterTags('DPP1');
							}}
							id={`${chapter._id}-DPP1-checkbox`}
							checked={chapter.DPP1}
						/>
						<Label
							htmlFor={`${chapter._id}-DPP1-checkbox`}
							className='capitalize font-badge text-lg'>
							DPP1- 05
						</Label>
					</div>

					<div
						className={`flex items-center gap-4 col-span-2 border border-primary rounded-full pl-3 ${chapter.mindMap ? 'bg-chart-5/70' : 'bg-chart-5/5'}`}>
						<Switch
							size='sm'
							onClick={() => {
								updateChapterTags('mindMap');
							}}
							id={`${chapter._id}-mindMap-checkbox`}
							checked={chapter.mindMap}
						/>
						<Label
							htmlFor={`${chapter._id}-mindMap-checkbox`}
							className='capitalize font-badge text-lg'>
							mindMap- 06
						</Label>
					</div>

					<div
						className={`flex items-center gap-4 col-span-2 border border-primary rounded-full pl-3 ${chapter.Module ? 'bg-cautionary-1/70' : 'bg-cautionary-1/5'}`}>
						<Switch
							size='sm'
							onClick={() => {
								updateChapterTags('Module');
							}}
							id={`${chapter._id}-Module-checkbox`}
							checked={chapter.Module}
						/>
						<Label
							htmlFor={`${chapter._id}-Module-checkbox`}
							className='capitalize font-badge text-lg'>
							Module- 07
						</Label>
					</div>

					<div
						className={`flex items-center gap-4 col-span-2 border border-primary rounded-full pl-3 ${chapter.DPP2 ? 'bg-destructive/70' : 'bg-destructive/5'}`}>
						<Switch
							size='sm'
							onClick={() => {
								updateChapterTags('DPP2');
							}}
							id={`${chapter._id}-DPP2-checkbox`}
							checked={chapter.DPP2}
						/>
						<Label
							htmlFor={`${chapter._id}-DPP2-checkbox`}
							className='capitalize font-badge text-lg'>
							DPP2- 08
						</Label>
					</div>

					<div
						className={`flex items-center gap-4 col-span-2 border border-primary rounded-full pl-3 ${chapter.Book ? 'bg-destructive-1/70' : 'bg-destructive-1/5'}`}>
						<Switch
							size='sm'
							onClick={() => {
								updateChapterTags('Book');
							}}
							id={`${chapter._id}-Book-checkbox`}
							checked={chapter.Book}
						/>
						<Label
							htmlFor={`${chapter._id}-Book-checkbox`}
							className='capitalize font-badge text-lg'>
							Book- 09
						</Label>
					</div>

					<div className='w-full rounded-full border border-primary/30  px-10 py-6 space-y-4 col-span-5'>
						<div className='w-full'>
							<div className='flex justify-between items-end text-sm font-medium'>
								<span className='text-muted-foreground'>
									Total Topics Completed :{' '}
									<Badge>
										{chapter.totalTopicsCompleted}/{chapter.totalTopics}
									</Badge>
								</span>
								<span className='text-primary text-lg font-bold'>
									{chapter.totalTopicsTheoryCompletedPercentage.toFixed(3)}%
								</span>
							</div>
							<div className='relative overflow-hidden rounded-full bg-accent/50 p-1 shadow-inner'>
								<Progress
									value={chapter.totalTopicsTheoryCompletedPercentage}
									className='h-3 rounded-full bg-transparent [&>div]:bg-linear-to-r [&>div]:from-primary [&>div]:to-primary/80'
									aria-label='Countdown Progress'
								/>
							</div>
						</div>
					</div>
					<div className='w-full rounded-full border border-primary/30  px-10 py-6 space-y-4 col-span-5'>
						<div className='w-full'>
							<div className='flex justify-between items-end text-sm font-medium'>
								<span className='text-muted-foreground'>
									Total Topics Theory Completed{' '}
									<Badge>
										{chapter.totalTopicsTheoryCompleted}/{chapter.totalTopics}
									</Badge>
								</span>
								<span className='text-primary text-lg font-bold'>
									{chapter.totalTopicsCompletedPercentage.toFixed(3)}%
								</span>
							</div>
							<div className='relative overflow-hidden rounded-full bg-accent/50 p-1 shadow-inner'>
								<Progress
									value={chapter.totalTopicsCompletedPercentage}
									className='h-3 rounded-full bg-transparent [&>div]:bg-linear-to-r [&>div]:from-primary [&>div]:to-primary/80'
									aria-label='Countdown Progress'
								/>
							</div>
						</div>
					</div>
				</div>
				{/* Chart  */}
				<div className='col-span-2 rounded-tr-xl p-3 '>
					<ChartContainer config={chartConfig} className='aspect-square w-full'>
						<RadialBarChart
							data={[
								{
									Key: 'totalTopics',
									value: chapter.totalTopics,
									fill: 'var(--color-totalTopics)',
								},
								{
									Key: 'topicsCompleted',
									value: chapter.totalTopicsCompleted,
									fill: 'var(--color-topicsCompleted)',
								},
								{
									Key: 'topicsTheory',
									value: chapter.totalTopicsTheoryCompleted,
									fill: 'var(--color-topicsTheory)',
								},
							]}
							startAngle={-90}
							endAngle={360 - 90}
							innerRadius={30}
							outerRadius={110}>
							<ChartTooltip
								cursor={false}
								content={<ChartTooltipContent hideLabel nameKey='Key' />}
							/>
							<PolarGrid gridType='circle' />
							<RadialBar dataKey='value' background>
								<LabelList
									position='insideStart'
									dataKey='Key'
									className='fill-white capitalize mix-blend-luminosity'
									fontSize={11}
								/>
							</RadialBar>
						</RadialBarChart>
					</ChartContainer>
				</div>
				{/*chapter timeline and Add Todo  */}
				<div className='col-span-12 grid grid-cols-12'>
					<Breadcrumb className='col-span-6 col-start-2'>
						<BreadcrumbList>
							<BreadcrumbItem className='capitalize text-lg font-medium font-badges text-ring'>
								{chapter.currentChapterStatus === 'pending' ? (
									<BreadcrumbPage className='font-heading text-xl font-normal bg-muted/90 px-4 py-2 rounded-full '>
										Pending
									</BreadcrumbPage>
								) : (
									'pending'
								)}
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem className='capitalize text-lg font-medium font-badges text-informative-1'>
								{chapter.currentChapterStatus === 'upNext' ? (
									<BreadcrumbPage className='font-heading text-xl font-normal bg-informative-1/90 px-4 py-2 rounded-full '>
										up-Next
									</BreadcrumbPage>
								) : (
									'up-Next'
								)}
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem className='capitalize text-lg font-medium font-badges text-cautionary-1'>
								{chapter.currentChapterStatus === 'inProgress' ? (
									<BreadcrumbPage className='font-heading text-xl font-normal bg-cautionary-1/90 px-4 py-2 rounded-full '>
										in-Progress
									</BreadcrumbPage>
								) : (
									'in-Progress'
								)}
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem className='capitalize text-lg font-medium font-badges text-destructive-1'>
								{chapter.currentChapterStatus === 'unFinished' ? (
									<BreadcrumbPage className='font-heading text-xl font-normal bg-destructive-1/90 px-4 py-2 rounded-full '>
										unfinished
									</BreadcrumbPage>
								) : (
									'unfinished'
								)}
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem className='capitalize text-lg font-medium font-badges text-progressive-1'>
								{chapter.currentChapterStatus === 'done' ? (
									<BreadcrumbPage className='font-heading text-xl font-normal bg-progressive-1/90 px-4 py-2 rounded-full '>
										done
									</BreadcrumbPage>
								) : (
									'done'
								)}
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
					<Dialog>
						<Button asChild variant={'default'}>
							<DialogTrigger className='col-span-1 col-start-11'>
								Add Topic <IoMdAddCircle />{' '}
							</DialogTrigger>
						</Button>
						<DialogContent className='bg-transparent'>
							<DialogHeader>
								<DialogTitle>Add Topic</DialogTitle>
								<DialogDescription>
									Add Topics to {chapter.name}
								</DialogDescription>
							</DialogHeader>
							<AddTopicModalForm
								className='bg-primary/5'
								chapterId={chapter._id}
							/>
							<DialogFooter showCloseButton></DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
				{/* Topics  */}
				<div className='col-span-12 rounded-b-xl p-3'>
					<Table>
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
								<TableRow key={topic._id}>
									<TableCell>{topic.seqNumber}</TableCell>
									<TableCell>{topic.name}</TableCell>
									<TableCell>
										{' '}
										<Checkbox
											onClick={() => {
												updateTopicTags('theory', topic._id);
											}}
											checked={topic.theory}
										/>{' '}
									</TableCell>
									<TableCell>
										{' '}
										<Checkbox
											onClick={() => {
												updateTopicTags('inTextQuestions', topic._id);
											}}
											checked={topic.inTextQuestions}
										/>{' '}
									</TableCell>
									<TableCell>
										{' '}
										<Checkbox
											onClick={() => {
												updateTopicTags('inClassQuestions', topic._id);
											}}
											checked={topic.inClassQuestions}
										/>{' '}
									</TableCell>
									<TableCell>
										{' '}
										<Checkbox
											onClick={() => {
												updateTopicTags('done', topic._id);
											}}
											checked={topic.done}
										/>{' '}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
};

function AddTopicModalForm({
	className,
	chapterId,
}: {
	className?: string;
	chapterId: string;
}) {
	// * Memoized Axios Configuration - Performance optimization
	const AddTopicAxiosConfigHook = useMemo(
		() =>
			axiosConfig('syllabus/topic', 'post', {
				'Content-Type': 'application/json',
			}),
		[],
	);

	// * Enhanced Chapter Form with Improved Validation

	type topicCreateFormValidationSchemaType = z.infer<
		typeof TopicValidationSchema
	>;

	const topicCreateForm = useForm<topicCreateFormValidationSchemaType>({
		resolver: zodResolver(TopicValidationSchema),
		defaultValues: {
			name: '',
			seqNumber: '0',
			chapter: chapterId,
		},
		mode: 'onChange',
	});

	// * Enhanced Chapter Submit Handler with Improved Logic
	const handleTopicCreateSubmit = useCallback(
		async (values: topicCreateFormValidationSchemaType) => {
			try {
				const config = {
					...AddTopicAxiosConfigHook,
					data: { ...values },
				};
				const response = await axios.request(config);
				console.log(response.data);
				toast.success('Topic created successfully:');

				// * Smart form reset - keep all data except name and increment seqNumber
				const currentSeqNumber = Number(topicCreateForm.getValues('seqNumber'));
				topicCreateForm.setValue('name', '');
				topicCreateForm.setValue('seqNumber', String(currentSeqNumber + 1));
			} catch (error: any) {
				const ErrorMessage = error?.response?.data || 'Error';
				toast.error(ErrorMessage);
			}
		},
		[AddTopicAxiosConfigHook, topicCreateForm],
	);

	return (
		<Card className={cn(className)}>
			<CardContent>
				<form onSubmit={topicCreateForm.handleSubmit(handleTopicCreateSubmit)}>
					<CustomInputController
						label='Topic Name'
						type='text'
						control={topicCreateForm.control}
						name='name'
						description='Enter the Topic Name'
						htmlID='topicName'
						placeholder='E.g. Motion in 1D due to Gravity'
					/>
					<CustomInputController
						label='Sequence Number'
						type='number'
						control={topicCreateForm.control}
						name='seqNumber'
						description='Enter the Topic Sequence'
						htmlID='sequenceNumber'
						placeholder='0'
					/>
					<Button type='submit' className='w-full bg-primary/20'>
						Create Chapter
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}

const CustomInputController = ({
	className,
	containerClassName,
	descriptionClassName,
	labelClassName,
	control,
	name,
	label,
	description,
	htmlID,
	type = 'text',
	placeholder,
}: {
	className?: string;
	containerClassName?: string;
	descriptionClassName?: string;
	labelClassName?: string;
	control: any;
	name: string;
	label: string;
	description: string;
	htmlID: string;
	type: HTMLInputTypeAttribute;
	placeholder: string;
}) => {
	return (
		<Controller
			control={control}
			name={name}
			render={({ field }) => (
				<Field className='my-5 border border-primary/20 bg-primary/5 py-4 px-5 rounded-4xl'>
					<div className={cn('', containerClassName)}>
						<FieldLabel
							htmlFor={htmlID}
							className={cn(
								'text-base font-content-primary font-semibold text-primary',
								labelClassName,
							)}>
							{label}
						</FieldLabel>
						<Input
							id={htmlID}
							type={type}
							placeholder={placeholder}
							autoComplete='off'
							className={cn('font-content-secondary', className)}
							{...field}
						/>
					</div>
					<FieldDescription
						className={cn('text-sm text-foreground/40', descriptionClassName)}>
						{description}
					</FieldDescription>
					<FieldError />
				</Field>
			)}
		/>
	);
};
