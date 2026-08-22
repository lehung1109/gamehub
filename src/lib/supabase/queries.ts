import { createClient } from './server';
import { Database } from '@/types/database';

type ClassroomRow = Database['public']['Tables']['classrooms']['Row'];
type ClassroomInsert = Database['public']['Tables']['classrooms']['Insert'];
type ClassroomUpdate = Database['public']['Tables']['classrooms']['Update'];

type StudentRow = Database['public']['Tables']['students']['Row'];

export async function getClasses(): Promise<ClassroomRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('classrooms')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching classes:', error);
    throw new Error('Failed to fetch classes');
  }

  return data || [];
}

export async function getClassById(id: string): Promise<ClassroomRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('classrooms')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // not found
    console.error('Error fetching class by id:', error);
    throw new Error('Failed to fetch class');
  }

  return data;
}

export async function createClass(classData: Omit<ClassroomInsert, 'teacher_id'>): Promise<ClassroomRow> {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  const insertData: ClassroomInsert = {
    ...classData,
    teacher_id: user.id
  };

  const { data, error } = await supabase
    .from('classrooms')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Error creating class:', error);
    throw new Error('Failed to create class');
  }

  return data;
}

export async function updateClass(id: string, updates: ClassroomUpdate): Promise<ClassroomRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('classrooms')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating class:', error);
    throw new Error('Failed to update class');
  }

  return data;
}

export async function getStudentsByClassId(classId: string): Promise<StudentRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('classroom_id', classId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching students:', error);
    throw new Error('Failed to fetch students');
  }

  return data || [];
}

export async function getStudentById(studentId: string): Promise<StudentRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', studentId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching student:', error);
    throw new Error('Failed to fetch student');
  }

  return data;
}
