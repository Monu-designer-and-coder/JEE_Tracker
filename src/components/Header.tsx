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
			link: '#features',
		},
		{
			name: 'Tracker',
			link: '#features',
		},
		{
			name: 'Study',
			link: '#features',
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
						<NavbarButton variant='secondary'>Login</NavbarButton>
						<NavbarButton variant='primary'>Button</NavbarButton>
						<NavbarButton variant='gradient'>
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
						<NavbarButton variant='gradient' className='w-fit'>
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
								className='relative text-neutral-600 dark:text-neutral-300'>
								<span className='block'>{item.name}</span>
							</Link>
						))}
						<div className='flex w-full flex-col items-center gap-4'>
							<NavbarButton
								onClick={() => setIsMobileMenuOpen(false)}
								variant='primary'
								className='w-full'>
								Login
							</NavbarButton>
							<NavbarButton
								onClick={() => setIsMobileMenuOpen(false)}
								variant='primary'
								className='w-full'>
								Book a call
							</NavbarButton>
						</div>
					</MobileNavMenu>
				</MobileNav>
			</Navbar>
		</header>
	);
};

export default Header;
