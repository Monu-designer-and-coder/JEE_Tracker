/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Button } from '@/components/ui/button';
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
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
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
import { axiosConfig } from '@/config/axios.config';
import { cn } from '@/lib/utils';
import { TopicValidationSchema } from '@/schema/topic.schema';
import { getSubjectWiseChapterResponse } from '@/types/res/chapterResponse.types';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosResponse } from 'axios';
import { ChevronDownIcon, DotIcon } from 'lucide-react';
import Link from 'next/link';
import {
	HTMLInputTypeAttribute,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import z from 'zod';

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

	// * Memoized Axios Configuration - Performance optimization
	const axiosConfigHook = useMemo(
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
			chapter: '',
		},
		mode: 'onChange',
	});

	// * Enhanced Chapter Submit Handler with Improved Logic
	const handleTopicCreateSubmit = useCallback(
		async (values: topicCreateFormValidationSchemaType) => {
			try {
				const config = {
					...axiosConfigHook,
					data: { ...values },
				};
				const response = await axios.request(config);
				console.log('Topic created successfully:', response.data);

				// * Smart form reset - keep all data except name and increment seqNumber
				const currentSeqNumber = Number(topicCreateForm.getValues('seqNumber'));
				topicCreateForm.setValue('name', '');
				topicCreateForm.setValue('seqNumber', String(currentSeqNumber + 1));
			} catch (error: any) {
				const ErrorMessage = error?.response?.data || 'Error';
				toast.error(ErrorMessage);
			}
		},
		[axiosConfigHook, topicCreateForm],
	);

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
														<BreadcrumbPage>Add</BreadcrumbPage>
													</DropdownMenuItem>
													<DropdownMenuItem>
														<BreadcrumbLink className='w-full h-full' asChild>
															<Link href={'/syllabus/topics/edit'}>Edit</Link>
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
										<BreadcrumbPage>Add</BreadcrumbPage>
									</BreadcrumbItem>
								</BreadcrumbList>
							</Breadcrumb>
						</header>
						<section className='flex flex-1 h-full w-full'>
							<EnhancedCard className='w-full h-11/12'>
								<CardHeader>
									<CardTitle>Add Topic</CardTitle>
									<CardDescription>
										Add Topics to the respective Chapter
									</CardDescription>
									<CardContent>
										<form
											onSubmit={topicCreateForm.handleSubmit(
												handleTopicCreateSubmit,
											)}
											className='space-y-6'>
											<EnhancedInputField
												label='Topic Name'
												type='text'
												control={topicCreateForm.control}
												name='name'
												description='Enter the Topic Name'
												htmlID='topicName'
												placeholder='E.g. Motion in 1D due to Gravity'
											/>
											<EnhancedInputField
												label='Sequence Number'
												type='number'
												control={topicCreateForm.control}
												name='seqNumber'
												description='Enter the Topic Sequence'
												htmlID='sequenceNumber'
												placeholder='0'
											/>
											<Controller
												control={topicCreateForm.control}
												name='chapter'
												render={({ field }) => (
													<Field>
														<EnhancedInputContainer>
															<FieldLabel className='text-sm font-semibold text-primary'>
																Subject
															</FieldLabel>
															<Select
																onValueChange={field.onChange}
																defaultValue={field.value}>
																<SelectTrigger className='glass-select w-full px-6'>
																	<SelectValue placeholder='Select the subject for this chapter' />
																</SelectTrigger>
																<SelectContent className='glass-content'>
																	{chapterList.map((subject) => (
																		<div key={subject._id}>
																			<SelectGroup key={subject._id}>
																				<SelectLabel className='capitalize'>
																					{subject.name}
																				</SelectLabel>
																				{subject.chapterList.map((chapter) => (
																					<SelectItem
																						key={chapter._id}
																						value={chapter._id}
																						className='hover:bg-primary'>
																						{chapter.seqNumber +
																							'. ' +
																							chapter.name}
																					</SelectItem>
																				))}
																			</SelectGroup>
																			<SelectSeparator />
																		</div>
																	))}
																</SelectContent>
															</Select>
														</EnhancedInputContainer>
														<FieldDescription className='text-xs text-secondary-foreground'>
															Select the subject of the chapter.
														</FieldDescription>
														<FieldError />
													</Field>
												)}
											/>
											<Button
												type='submit'
												className='w-full bg-linear-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]'>
												Create Chapter
											</Button>
										</form>
									</CardContent>
								</CardHeader>
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
// * Enhanced Input Container Component with Glass Morphism
const EnhancedInputField = ({
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
				<Field>
					<EnhancedInputContainer className={cn('', containerClassName)}>
						<FieldLabel
							htmlFor={htmlID}
							className={cn(
								'text-sm font-semibold text-primary',
								labelClassName,
							)}>
							{label}
						</FieldLabel>
						<Input
							id={htmlID}
							type={type}
							placeholder={placeholder}
							autoComplete='off'
							className={cn('glass-input rounded-full py-1.5 px-6', className)}
							{...field}
						/>
					</EnhancedInputContainer>
					<FieldDescription
						className={cn(
							'text-xs text-secondary-foreground',
							descriptionClassName,
						)}>
						{description}
					</FieldDescription>
					<FieldError />
				</Field>
			)}
		/>
	);
};
