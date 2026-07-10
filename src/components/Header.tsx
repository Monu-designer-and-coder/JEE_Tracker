'use client';
import {
	Navbar,
	NavBody,
	NavItems,
	MobileNav,
	NavbarLogo,
	NavbarButton,
	MobileNavHeader,
	MobileNavToggle,
	MobileNavMenu,
} from '@/components/ui/resizable-navbar';
import Link from 'next/link';
import { useState } from 'react';
import { ModeToggle } from './darkModeToggler';
import { cn } from '@/lib/utils';

interface HeaderProps {
	className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
	const navItems = [
		{
			name: 'Home',
			link: '/',
		},
		{
			name: 'Tracker',
			link: '/tracker',
		},
		{
			name: 'Syllabus',
			link: '/syllabus',
		},
		{
			name: 'System',
			link: '/system',
		},
		{
			name: 'Pomodoro',
			link: '/pomodoro',
		},
	];

	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	return (
		<header className={cn('relative w-full', className)}>
			<Navbar>
				{/* Desktop Navigation */}
				<NavBody>
					<NavbarLogo />
					<NavItems items={navItems} />
					<div className='flex items-center gap-4'>
						<NavbarButton variant='secondary'>
							<ModeToggle />
						</NavbarButton>
					</div>
				</NavBody>

				{/* Mobile Navigation */}
				<MobileNav>
					<MobileNavHeader>
						<NavbarLogo />
						<MobileNavToggle
							isOpen={isMobileMenuOpen}
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						/>
						<NavbarButton variant='secondary' className='w-fit'>
							{/* Dark Mode Toggle Button */}
							<ModeToggle />
						</NavbarButton>
					</MobileNavHeader>

					<MobileNavMenu
						isOpen={isMobileMenuOpen}
						onClose={() => setIsMobileMenuOpen(false)}>
						{navItems.map((item, idx) => (
							<Link
								key={`mobile-link-${idx}`}
								href={item.link}
								onClick={() => setIsMobileMenuOpen(false)}
								className='relative text-neutral-600 dark:text-neutral-300 font-navigation'>
								<span className='block'>{item.name}</span>
							</Link>
						))}
					</MobileNavMenu>
				</MobileNav>
			</Navbar>
		</header>
	);
};

export default Header;
