'use client';

import { User } from '@/types/user';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

interface SidebarProps {
  user: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const pathname = usePathname();

  const commonLinks = [
    { href: '/', label: 'Dashboard', icon: 'home' },
    { href: '/products', label: 'Produtos', icon: 'package' },
    { href: '/customers', label: 'Clientes', icon: 'users' },
    { href: '/orders', label: 'Pedidos', icon: 'shopping-cart' },
  ];

  const adminLinks = [
    { href: '/users', label: 'Usuários', icon: 'user-plus' },
    { href: '/settings', label: 'Configurações', icon: 'settings' },
  ];

  const links = user?.role === 'admin'
    ? [...commonLinks, ...adminLinks]
    : commonLinks;

  return (
    <aside className="bg-gray-800 text-white w-64 min-h-screen">
      <div className="p-4">
        <h1 className="text-xl font-semibold">Painel</h1>
      </div>
      <nav className="mt-4">
        <ul>
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center px-4 py-3 hover:bg-gray-700 transition-colors ${isActive ? 'bg-gray-700' : ''}`}
                >
                  <span className="mr-3">
                    <i className={`fas fa-${link.icon}`}></i>
                  </span>
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;