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
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { axiosConfig } from '@/config/axios.config';
import { cn } from '@/lib/utils';
import { chapterValidationSchema } from '@/schema/chapter.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { ChevronDownIcon, DotIcon } from 'lucide-react';
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

	// ! SIDE EFFECTS
	useEffect(() => {
		setIsMounted(true);
		setIsLoading(false);
	}, []);

	// * Memoized Axios Configuration - Performance optimization
	const axiosConfigHook = useMemo(
		() =>
			axiosConfig('syllabus/chapter', 'post', {
				'Content-Type': 'application/json',
			}),
		[],
	);

	// * Enhanced Chapter Form with Improved Validation

	type chapterCreateFormValidationSchemaType = z.infer<
		typeof chapterValidationSchema
	>;

	const chapterCreateForm = useForm<chapterCreateFormValidationSchemaType>({
		resolver: zodResolver(chapterValidationSchema),
		defaultValues: {
			name: '',
			subject: '',
			seqNumber: '0',
		},
		mode: 'onChange',
	});

	// * Enhanced Chapter Submit Handler with Improved Logic
	const handleChapterCreateSubmit = useCallback(
		async (values: chapterCreateFormValidationSchemaType) => {
			try {
				const config = {
					...axiosConfigHook,
					data: { ...values },
				};

				const response = await axios.request(config);
				console.log('Chapter created successfully:', response.data);

				// * Smart form reset - keep all data except name and increment seqNumber
				const currentSeqNumber = Number(
					chapterCreateForm.getValues('seqNumber'),
				);
				chapterCreateForm.setValue('name', '');
				chapterCreateForm.setValue('seqNumber', String(currentSeqNumber + 1));
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} catch (error: any) {
				const ErrorMessage = error?.response?.data || 'Error';
				toast.error(ErrorMessage);
			}
		},
		[axiosConfigHook, chapterCreateForm],
	);

	const subjectList = [
		{
			_id: '6a25121bf37357e395a82f16',
			name: 'Chemistry',
		},
		{
			_id: '6a251223f37357e395a82f17',
			name: 'Mathematics',
		},
		{
			_id: '6a251189f37357e395a82f13',
			name: 'Physics',
		},
	];

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
												Chapter
												<ChevronDownIcon className='size-3.5' />
											</button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align='start'>
											<DropdownMenuGroup>
												<DropdownMenuItem>
													<BreadcrumbLink className='w-full h-full' asChild>
														<Link href={'/syllabus/chapter'}>...</Link>
													</BreadcrumbLink>
												</DropdownMenuItem>
												<DropdownMenuItem>
													<BreadcrumbPage>Add</BreadcrumbPage>
												</DropdownMenuItem>
												<DropdownMenuItem>Edit</DropdownMenuItem>
												<DropdownMenuItem>Delete</DropdownMenuItem>
											</DropdownMenuGroup>
										</DropdownMenuContent>
									</DropdownMenu>
									<BreadcrumbSeparator>
										<DotIcon />
									</BreadcrumbSeparator>
									<BreadcrumbItem>
										<BreadcrumbPage>Add</BreadcrumbPage>
									</BreadcrumbItem>
								</BreadcrumbList>
							</Breadcrumb>
						</header>
						<section className='flex flex-1 h-9/10'>
							<EnhancedCard className='w-full h-full'>
								<CardHeader className='text-center pb-6'>
									<CardTitle className='text-2xl font-bold bg-linear-to-r from-chart-1 to-primary bg-clip-text text-transparent'>
										Add New Chapter
									</CardTitle>
									<CardDescription className='text-secondary-foreground'>
										Create a new chapter within a subject
									</CardDescription>
								</CardHeader>
								<CardContent>
									<form
										onSubmit={chapterCreateForm.handleSubmit(
											handleChapterCreateSubmit,
										)}
										className='space-y-6'>
										{/* Chapter Name Field */}
										<Controller
											control={chapterCreateForm.control}
											name='name'
											render={({ field }) => (
												<Field>
													<EnhancedInputContainer>
														<FieldLabel className='text-sm font-semibold text-primary'>
															Chapter Name
														</FieldLabel>
														<Input
															placeholder='Enter chapter name'
															className='glass-input'
															{...field}
														/>
													</EnhancedInputContainer>
													<FieldDescription className='text-xs text-secondary-foreground'>
														Provide a descriptive name for the chapter.
													</FieldDescription>
													<FieldError />
												</Field>
											)}
										/>
										<Controller
											control={chapterCreateForm.control}
											name='seqNumber'
											render={({ field }) => (
												<Field>
													<EnhancedInputContainer>
														<FieldLabel className='text-sm font-semibold text-primary'>
															Sequence No.
														</FieldLabel>
														<Input
															type='number'
															placeholder='Enter sequence number'
															className='glass-input'
															{...field}
														/>
													</EnhancedInputContainer>
													<FieldDescription className='text-xs text-secondary-foreground'>
														Provide the sequence of chapter.
													</FieldDescription>
													<FieldError />
												</Field>
											)}
										/>
										<Controller
											control={chapterCreateForm.control}
											name='subject'
											render={({ field }) => (
												<Field>
													<EnhancedInputContainer>
														<FieldLabel className='text-sm font-semibold text-primary'>
															Subject
														</FieldLabel>
														<Select
															onValueChange={field.onChange}
															defaultValue={field.value}>
															<SelectTrigger className='glass-select w-full'>
																<SelectValue placeholder='Select the subject for this chapter' />
															</SelectTrigger>
															<SelectContent className='glass-content'>
																{subjectList.map((subject) => (
																	<SelectItem
																		key={subject._id}
																		value={subject._id}
																		className='hover:bg-primary'>
																		{subject.name}
																	</SelectItem>
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
											className='w-full bg-linear-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]'>
											Create Chapter
										</Button>
									</form>
								</CardContent>
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
				'rounded-4xl overflow-hidden',
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
