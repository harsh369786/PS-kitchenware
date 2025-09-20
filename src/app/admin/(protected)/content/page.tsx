'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getSiteContent, saveSiteContent } from '@/lib/site-content';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SiteContent } from '@/lib/types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const heroProductSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Product name is required'),
  tagline: z.string().optional(),
  imageUrl: z.string().min(1, 'Image is required'),
  imageHint: z.string().optional(),
});

const subCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Subcategory name is required'),
  href: z.string().min(1, 'Link is required'),
  imageUrl: z.string().optional(),
  imageHint: z.string().optional(),
});

const categorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Category name is required'),
  href: z.string().min(1, 'Link is required'),
  imageUrl: z.string().min(1, 'Image is required'),
  imageHint: z.string().optional(),
  subcategories: z.array(subCategorySchema).optional(),
});

const formSchema = z.object({
  heroProducts: z.array(heroProductSchema),
  categories: z.array(categorySchema),
});

type FormValues = z.infer<typeof formSchema>;

export default function ContentAdminPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      heroProducts: [],
      categories: [],
    },
  });

  const { fields: heroProductFields, append: appendHero, remove: removeHero } = useFieldArray({
    control: form.control,
    name: "heroProducts",
  });

  const { fields: categoryFields, append: appendCategory, remove: removeCategory } = useFieldArray({
    control: form.control,
    name: "categories",
  });

  useEffect(() => {
    async function loadContent() {
      try {
        const content = await getSiteContent();
        form.reset(content);
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load site content.' });
      } finally {
        setIsLoading(false);
      }
    }
    loadContent();
  }, [form, toast]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSaving(true);
    try {
      await saveSiteContent(values as SiteContent);
      toast({ title: 'Success', description: 'Content saved successfully.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save content.' });
    } finally {
      setIsSaving(false);
    }
  };

  const Subcategories = ({ categoryIndex }: { categoryIndex: number }) => {
    const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: `categories.${categoryIndex}.subcategories`,
    });

    return (
      <div className="ml-6 mt-4 space-y-4 border-l pl-4">
        <h4 className="font-semibold">Subcategories</h4>
        {fields.map((field, index) => (
          <div key={field.id} className="relative rounded-md border p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                    <FormField
                    control={form.control}
                    name={`categories.${categoryIndex}.subcategories.${index}.name`}
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name={`categories.${categoryIndex}.subcategories.${index}.href`}
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Link</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <div className="space-y-2">
                    <FormField
                        control={form.control}
                        name={`categories.${categoryIndex}.subcategories.${index}.imageUrl`}
                        render={({ field: { onChange, value } }) => (
                        <FormItem>
                            <FormLabel>Image (optional)</FormLabel>
                            {value && <Image src={value} alt="preview" width={100} height={100} className="rounded-md object-cover" />}
                            <FormControl>
                            <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, onChange)} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
              </div>

            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="absolute top-2 right-2 h-6 w-6">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => append({ id: `new-subcat-${Date.now()}`, name: '', href: '', imageUrl: '', imageHint: '' })}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Add Subcategory
        </Button>
      </div>
    );
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
      <h1 className="text-3xl font-bold mb-6">Site Content Management</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="hero">
            <TabsList>
              <TabsTrigger value="hero">Hero Banners</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>
            <TabsContent value="hero">
              <Card>
                <CardHeader>
                  <CardTitle>Hero Banners</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {heroProductFields.map((field, index) => (
                    <Card key={field.id} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name={`heroProducts.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Product Name</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`heroProducts.${index}.tagline`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tagline</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="space-y-2">
                           <FormField
                            control={form.control}
                            name={`heroProducts.${index}.imageUrl`}
                            render={({ field: { onChange, value } }) => (
                              <FormItem>
                                <FormLabel>Image</FormLabel>
                                {value && <Image src={value} alt="preview" width={100} height={100} className="rounded-md object-cover" />}
                                <FormControl>
                                  <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, onChange)} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeHero(index)} className="mt-4">
                        <Trash2 className="mr-2 h-4 w-4" /> Remove
                      </Button>
                    </Card>
                  ))}
                  <Button type="button" onClick={() => appendHero({ id: `new-hero-${Date.now()}`, name: '', tagline: '', imageUrl: '', imageHint: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Hero Banner
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="categories">
              <Card>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {categoryFields.map((field, index) => (
                     <Collapsible key={field.id} asChild>
                      <Card className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                            <div className="space-y-4">
                              <FormField
                                control={form.control}
                                name={`categories.${index}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Category Name</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`categories.${index}.href`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Link</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="space-y-2">
                              <FormField
                                control={form.control}
                                name={`categories.${index}.imageUrl`}
                                render={({ field: { onChange, value } }) => (
                                  <FormItem>
                                    <FormLabel>Image</FormLabel>
                                    {value && <Image src={value} alt="preview" width={100} height={100} className="rounded-md object-cover" />}
                                    <FormControl>
                                      <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, onChange)} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                          <div className="flex flex-col ml-4">
                             <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm">Edit Subcategories</Button>
                             </CollapsibleTrigger>
                             <Button type="button" variant="destructive" size="sm" onClick={() => removeCategory(index)} className="mt-2">
                               <Trash2 className="mr-2 h-4 w-4" /> Remove
                             </Button>
                           </div>
                        </div>
                        <CollapsibleContent>
                          <Subcategories categoryIndex={index} />
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  ))}
                  <Button type="button" onClick={() => appendCategory({ id: `new-cat-${Date.now()}`, name: '', href: '', imageUrl: '', imageHint: '', subcategories: [] })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Category
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <Button type="submit" disabled={isSaving} size="lg">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Changes
          </Button>
        </form>
      </Form>
    </div>
  );
}
