import { createClient } from '@supabase/supabase-js';

const BUCKET_NAME = "uploads";

// Client-side Supabase instance for direct uploads
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseClient = createClient(supabaseUrl, supabaseKey);

/**
 * Upload an image file directly to Supabase Storage (client-side).
 * Returns the public URL of the uploaded image.
 * This avoids sending large base64 payloads through Server Actions.
 */
export async function uploadImageToStorage(file: File, prefix: string = 'image'): Promise<string> {
    const fileExtension = file.name.split('.').pop() || 'png';
    const uniqueFileName = `${prefix}-${Date.now()}.${fileExtension}`;

    const { data, error } = await supabaseClient
        .storage
        .from(BUCKET_NAME)
        .upload(uniqueFileName, file, {
            contentType: file.type,
            upsert: true,
        });

    if (error) {
        console.error("Supabase storage upload error:", error);
        throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseClient
        .storage
        .from(BUCKET_NAME)
        .getPublicUrl(uniqueFileName);

    return publicUrl;
}
