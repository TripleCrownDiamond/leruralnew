import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Languages, Check } from 'lucide-react';
import { usePage } from '@inertiajs/react';

export function LanguageSelector() {
    // In a real application, you would handle locale switching here
    // For now, we'll just mock it as the backend locale handling isn't fully set up for dynamic switching via inertia yet
    // Typically you'd visit a route like /language/{locale}
    
    const { props } = usePage();
    const currentLocale = (props as any).locale || 'fr';

    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    <span className="sr-only">Changer la langue</span>
                    <Languages className="h-5 w-5" aria-hidden="true" />
                </Menu.Button>
            </div>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700">
                    <div className="py-1">
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={() => console.log('Switch to FR')}
                                    className={`${
                                        active ? 'bg-gray-100 text-gray-900 dark:bg-gray-600 dark:text-white' : 'text-gray-700 dark:text-gray-200'
                                    } group flex w-full items-center px-4 py-2 text-sm`}
                                >
                                    <span className="flex-1 text-left">Français</span>
                                    {currentLocale === 'fr' && <Check className="ml-2 h-4 w-4" />}
                                </button>
                            )}
                        </Menu.Item>
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={() => console.log('Switch to EN')}
                                    className={`${
                                        active ? 'bg-gray-100 text-gray-900 dark:bg-gray-600 dark:text-white' : 'text-gray-700 dark:text-gray-200'
                                    } group flex w-full items-center px-4 py-2 text-sm`}
                                >
                                    <span className="flex-1 text-left">English</span>
                                    {currentLocale === 'en' && <Check className="ml-2 h-4 w-4" />}
                                </button>
                            )}
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
}
