'use client'

import {
  BanknotesIcon,
  ClockIcon,
  UserGroupIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { sql } from '@vercel/postgres';
import { useEffect, useState } from 'react';

const iconMap = {
  collected: BanknotesIcon,
  customers: UserGroupIcon,
  pending: ClockIcon,
  invoices: InboxIcon,
};

export default async function CardWrapper() {
  const [totalPaidInvoices, setTotalPaidInvoices] = useState<number | null>(null);
  const [totalPendingInvoices, setTotalPendingInvoices] = useState(0);
  const [numberOfInvoices, setNumberOfInvoices] = useState(0);
  const [numberOfCustomers, setNumberOfCustomers] = useState(0);

  useEffect(() => {
    async function fetchCardData() {
      try {
        const data = await sql`
          SELECT
            (SELECT COUNT(*) FROM invoices WHERE status = 'paid') as paid,
            (SELECT COUNT(*) FROM invoices WHERE status = 'pending') as pending,
            (SELECT COUNT(*) FROM invoices) as invoices,
            (SELECT COUNT(*) FROM customers) as customers
        `;

        setTotalPaidInvoices(data[0].paid);
        setTotalPendingInvoices(data[0].pending);
        setNumberOfInvoices(data[0].invoices);
        setNumberOfCustomers(data[0].customers);
      } catch (error) {
        console.error('Database Error:', error);
      }
    }

    fetchCardData();
  }
  , []);
  return (
    <>
      {/* NOTE: comment in this code when you get to this point in the course */}

      <Card title="Collected" value={totalPaidInvoices} type="collected" />
      <Card title="Pending" value={totalPendingInvoices} type="pending" />
      <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
      <Card
        title="Total Customers"
        value={numberOfCustomers}
        type="customers"
      />
    </>
  );
}

export function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string;
  type: 'invoices' | 'customers' | 'pending' | 'collected';
}) {
  const Icon = iconMap[type];

  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p
        className={`${lusitana.className}
          truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
      >
        {value}
      </p>
    </div>
  );
}
