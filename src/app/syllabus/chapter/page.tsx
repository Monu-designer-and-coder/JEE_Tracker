/* eslint-disable react-hooks/set-state-in-effect */
'use client';

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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { axiosConfig } from '@/config/axios.config';
import { cn } from '@/lib/utils';
import { getSubjectWiseChapterResponse } from '@/types/res/chapterResponse.types';
import axios, { AxiosResponse } from 'axios';
import { ChevronDownIcon, DotIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function SyllabusHomePage() {
	// ! HYDRATION & STATE MANAGEMENT
	// * Use a single 'mounted' state to prevent React hydration mismatch errors on time-based UI
	const [isMounted, setIsMounted] = useState(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);
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
														<BreadcrumbPage>Chapter</BreadcrumbPage>
													</DropdownMenuItem>
													<DropdownMenuItem>
														<BreadcrumbLink className='w-full h-full' asChild>
															<Link href={'/syllabus/topics'}>Topics</Link>
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
										<BreadcrumbPage>Chapter</BreadcrumbPage>
									</BreadcrumbItem>
								</BreadcrumbList>
							</Breadcrumb>
						</header>
						<section className='flex flex-1 h-full'>
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
								{chapterList.map((subject) => (
									<TabsContent key={subject._id} value={subject.name}>
										<EnhancedCard className='w-full'>
											<CardHeader>
												<CardTitle className='text-2xl font-bold bg-linear-to-r from-chart-1 to-primary bg-clip-text text-transparent capitalize'>
													{subject.name}
												</CardTitle>
												<CardDescription className='text-secondary-foreground'>
													List of all the chapters of the subject {subject.name}
												</CardDescription>
											</CardHeader>
											<CardContent>
												<Table className=''>
													<TableCaption>A list of your chapters.</TableCaption>
													<TableHeader>
														<TableRow>
															<TableHead className='capitalize text-xs'>
																S.No:
															</TableHead>
															<TableHead className='capitalize text-xs'>
																Chapter Name
															</TableHead>
															<TableHead className='capitalize text-xs'>
																done
															</TableHead>
															<TableHead className='capitalize text-xs'>
																theory
															</TableHead>
															<TableHead className='capitalize text-xs'>
																shortNotes
															</TableHead>
															<TableHead className='capitalize text-xs'>
																mindMap
															</TableHead>
															<TableHead className='capitalize text-xs'>
																DPP1
															</TableHead>
															<TableHead className='capitalize text-xs'>
																DPP2
															</TableHead>
															<TableHead className='capitalize text-xs'>
																Module
															</TableHead>
															<TableHead className='capitalize text-xs'>
																PYQ_Mains
															</TableHead>
															<TableHead className='capitalize text-xs'>
																PYQ_Advanced
															</TableHead>
															<TableHead className='capitalize text-xs'>
																Book
															</TableHead>
														</TableRow>
													</TableHeader>
													<TableBody>
														{subject.chapterList.map((chapter) => (
															<TableRow
																key={chapter.seqNumber + '-' + chapter.name}>
																<TableCell>{chapter.seqNumber}</TableCell>
																<TableCell className='text-xs'>
																	{chapter.name}
																</TableCell>
																<TableCell
																	className={cn(
																		'border',
																		chapter.done
																			? 'bg-green-600'
																			: 'bg-red-600',
																	)}></TableCell>
																<TableCell
																	className={cn(
																		'border',
																		chapter.theory
																			? 'bg-green-600'
																			: 'bg-red-600',
																	)}></TableCell>
																<TableCell
																	className={cn(
																		'border',
																		chapter.shortNotes
																			? 'bg-green-600'
																			: 'bg-red-600',
																	)}></TableCell>
																<TableCell
																	className={cn(
																		'border',
																		chapter.mindMap
																			? 'bg-green-600'
																			: 'bg-red-600',
																	)}></TableCell>
																<TableCell
																	className={cn(
																		'border',
																		chapter.DPP1
																			? 'bg-green-600'
																			: 'bg-red-600',
																	)}></TableCell>
																<TableCell
																	className={cn(
																		'border',
																		chapter.DPP2
																			? 'bg-green-600'
																			: 'bg-red-600',
																	)}></TableCell>
																<TableCell
																	className={cn(
																		'border',
																		chapter.Module
																			? 'bg-green-600'
																			: 'bg-red-600',
																	)}></TableCell>
																<TableCell
																	className={cn(
																		'border',
																		chapter.PYQ_Mains
																			? 'bg-green-600'
																			: 'bg-red-600',
																	)}></TableCell>
																<TableCell
																	className={cn(
																		'border',
																		chapter.PYQ_Advanced
																			? 'bg-green-600'
																			: 'bg-red-600',
																	)}></TableCell>
																<TableCell
																	className={cn(
																		'border',
																		chapter.Book
																			? 'bg-green-600'
																			: 'bg-red-600',
																	)}></TableCell>
															</TableRow>
														))}
													</TableBody>
												</Table>
											</CardContent>
										</EnhancedCard>
									</TabsContent>
								))}
							</Tabs>
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
