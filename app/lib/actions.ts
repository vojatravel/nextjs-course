'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer',
  }),
  amount: z.coerce.number().gt(0, 'Amount must be greater than $0'),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select a valid status',
  }),
  date: z.string(),
});

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export const createInvoice = async (prevState: State, formData: FormData) => {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
  
  const { customerId, amount, status } = validatedFields.data;
  console.log('Creating invoice...', formData);


  const amountInCents = Math.round(amount * 100);
  const date = new Date().toISOString().split('T')[0];

  console.log(amountInCents, date);

  try {
    await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
    console.log('Invoice created successfully!', formData);
  } catch (error) {
    console.error('Error creating invoice:', error);
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
};

export const updateInvoice = async (id: string, formData: FormData) => {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;

  try {
    await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
    `;
    console.log('Invoice updated successfully!', formData);
  } catch (error) {
    console.error('Error updating invoice:', error);
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
};

export const deleteInvoice = async (id: string) => {
  await sql`
        DELETE FROM invoices
        WHERE id = ${id}
    `;

  revalidatePath('/dashboard/invoices');
};
