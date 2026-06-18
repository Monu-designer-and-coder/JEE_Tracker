'use client';

import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { useState } from 'react';
import { SiBookstack } from 'react-icons/si';
import { BookOpenText } from 'lucide-react';
import { Separator } from './ui/separator';
import { FcPlus, FcEditImage } from 'react-icons/fc';

export function SyllabusAppSidebar() {
	const [open, setOpen] = useState(false);
	return (
		<Sidebar open={open} setOpen={setOpen}>
			<SidebarBody className='w-full h-full p-4 flex flex-col justify-center items-start '>
				<SidebarLink
					link={{
						label: 'Syllabus',
						href: '/syllabus/',
						icon: (
							<SiBookstack className='h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200' />
						),
					}}
				/>
				<Separator />
				<SidebarLink
					link={{
						label: 'Chapter',
						href: '/syllabus/chapter',
						icon: (
							<BookOpenText className='h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200' />
						),
					}}
					className='mx-0.5'
				/>
				<SidebarLink
					link={{
						label: 'Add Chapters',
						href: '/syllabus/chapter/add',
						icon: (
							<FcPlus className='h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200' />
						),
					}}
					className='mx-1.5'
				/>
				<SidebarLink
					link={{
						label: 'Update Chapter',
						href: '/syllabus/chapter/edit',
						icon: (
							<FcEditImage className='h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200' />
						),
					}}
					className='mx-1.5'
				/>
			</SidebarBody>
		</Sidebar>
	);
}
