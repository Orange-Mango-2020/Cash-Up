'use server'

import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { createClient } from '@/lib/supabase/server'

export async function seedUsers() {
  const supabase = await createClient()
  const { data: existing } = await supabase.from('users').select('id').limit(1)
  if (existing && existing.length > 0) return { message: 'Already seeded' }

  const usersToSeed = [
    { name: 'Dawood', pin: '1234', role: 'manager' },
    { name: 'Khalil', pin: '2345', role: 'manager' },
    { name: 'Qaasim', pin: '3456', role: 'owner' },
  ]

  const toInsert = await Promise.all(
    usersToSeed.map(async (u) => ({
      name: u.name,
      pin_hash: await bcrypt.hash(u.pin, 10),
      role: u.role,
    }))
  )

  const { error } = await supabase.from('users').insert(toInsert)
  if (error) throw new Error(error.message)
  return { message: 'Seeded successfully' }
}

export async function getUsers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('id, name, role, active')
    .eq('active', true)
    .order('name')
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function verifyPin(userId: string, pin: string): Promise<boolean> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('pin_hash')
    .eq('id', userId)
    .single()
  if (error || !data) return false
  return bcrypt.compare(pin, data.pin_hash)
}

export async function createSession(user: { id: string; name: string; role: string }) {
  const cookieStore = await cookies()
  cookieStore.set('bview_session', JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 8,
    path: '/',
  })
}

export async function getSession() {
  const cookieStore = await cookies()
  const value = cookieStore.get('bview_session')?.value
  if (!value) return null
  try {
    return JSON.parse(value) as { id: string; name: string; role: string }
  } catch {
    return null
  }
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete('bview_session')
}

export async function login(userId: string, pin: string): Promise<{ success: boolean }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('id, name, role, pin_hash')
    .eq('id', userId)
    .single()

  if (error || !data) return { success: false }

  const valid = await bcrypt.compare(pin, data.pin_hash)
  if (!valid) return { success: false }

  await createSession({ id: data.id, name: data.name, role: data.role })
  return { success: true }
}
