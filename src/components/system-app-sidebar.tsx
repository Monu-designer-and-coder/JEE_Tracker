'use client';

import Link from 'next/link';
import { Button } from './ui/button';

export function SystemNavigator() {
	return (
		<nav className='w-full relative'>
			<ul className='flex w-[90%] mx-auto py-2 mb-2 gap-4 items-center'>
				<li className='pointer hover:pointer'>
					<Link href='/system/' className='hover:pointer pointer'>
						{' '}
						<Button variant={'link'} className='hover:pointer pointer'>
							{' '}
							System
						</Button>
					</Link>
				</li>
				<li className='pointer hover:pointer'>
					<Link href='/system/study' className='hover:pointer pointer'>
						{' '}
						<Button variant={'link'} className='hover:pointer pointer'>
							Study System
						</Button>
					</Link>
				</li>
			</ul>
		</nav>
	);
}
