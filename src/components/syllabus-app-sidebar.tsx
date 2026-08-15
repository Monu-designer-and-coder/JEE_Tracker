'use client';

import Link from 'next/link';
import { Button } from './ui/button';

export function SyllabusNavigator() {
	return (
		<nav className='w-full relative'>
			<ul className='flex w-[90%] mx-auto py-2 mb-2 gap-4 items-center'>
				<li className='pointer hover:pointer'>
					<Link href='/syllabus' className='hover:pointer pointer'>
						{' '}
						<Button variant={'link'} className='hover:pointer pointer'>
							Syllabus
						</Button>
					</Link>
				</li>
				<li className='pointer hover:pointer'>
					<Link href='/syllabus/chapter' className='hover:pointer pointer'>
						{' '}
						<Button variant={'link'} className='hover:pointer pointer'>
							Chapters
						</Button>
					</Link>
				</li>
			</ul>
		</nav>
	);
}
