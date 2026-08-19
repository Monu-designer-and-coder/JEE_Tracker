'use client';

import * as React from 'react';

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from '@/components/ui/sidebar';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// This is sample data.

export default function AppSidebar() {
	const pathname = usePathname();
	const [currentPathName, setCurrentPathName] = React.useState(pathname);

	React.useEffect(() => {
		setCurrentPathName(pathname);
	}, [pathname]);

	const sidebarNavigation: {
		title: string;
		url: string;
		items: { title: string; url: string }[];
	}[] = [
		{
			title: 'Tracking JEE Progress',
			url: '/dashboard',
			items: [
				{
					title: 'Home',
					url: '/dashboard',
				},
        {
          title: 'Study-Session',
          url: '/dashboard/study',
        },
				{
					title: 'Side-Screen',
					url: '/dashboard/view',
				},
				{
					title: 'Data',
					url: '/dashboard/data',
				},
				{
					title: 'System',
					url: '/dashboard/system',
				},
				{
					title: 'Syllabus',
					url: '/dashboard/syllabus',
				},
			],
		},
	];

	return (
		<Sidebar className='z-100 max-h-[94.2vh] translate-y-[5.8vh]'>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							size='lg'
							className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
							asChild>
							<DashboardLogo />
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				{/* We create a SidebarGroup for each parent. */}
				{sidebarNavigation.map((item) => (
					<SidebarGroup key={item.title}>
						<SidebarGroupLabel>{item.title}</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{item.items.map((item) => (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton
											asChild
											isActive={currentPathName == item.url}>
											<a href={item.url}>{item.title}</a>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				))}
			</SidebarContent>
			<SidebarRail />
		</Sidebar>
	);
}

const DashboardLogo = () => {
	return (
		<Link
			href='/dashboard'
			className='relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-black'>
			<Image src='/globe.svg' alt='logo' width={30} height={30} />
			<span className='font-medium text-black dark:text-white font-heading'>
				Nuke JEE
			</span>
		</Link>
	);
};
