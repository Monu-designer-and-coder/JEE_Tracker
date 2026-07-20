'use client';

import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { useState } from 'react';
import { SiBookstack } from 'react-icons/si';
import { BookOpenText, Sheet } from 'lucide-react';
import { Separator } from './ui/separator';
import { FcPlus, FcEditImage } from 'react-icons/fc';
import Link from 'next/link';
import { Button } from './ui/button';

export function SyllabusSidebar() {
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
				<Separator />
				<SidebarLink
					link={{
						label: 'Topics',
						href: '/syllabus/topics',
						icon: (
							<Sheet className='h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200' />
						),
					}}
					className='mx-0.5'
				/>
				<SidebarLink
					link={{
						label: 'Add  Topic',
						href: '/syllabus/topics/add',
						icon: (
							<FcPlus className='h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200' />
						),
					}}
					className='mx-1.5'
				/>
				<SidebarLink
					link={{
						label: 'Update Topic',
						href: '/syllabus/topics/edit',
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
export function SyllabusNavigator() {
	return (
		<nav className='w-full relative'>
			<ul className='flex w-[90%] mx-auto py-2 mb-2 gap-4 items-center'>
				<li className='pointer hover:pointer'><Link href="/syllabus" className='hover:pointer pointer'> <Button variant={"link"} className='hover:pointer pointer'>Syllabus</Button></Link></li>
				<li className='pointer hover:pointer'><Link href="/syllabus/chapter" className='hover:pointer pointer'> <Button variant={"link"} className='hover:pointer pointer'>Chapters</Button></Link></li>
				<li className='pointer hover:pointer'><Link href="/syllabus/topics/add" className='hover:pointer pointer'> <Button variant={"link"} className='hover:pointer pointer'>Add Topics</Button></Link></li>
			</ul>
		</nav>
	);
}
