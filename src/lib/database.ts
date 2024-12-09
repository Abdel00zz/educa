import { supabase } from './supabase'
import type { Database } from '../types/database.types'

type Tables = Database['public']['Tables']
type Profile = Tables['profiles']['Row']
type Class = Tables['classes']['Row']
type Chapter = Tables['chapters']['Row']
type Enrollment = Tables['enrollments']['Row']

// Profiles
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data as Profile
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
  
  if (error) throw error
}

// Classes
export async function getClasses(userId: string, role: 'student' | 'admin') {
  const query = supabase.from('classes').select(`
    *,
    profiles!classes_created_by_fkey (
      full_name
    )
  `)

  if (role === 'student') {
    query.in('id', (rq) => 
      rq.from('enrollments')
        .select('class_id')
        .eq('student_id', userId)
    )
  }

  const { data, error } = await query
  if (error) throw error
  return data as (Class & { profiles: { full_name: string | null } })[]
}

export async function createClass(classData: Tables['classes']['Insert']) {
  const { data, error } = await supabase
    .from('classes')
    .insert(classData)
    .select()
    .single()
  
  if (error) throw error
  return data as Class
}

// Chapters
export async function getChapters(classId: string) {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('class_id', classId)
    .order('order')
  
  if (error) throw error
  return data as Chapter[]
}

export async function createChapter(chapterData: Tables['chapters']['Insert']) {
  const { data, error } = await supabase
    .from('chapters')
    .insert(chapterData)
    .select()
    .single()
  
  if (error) throw error
  return data as Chapter
}

// Enrollments
export async function enrollStudent(studentId: string, classId: string) {
  const { error } = await supabase
    .from('enrollments')
    .insert({
      student_id: studentId,
      class_id: classId
    })
  
  if (error) throw error
}

export async function unenrollStudent(studentId: string, classId: string) {
  const { error } = await supabase
    .from('enrollments')
    .delete()
    .eq('student_id', studentId)
    .eq('class_id', classId)
  
  if (error) throw error
}
