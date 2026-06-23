/* eslint-disable @typescript-eslint/no-explicit-any */
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
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Item } from '@/components/ui/item';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { axiosConfig } from '@/config/axios.config';
import { cn } from '@/lib/utils';
import { TopicValidationPUTSchema } from '@/schema/topic.schema';
import { getSubjectWiseChapterResponse } from '@/types/res/chapterResponse.types';
import {
	getOrganizedChapterResponse,
	getTopicResponse,
} from '@/types/res/topicsOrganized.types';
import axios, { AxiosResponse } from 'axios';
import { ChevronDownIcon, DotIcon } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import z from 'zod';

export default function SyllabusHomePage() {
	// ! HYDRATION & STATE MANAGEMENT
	// * Use a single 'mounted' state to prevent React hydration mismatch errors on time-based UI
	const [isMounted, setIsMounted] = useState(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [currentSelectedChaptersTopic, setCurrentSelectedChaptersTopic] =
		useState<getTopicResponse[]>([
			{
				_id: '',
				name: '',
				seqNumber: 0,
				done: false,
				theory: false,
				inTextQuestions: false,
				inClassQuestions: false,
			},
		]);
	const [chapterList, setChapterList] = useState<
		getSubjectWiseChapterResponse[]
	>([
		{
			_id: 'loading',
			name: 'loading',
			chapterList: [
				{
					_id: '_id',
					seqNumber: 0,
					name: 'loading',
					done: false,
					theory: false,
					shortNotes: false,
					mindMap: false,
					DPP1: false,
					DPP2: false,
					Module: false,
					PYQ_Mains: false,
					PYQ_Advanced: false,
					Book: false,
				},
			],
		},
	]);

	// ! SIDE EFFECTS
	useEffect(() => {
		setIsMounted(true);
		setIsLoading(false);
		axios
			.request(axiosConfig('syllabus/chapter?type=subjectWise', 'get'))
			.then((response: AxiosResponse<getSubjectWiseChapterResponse[]>) => {
				setChapterList(response.data);
			});
	}, []);

	// * Memoized Axios Configuration - Performance optimization
	const axiosConfigHook = useMemo(
		() =>
			axiosConfig('syllabus/topic', 'put', {
				'Content-Type': 'application/json',
			}),
		[],
	);

	type topicCreateFormValidationPUTSchemaType = z.infer<
		typeof TopicValidationPUTSchema
	>;

	const handleChapterSelect = (input: { e: string; subjectIndex: number }) => {
		const chapterIndex = Number(input.e.split(',')[1]) || 0;
		const chapterSelected =
			chapterList[input.subjectIndex].chapterList[chapterIndex];
		axios
			.request(
				axiosConfig(
					`syllabus/topic?id=${chapterSelected._id}&type=byChapter`,
					'get',
				),
			)
			.then((response: AxiosResponse<getOrganizedChapterResponse>) => {
				console.log(response.data);
				setCurrentSelectedChaptersTopic(response.data.topicsList);
			});
		toast.info(
			chapterList[input.subjectIndex].chapterList[chapterIndex].seqNumber +
				'.' +
				chapterList[input.subjectIndex].chapterList[chapterIndex].name,
		);
	};

	// * Enhanced Chapter Submit Handler with Improved Logic
	const handleTopicEditSubmit = useCallback(
		async (values: topicCreateFormValidationPUTSchemaType) => {
			try {
				const result: topicCreateFormValidationPUTSchemaType = {
					_id: values._id,
					data: {},
				};

				if (values.data.done !== undefined) {
					result.data.done = values.data.done;
				}
				if (values.data.theory !== undefined) {
					result.data.theory = values.data.theory;
				}
				if (values.data.inTextQuestions !== undefined) {
					result.data.inTextQuestions = values.data.inTextQuestions;
				}
				if (values.data.inClassQuestions !== undefined) {
					result.data.inClassQuestions = values.data.inClassQuestions;
				}

				const config = {
					...axiosConfigHook,
					data: { ...result },
				};

				const resultData: {
					done?: boolean;
					theory?: boolean;
					inTextQuestions?: boolean;
					inClassQuestions?: boolean;
				} = result.data;

				const response = await axios.request(config);
				console.log('Topic updated successfully:', response.data);
				console.log(config);
				setCurrentSelectedChaptersTopic((prev) =>
					prev.map((item) =>
						item._id === result._id
							? {
									...item,
									...resultData,
								}
							: item,
					),
				);
				toast.success(`'Updated Topic Successfully'`);
			} catch (error: any) {
				const ErrorMessage = error?.response?.data.message || 'Error';
				toast.error(ErrorMessage);
			}
		},
		[axiosConfigHook],
	);

	// ! HYDRATION FALLBACK
	// * Render a skeleton or empty wrapper before client hydration to ensure exact HTML matching
	if (!isMounted) {
		return (
			<div className='min-h-100 w-full animate-pulse rounded-[2rem] bg-accent/20 mx-auto max-w-5xl mt-8' />
		);
	}

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
					<div className='flex h-64 items-center justify-center'>
						<div className='h-8 w-8 animate-spin rounded-full border-b-2 border-primary' />
					</div>
				) : (
					<section className='w-full h-full'>
						<header className='flex justify-between w-full px-4 py-2'>
							<Breadcrumb className='w-full'>
								<BreadcrumbList>
									<BreadcrumbItem>
										<BreadcrumbLink asChild>
											<Link href={'/'}>Home</Link>
										</BreadcrumbLink>
									</BreadcrumbItem>
									<BreadcrumbSeparator>
										<DotIcon />
									</BreadcrumbSeparator>
									<BreadcrumbItem>
										<BreadcrumbLink asChild>
											<Link href={'/syllabus'}>Syllabus</Link>
										</BreadcrumbLink>
									</BreadcrumbItem>
									<BreadcrumbSeparator>
										<DotIcon />
									</BreadcrumbSeparator>

									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<button className='flex items-center gap-1'>
												Topic
												<ChevronDownIcon className='size-3.5' />
											</button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align='start'>
											<DropdownMenuGroup>
												<DropdownMenuItem>
													<BreadcrumbLink className='w-full h-full' asChild>
														<Link href={'/syllabus/topics'}>...</Link>
													</BreadcrumbLink>
												</DropdownMenuItem>
												<DropdownMenuItem>
													<BreadcrumbPage>Edit</BreadcrumbPage>
												</DropdownMenuItem>
												<DropdownMenuItem>
													<BreadcrumbLink className='w-full h-full' asChild>
														<Link href={'/syllabus/topics/add'}>Add</Link>
													</BreadcrumbLink>
												</DropdownMenuItem>
											</DropdownMenuGroup>
										</DropdownMenuContent>
									</DropdownMenu>
									<BreadcrumbSeparator>
										<DotIcon />
									</BreadcrumbSeparator>
									<BreadcrumbItem>
										<BreadcrumbPage>Edit</BreadcrumbPage>
									</BreadcrumbItem>
								</BreadcrumbList>
							</Breadcrumb>
						</header>
						<section className='flex flex-1'>
							<EnhancedCard className='w-full h-full'>
								<CardHeader className='text-center pb-6'>
									<CardTitle className='text-2xl font-bold bg-linear-to-r from-chart-1 to-primary bg-clip-text text-transparent'>
										Edit Topic
									</CardTitle>
									<CardDescription className='text-secondary-foreground'>
										Update the Topic
									</CardDescription>
								</CardHeader>
								<CardContent>
									<Tabs
										orientation='horizontal'
										defaultValue='defaultTab'
										className='w-full my-4'>
										<TabsList variant='line'>
											<TabsTrigger value='defaultTab' disabled>
												Default
											</TabsTrigger>
											{chapterList.map((subject) => (
												<TabsTrigger
													className='capitalize'
													key={subject._id}
													value={subject.name}>
													{subject.name}
												</TabsTrigger>
											))}
										</TabsList>
										<TabsContent value={'defaultTab'}>
											<EnhancedCard>
												<CardHeader>
													<CardTitle className='text-2xl font-bold bg-linear-to-r from-chart-1 to-primary bg-clip-text text-transparent capitalize'>
														Select Some Subject
													</CardTitle>
													<CardDescription className='text-secondary-foreground'>
														-------------------------------------------
													</CardDescription>
												</CardHeader>
											</EnhancedCard>
										</TabsContent>
										{chapterList.map((subject, subjectIndex) => (
											<TabsContent key={subject._id} value={subject.name}>
												<EnhancedCard className='w-full'>
													<CardHeader>
														<CardTitle className='text-2xl font-bold bg-linear-to-r from-chart-1 to-primary bg-clip-text text-transparent capitalize'>
															{subject.name}
														</CardTitle>
														<CardDescription className='text-secondary-foreground'>
															List of all the chapters of the subject{' '}
															{subject.name}
														</CardDescription>
													</CardHeader>
													<CardContent>
														<Field>
															<EnhancedInputContainer>
																<FieldLabel className='text-sm font-semibold text-primary'>
																	Chapter
																</FieldLabel>
																<Select
																	onValueChange={(e) => {
																		handleChapterSelect({
																			e,
																			subjectIndex,
																		});
																	}}
																	defaultValue={''}>
																	<SelectTrigger className='glass-select w-full'>
																		<SelectValue placeholder='Select the subject for this chapter' />
																	</SelectTrigger>
																	<SelectContent className='glass-content'>
																		{subject.chapterList.map(
																			(chapter, chapterIndex) => (
																				<SelectItem
																					key={
																						chapter.seqNumber +
																						'-' +
																						chapter.name
																					}
																					value={
																						chapter._id + ',' + chapterIndex
																					}
																					className='hover:bg-primary'>
																					{chapter.name}
																				</SelectItem>
																			),
																		)}
																	</SelectContent>
																</Select>
															</EnhancedInputContainer>
															<FieldDescription className='text-xs text-secondary-foreground'>
																Select the chapter.
															</FieldDescription>
														</Field>
														{currentSelectedChaptersTopic.length === 0 ||
														currentSelectedChaptersTopic[0]._id.length === 0 ? (
															<Badge variant={'destructive'} className='my-5'>
																No Topic for the Chapter || No Chapter Selected
															</Badge>
														) : (
															<div className='grid grid-cols-2 gap-2 grid-flow-row my-4'>
																{currentSelectedChaptersTopic.map((topic) => (
																	<Item
																		key={topic._id}
																		variant={'outline'}
																		size={'xs'}
																		className='row-span-1 '
																		asChild>
																		<div className='flex flex-col items-start justify-center'>
																			<h3 className='capitalize text-base/8'>
																				{topic.seqNumber}. {topic.name}
																			</h3>
																			<div className='grid grid-cols-2 grid-rows-2 gap-2 w-full'>
																				<Field className='space-y-2'>
																					<div className='flex items-center space-x-3 p-3 rounded-xl bg-white/20 dark:bg-black/20 border border-white/20 hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-300 group'>
																						<Checkbox
																							id={`${topic._id}-done`}
																							checked={topic.done}
																							onCheckedChange={(e) => {
																								handleTopicEditSubmit({
																									_id: topic._id,
																									data: {
																										done: Boolean(e),
																									},
																								});
																							}}
																							className='enhanced-checkbox data-[state=checked]:bg-primary data-[state=checked]:border-primary border-2 border-slate-300 dark:border-slate-600'
																						/>
																						<FieldLabel
																							className='text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer group-hover:text-primary dark:group-hover:text-chart-1 transition-colors duration-300 capitalize'
																							htmlFor={`${topic._id}-done`}>
																							Done
																						</FieldLabel>
																					</div>
																				</Field>
																				<Field className='space-y-2'>
																					<div className='flex items-center space-x-3 p-3 rounded-xl bg-white/20 dark:bg-black/20 border border-white/20 hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-300 group'>
																						<Checkbox
																							id={`${topic._id}-theory`}
																							checked={topic.theory}
																							onCheckedChange={(e) => {
																								handleTopicEditSubmit({
																									_id: topic._id,
																									data: {
																										theory: Boolean(e),
																									},
																								});
																							}}
																							className='enhanced-checkbox data-[state=checked]:bg-primary data-[state=checked]:border-primary border-2 border-slate-300 dark:border-slate-600'
																						/>
																						<FieldLabel
																							className='text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer group-hover:text-primary dark:group-hover:text-chart-1 transition-colors duration-300 capitalize'
																							htmlFor={`${topic._id}-theory`}>
																							theory
																						</FieldLabel>
																					</div>
																				</Field>
																				<Field className='space-y-2'>
																					<div className='flex items-center space-x-3 p-3 rounded-xl bg-white/20 dark:bg-black/20 border border-white/20 hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-300 group'>
																						<Checkbox
																							id={`${topic._id}-in-text-question`}
																							checked={topic.inTextQuestions}
																							onCheckedChange={(e) => {
																								handleTopicEditSubmit({
																									_id: topic._id,
																									data: {
																										inTextQuestions: Boolean(e),
																									},
																								});
																							}}
																							className='enhanced-checkbox data-[state=checked]:bg-primary data-[state=checked]:border-primary border-2 border-slate-300 dark:border-slate-600'
																						/>
																						<FieldLabel
																							className='text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer group-hover:text-primary dark:group-hover:text-chart-1 transition-colors duration-300 capitalize'
																							htmlFor={`${topic._id}-in-text-question`}>
																							in-text-question
																						</FieldLabel>
																					</div>
																				</Field>
																				<Field className='space-y-2'>
																					<div className='flex items-center space-x-3 p-3 rounded-xl bg-white/20 dark:bg-black/20 border border-white/20 hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-300 group'>
																						<Checkbox
																							id={`${topic._id}-in-class-questions`}
																							checked={topic.inClassQuestions}
																							onCheckedChange={(e) => {
																								handleTopicEditSubmit({
																									_id: topic._id,
																									data: {
																										inClassQuestions:
																											Boolean(e),
																									},
																								});
																							}}
																							className='enhanced-checkbox data-[state=checked]:bg-primary data-[state=checked]:border-primary border-2 border-slate-300 dark:border-slate-600'
																						/>
																						<FieldLabel
																							className='text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer group-hover:text-primary dark:group-hover:text-chart-1 transition-colors duration-300 capitalize'
																							htmlFor={`${topic._id}-in-class-questions`}>
																							in-class-questions
																						</FieldLabel>
																					</div>
																				</Field>
																			</div>
																		</div>
																	</Item>
																))}
															</div>
														)}
													</CardContent>
												</EnhancedCard>
											</TabsContent>
										))}
									</Tabs>
								</CardContent>
							</EnhancedCard>
						</section>
					</section>
				)}
			</section>
		</main>
	);
}

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
				'shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/20',
				'rounded-2xl overflow-hidden',
				'transition-all duration-500 hover:shadow-3xl hover:shadow-blue-500/20',
				'hover:bg-white/50 dark:hover:bg-black/30',
				className,
			)}>
			{children}
		</Card>
	);
};
