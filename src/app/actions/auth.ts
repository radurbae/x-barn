'use server';

import { supabase } from '@/lib/supabase';

export async function signIn(email: string, password: string) {
    if (!supabase) {
        // Demo mode - allow any login
        return { success: true, user: { email } };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
}

export async function signOut() {
    if (!supabase) {
        return { success: true };
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function getSession() {
    if (!supabase) {
        return null;
    }

    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

export async function getUser() {
    if (!supabase) {
        return null;
    }

    const { data: { user } } = await supabase.auth.getUser();
    return user;
}
