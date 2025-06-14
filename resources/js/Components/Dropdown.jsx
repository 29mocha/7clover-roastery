import { Menu, Transition } from '@headlessui/react';
import { Link } from '@inertiajs/react';
import { Fragment } from 'react';

const Dropdown = ({ children }) => {
    return (
        <Menu as="div" className="relative">
            {/* Komponen Menu dari Headless UI akan menjadi pembungkus utama */}
            {children}
        </Menu>
    );
};

const Trigger = ({ children, className = '' }) => {
    return (
        // Trigger sekarang adalah Menu.Button, yang secara otomatis menangani buka/tutup
        <Menu.Button className={`inline-flex items-center ${className}`}>
            {children}
        </Menu.Button>
    );
};

const Content = ({
    align = 'right',
    width = '48',
    contentClasses = 'py-1 bg-white dark:bg-gray-700',
    children,
}) => {
    const widthClasses = `w-${width}`;
    const alignmentClasses = align === 'left' ? 'origin-top-left left-0' : 'origin-top-right right-0';

    return (
        <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
        >
            {/* Konten dropdown sekarang adalah Menu.Items */}
            <Menu.Items
                className={
                    `absolute z-50 mt-2 rounded-md shadow-lg ${alignmentClasses} ${widthClasses} ` +
                    `ring-1 ring-black ring-opacity-5 max-h-[70vh] overflow-y-auto focus:outline-none ` +
                    contentClasses
                }
            >
                {children}
            </Menu.Items>
        </Transition>
    );
};

const DropdownLink = ({ className = '', children, ...props }) => {
    return (
        // Item link di dalam menu
        <Menu.Item>
            {({ active }) => (
                <Link
                    {...props}
                    className={
                        `block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 dark:text-gray-300 transition duration-150 ease-in-out ` +
                        (active ? 'bg-gray-100 dark:bg-gray-600' : '') +
                        className
                    }
                >
                    {children}
                </Link>
            )}
        </Menu.Item>
    );
};

// Menempelkan sub-komponen ke komponen utama
Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

export default Dropdown;