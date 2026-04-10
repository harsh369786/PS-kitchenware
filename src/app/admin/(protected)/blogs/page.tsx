'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getBlogContent, saveBlogContent } from '@/lib/blog-content';
import { uploadImageToStorage } from '@/lib/upload-image';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, PlusCircle, Trash2, Save } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import type { BlogContent } from '@/lib/types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const blogSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  shortDescription: z.string().optional(),
  content: z.string().optional(),
  imageUrl: z.string().optional(),
  featuredImage: z.string().optional(),
  rank: z.coerce.number().default(0),
  status: z.enum(['draft', 'published']).default('draft'),
  publishDate: z.string().optional(),
  category: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

const formSchema = z.object({
  blogs: z.array(blogSchema),
});

type FormValues = z.infer<typeof formSchema>;

const slugify = (text: string) => {
    if (!text) return '';
    return text
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
};

export default function BlogAdminPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            blogs: [],
        },
    });

    const { control, reset, formState, getValues, setValue } = form;

    const { fields: blogFields, append: appendBlog, remove: removeBlog } = useFieldArray({
        control,
        name: "blogs",
    });

    useEffect(() => {
        async function loadContent() {
            try {
                const content = await getBlogContent();
                reset({ blogs: content.blogs || [] });
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to load blog content.' });
            } finally {
                setIsLoading(false);
            }
        }
        loadContent();
    }, [reset, toast]);

    const handleFileChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
        onChange: (value: string) => void,
        prefix: string = 'image'
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast({ variant: 'destructive', title: 'Error', description: 'Image is too large. Please use an image under 5MB.' });
                return;
            }
            try {
                toast({ title: 'Uploading...', description: 'Uploading image to storage.' });
                const publicUrl = await uploadImageToStorage(file, prefix);
                onChange(publicUrl);
                toast({ title: 'Uploaded', description: 'Image uploaded successfully.' });
            } catch (error) {
                console.error('Image upload failed:', error);
                toast({ variant: 'destructive', title: 'Upload Failed', description: 'Failed to upload image. Please try again.' });
            }
        }
    };

    const onSubmit = async (data: FormValues) => {
        setIsSaving(true);
        try {
            const cleanedData: BlogContent = {
                blogs: data.blogs.map(b => ({
                    ...b,
                    shortDescription: b.shortDescription || '',
                    content: b.content || '',
                    publishDate: b.publishDate || new Date().toISOString(),
                }))
            };

            await saveBlogContent(cleanedData);
            toast({ title: 'Success', description: 'Blogs saved successfully.' });
            reset(data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to save blogs.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Blog Management</h1>
                <Button
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={isSaving || !formState.isDirty}
                    size="lg"
                >
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save All Changes
                </Button>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Blogs</CardTitle>
                            <CardDescription>Add, edit, or delete blogs for your website.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {blogFields.map((field, index) => (
                                <Card key={field.id} className="p-4 relative">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                        <div className="space-y-4">
                                            <FormField
                                                control={control}
                                                name={`blogs.${index}.title`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Title</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} onBlur={() => {
                                                                const currentSlug = getValues(`blogs.${index}.slug`);
                                                                if (!currentSlug) {
                                                                    setValue(`blogs.${index}.slug`, slugify(field.value), { shouldDirty: true });
                                                                }
                                                            }} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={control}
                                                name={`blogs.${index}.slug`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Slug</FormLabel>
                                                        <FormControl><Input {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={control}
                                                name={`blogs.${index}.shortDescription`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Short Description / Excerpt</FormLabel>
                                                        <FormControl><Textarea {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                             <FormField
                                                control={control}
                                                name={`blogs.${index}.category`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Category</FormLabel>
                                                        <FormControl><Input {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <FormField
                                                control={control}
                                                name={`blogs.${index}.status`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Status</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select status" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="draft">Draft</SelectItem>
                                                                <SelectItem value="published">Published</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="grid grid-cols-2 gap-4">
                                              <FormField
                                                  control={control}
                                                  name={`blogs.${index}.rank`}
                                                  render={({ field }) => (
                                                      <FormItem>
                                                          <FormLabel>Rank (Display Order)</FormLabel>
                                                          <FormControl><Input type="number" {...field} /></FormControl>
                                                          <FormMessage />
                                                      </FormItem>
                                                  )}
                                              />
                                              <FormField
                                                  control={control}
                                                  name={`blogs.${index}.publishDate`}
                                                  render={({ field }) => (
                                                      <FormItem>
                                                          <FormLabel>Publish Date (YYYY-MM-DD)</FormLabel>
                                                          <FormControl><Input type="date" {...field} /></FormControl>
                                                          <FormMessage />
                                                      </FormItem>
                                                  )}
                                              />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={control}
                                                    name={`blogs.${index}.imageUrl`}
                                                    render={({ field: { onChange, value } }) => (
                                                        <FormItem>
                                                            <FormLabel>Thumbnail Image</FormLabel>
                                                            {value && <Image src={value} alt="thumbnail" width={100} height={100} className="rounded-md object-cover mb-2" />}
                                                            <FormControl>
                                                                <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, onChange, `blog-${index}`)} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={control}
                                                    name={`blogs.${index}.featuredImage`}
                                                    render={({ field: { onChange, value } }) => (
                                                        <FormItem>
                                                            <FormLabel>Banner/Featured Image</FormLabel>
                                                            {value && <Image src={value} alt="banner" width={100} height={100} className="rounded-md object-cover mb-2" />}
                                                            <FormControl>
                                                                <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, onChange, `blog-banner-${index}`)} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4 mb-8">
                                        <FormField
                                            control={control}
                                            name={`blogs.${index}.content`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Full Content (Markdown or Text)</FormLabel>
                                                    <FormControl><Textarea className="min-h-[200px]" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pt-4 border-t">
                                         <FormField
                                            control={control}
                                            name={`blogs.${index}.seoTitle`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>SEO Title</FormLabel>
                                                    <FormControl><Input {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={control}
                                            name={`blogs.${index}.seoDescription`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>SEO Description</FormLabel>
                                                    <FormControl><Input {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <Button type="button" variant="destructive" size="sm" onClick={() => removeBlog(index)} className="absolute top-4 right-4">
                                        <Trash2 className="mr-2 h-4 w-4" /> Remove Blog
                                    </Button>
                                </Card>
                            ))}
                            <Button type="button" onClick={() => appendBlog({ 
                                id: `blog-${Date.now()}`, 
                                title: '', 
                                slug: '', 
                                shortDescription: '', 
                                content: '', 
                                rank: 0, 
                                status: 'draft' 
                            })}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Blog
                            </Button>
                        </CardContent>
                    </Card>
                </form>
            </Form>
        </div>
    );
}
