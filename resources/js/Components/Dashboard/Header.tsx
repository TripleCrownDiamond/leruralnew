import { useState, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDown, Bell, Search, Menu as MenuIcon } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { User as UserType } from '@/types';
import { ModeToggle } from '@/Components/ModeToggle';
import { LanguageSelector } from '@/Components/LanguageSelector';
import { Button } from '@/Components/ui/button';

interface HeaderProps {
    user: UserType & { avatar?: string };
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

export default function Header({ user, sidebarOpen, setSidebarOpen }: HeaderProps) {
    return (
        <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-gray-100 bg-white/80 px-4 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80 sm:px-6 lg:px-8 shrink-0">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="text-gray-500 hover:text-gray-700 lg:hidden"
                >
                    <span className="sr-only">Ouvrir le menu</span>
                    <MenuIcon className="h-6 w-6" />
                </Button>
                
                {/* Search Bar (Hidden on mobile) */}
                <div className="hidden md:flex items-center rounded-xl bg-gray-50 px-4 py-2 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 focus-within:ring-2 focus-within:ring-primary/20 transition-all w-64 lg:w-96">
                    <Search className="h-4 w-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Rechercher..." 
                        className="ml-3 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 dark:text-white border-none focus:ring-0 p-0"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-1">
                    <LanguageSelector />
                    <ModeToggle />
                </div>

                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2 hidden sm:block"></div>

                <button className="relative rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-800 transition-colors">
                    <span className="sr-only">Voir les notifications</span>
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900" />
                </button>

                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-1">
                    <Menu.Button className="flex items-center gap-3 rounded-full bg-transparent p-1 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors pr-3 border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                        <span className="sr-only">Ouvrir le menu utilisateur</span>
                        {user.avatar ? (
                            <img
                                className="h-8 w-8 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
                                src={user.avatar}
                                alt={user.name}
                            />
                        ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-sm font-bold text-white shadow-md shadow-primary/20">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="hidden flex-col items-start text-left lg:flex">
                            <span className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-1">
                                {user.name}
                            </span>
                            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide leading-none">
                                {user.role}
                            </span>
                        </div>
                        <ChevronDown className="hidden h-4 w-4 text-gray-400 lg:block" />
                    </Menu.Button>

                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95 translate-y-2"
                        enterTo="transform opacity-100 scale-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="transform opacity-100 scale-100 translate-y-0"
                        leaveTo="transform opacity-0 scale-95 translate-y-2"
                    >
                        <Menu.Items className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl bg-white py-2 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 mb-1 lg:hidden">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                            
                            <Menu.Item>
                                {({ active }) => (
                                    <Link
                                        href={route('profile.edit')}
                                        className={`${
                                            active ? 'bg-gray-50 text-primary dark:bg-gray-700/50' : 'text-gray-700 dark:text-gray-200'
                                        } flex items-center gap-2 px-4 py-2.5 text-sm transition-colors mx-2 rounded-lg`}
                                    >
                                        Mon Profil
                                    </Link>
                                )}
                            </Menu.Item>
                            
                            <div className="my-1 border-t border-gray-100 dark:border-gray-700"></div>

                            <Menu.Item>
                                {({ active }) => (
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className={`${
                                            active ? 'bg-red-50 text-red-600 dark:bg-red-900/10' : 'text-red-600'
                                        } flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors mx-2 rounded-lg`}
                                    >
                                        Déconnexion
                                    </Link>
                                )}
                            </Menu.Item>
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>
        </header>
    );
}
