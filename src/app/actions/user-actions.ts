"use server";
import { supabase } from '@/lib/supabase';
import type { User, Address } from '@/lib/types';

/**
 * Find or create a user by email
 * Returns existing user or creates a new one
 */
export async function findOrCreateUser(userData: {
    email: string;
    name: string;
    phone: string;
}): Promise<User | null> {
    try {
        // Check if user exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', userData.email)
            .single();

        if (existingUser) {
            return existingUser as User;
        }

        // Create new user
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const { data: newUser, error } = await supabase
            .from('users')
            .insert({
                id: userId,
                email: userData.email,
                name: userData.name,
                phone: userData.phone,
            })
            .select()
            .single();

        if (error) throw error;
        return newUser as User;
    } catch (error) {
        console.error('Error finding/creating user:', error);
        return null;
    }
}

/**
 * Find or create an address for a user
 */
export async function findOrCreateAddress(
    userId: string,
    addressData: Omit<Address, 'id' | 'user_id' | 'created_at'>
): Promise<Address | null> {
    try {
        // Check if address exists
        const { data: existingAddress } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', userId)
            .eq('address', addressData.address)
            .eq('pincode', addressData.pincode)
            .single();

        if (existingAddress) {
            return existingAddress as Address;
        }

        // Create new address
        const addressId = `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const { data: newAddress, error } = await supabase
            .from('addresses')
            .insert({
                id: addressId,
                user_id: userId,
                ...addressData,
                is_default: false,
            })
            .select()
            .single();

        if (error) throw error;
        return newAddress as Address;
    } catch (error) {
        console.error('Error finding/creating address:', error);
        return null;
    }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return data as User;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

/**
 * Get all addresses for a user
 */
export async function getUserAddresses(userId: string): Promise<Address[]> {
    try {
        const { data, error } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', userId)
            .order('is_default', { ascending: false });

        if (error) throw error;
        return data as Address[];
    } catch (error) {
        console.error('Error fetching addresses:', error);
        return [];
    }
}

/**
 * Set an address as default for a user
 */
export async function setDefaultAddress(addressId: string, userId: string): Promise<boolean> {
    try {
        // First, unset all other addresses as default
        await supabase
            .from('addresses')
            .update({ is_default: false })
            .eq('user_id', userId);

        // Then set this one as default
        const { error } = await supabase
            .from('addresses')
            .update({ is_default: true })
            .eq('id', addressId)
            .eq('user_id', userId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error setting default address:', error);
        return false;
    }
}
