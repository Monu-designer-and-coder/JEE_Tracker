/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
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
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Item,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from '@/components/ui/item';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { axiosConfig } from '@/config/axios.config';
import { cn } from '@/lib/utils';
import { getOrganizedTopicResponse } from '@/types/res/topicsOrganized.types';
import axios, { AxiosResponse } from 'axios';
import { ChevronDownIcon, DotIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function SyllabusHomePage() {
	// ! HYDRATION & STATE MANAGEMENT
	// * Use a single 'mounted' state to prevent React hydration mismatch errors on time-based UI
	const [isMounted, setIsMounted] = useState(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [topicList, setTopicList] = useState<getOrganizedTopicResponse[]>([
		{
			_id: 'loading',
			name: 'loading',
			chapterList: [
				{
					_id: '_id',
					seqNumber: 0,
					name: 'loading',
					topicsList: [],
				},
			],
		},
	]);

	// ! SIDE EFFECTS
	useEffect(() => {
		setIsMounted(true);
		setIsLoading(false);
		axios
			.request(axiosConfig('syllabus/topic', 'get'))
			.then((response: AxiosResponse<getOrganizedTopicResponse[]>) => {
				setTopicList(response.data);
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
		<main className='relative min-h-[80vh] w-full overflow-hidden bg-background px-4 py-8 md:px-8'>
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
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<button className='flex items-center gap-1'>
													Syllabus
													<ChevronDownIcon className='size-3.5' />
												</button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align='start'>
												<DropdownMenuGroup>
													<DropdownMenuItem>
														<BreadcrumbLink className='w-full h-full' asChild>
															<Link href={'/syllabus/'}>...</Link>
														</BreadcrumbLink>
													</DropdownMenuItem>
													<DropdownMenuItem>
														<BreadcrumbPage>Topic</BreadcrumbPage>
													</DropdownMenuItem>
													<DropdownMenuItem>
														<BreadcrumbLink className='w-full h-full' asChild>
															<Link href={'/syllabus/chapter'}>Chapter</Link>
														</BreadcrumbLink>
													</DropdownMenuItem>
												</DropdownMenuGroup>
											</DropdownMenuContent>
										</DropdownMenu>
									</BreadcrumbItem>
									<BreadcrumbSeparator>
										<DotIcon />
									</BreadcrumbSeparator>
									<BreadcrumbItem>
										<BreadcrumbPage>Topics</BreadcrumbPage>
									</BreadcrumbItem>
								</BreadcrumbList>
							</Breadcrumb>
						</header>
						<section className='flex flex-1 h-full'>
							<EnhancedCard className='w-full h-11/12'>
								<CardHeader>
									<CardTitle className='text-chart-5'>
										<h1 className='text-3xl font-black font-serif'>
											Topics List
										</h1>
									</CardTitle>
									<CardDescription>
										Get all the topics list subject wise and chapter wise.
									</CardDescription>
								</CardHeader>
								<CardContent className='glass-content p-4 m-1 mx-3 overflow-auto'>
									<Tabs
										orientation='horizontal'
										defaultValue='defaultTab'
										className='w-full my-4'>
										<TabsList variant='line'>
											<TabsTrigger value='defaultTab' disabled>
												Default
											</TabsTrigger>
											{topicList.map((subject) => (
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

										{topicList.map((subject) => (
											<TabsContent key={subject._id} value={subject.name}>
												<Badge variant={'outline'}>Topics:{[...subject.chapterList].map(chapter => chapter.topicsList).flat().filter(topic => topic.done).length}/{[...subject.chapterList].reduce((accumulator, currentChapterInReduce) => (accumulator + currentChapterInReduce.topicsList.length), 0)}</Badge>
												<Badge variant={"secondary"}>
													{(([...subject.chapterList].map(chapter => chapter.topicsList).flat().filter(topic => topic.done).length * 100 / [...subject.chapterList].reduce((accumulator, currentChapterInReduce) => (accumulator + currentChapterInReduce.topicsList.length), 0))).toFixed(2)}%
												</Badge>
												<Accordion
													type='single'
													collapsible
													defaultValue='shipping'
													className='w-full my-6 mx-2'>
													{subject.chapterList.map((chapter) => (
														<AccordionItem
															key={chapter._id}
															value={chapter._id}>
															<AccordionTrigger>
																{chapter.seqNumber}. {chapter.name}
																<Badge
																	variant={
																		chapter.topicsList.length === 0
																			? 'ghost'
																			: chapter.topicsList.filter(
																				(topic) => topic.done,
																			).length === chapter.topicsList.length
																				? 'default'
																				: 'destructive'
																	}>
																	{
																		chapter.topicsList.filter(
																			(topic) => topic.done,
																		).length
																	}
																	/{chapter.topicsList.length}
																</Badge>
															</AccordionTrigger>
															<AccordionContent className='grid grid-cols-2 gap-3 p-2 grid-flow-row my-4'>
																{chapter.topicsList.map((topic) => (
																	<Item
																		key={topic._id}
																		variant={'outline'}
																		size={'xs'}
																		className='h-fit'>
																		<ItemMedia>{topic.seqNumber}</ItemMedia>
																		<ItemTitle>{topic.name}</ItemTitle>
																		<ItemDescription className='text-blue-600 dark:text-sky-500'>
																			<span
																				className={cn(
																					topic.done
																						? 'text-green-600'
																						: 'text-red-600',
																					'underline',
																				)}>
																				Done
																			</span>
																			{' | '}
																			<span
																				className={cn(
																					topic.theory
																						? 'text-green-600'
																						: 'text-red-600',
																					'underline',
																				)}>
																				Theory
																			</span>
																			{' | '}
																			<span
																				className={cn(
																					topic.inTextQuestions
																						? 'text-green-600'
																						: 'text-red-600',
																					'underline',
																				)}>
																				In Text Question
																			</span>
																			{' | '}
																			<span
																				className={cn(
																					topic.inClassQuestions
																						? 'text-green-600'
																						: 'text-red-600',
																					'underline',
																				)}>
																				In Class Question
																			</span>
																			{' | '}
																		</ItemDescription>
																	</Item>
																))}
															</AccordionContent>
														</AccordionItem>
													))}
												</Accordion>
											</TabsContent>
										))}
									</Tabs>
								</CardContent>
								<CardFooter>End of list.</CardFooter>
							</EnhancedCard>
						</section>
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
