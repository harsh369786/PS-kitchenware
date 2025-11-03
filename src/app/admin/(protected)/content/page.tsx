

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
import type { SiteContent, HeroProduct, SubCategory } from '@/lib/types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const productSizeSchema = z.object({
  name: z.string().optional(),
  price: z.coerce.number().optional(),
});

const heroProductSchema = z.object({
  productId: z.string().min(1, 'Product selection is required'),
  tagline: z.string().optional(),
  imageUrl: z.string().optional(),
  imageHint: z.string().optional(),
});


const subCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Subcategory name is required'),
  href: z.string(),
  imageUrl: z.string().optional(),
  imageHint: z.string().optional(),
  price: z.coerce.number().optional(),
  sizes: z.array(productSizeSchema).optional(),
});

const categorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Category name is required'),
  href: z.string(),
imageUrl: z.string().min(1, 'Image is required'),
  imageHint: z.string().optional(),
  subcategories: z.array(subCategorySchema).optional(),
});

const formSchema = z.object({
  heroProducts: z.array(heroProductSchema),
  categories: z.array(categorySchema),
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

const ProductSizes = ({ control, fieldNamePrefix }: { control: any, fieldNamePrefix: string }) => {
    const { fields, append, remove } = useFieldArray({
      control: control,
      name: `${fieldNamePrefix}.sizes`
    });

    return (
        <div className="mt-4 space-y-2 rounded-md border p-4">
            <h5 className="font-medium">Sizes & Prices</h5>
            {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                    <FormField
                        control={control}
                        name={`${fieldNamePrefix}.sizes.${index}.name`}
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormControl><Input {...field} placeholder="Size Name (e.g. S, M, L)"/></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={control}
                        name={`${fieldNamePrefix}.sizes.${index}.price`}
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="Price"
                                        {...field}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            field.onChange(value === '' ? undefined : Number(value));
                                        }}
                                        value={field.value ?? ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            ))}
            <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => append({ name: '', price: undefined })}
            >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Size
            </Button>
        </div>
    );
};

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

  const { control, setValue, getValues, watch, reset } = form;

  const watchedCategories = watch('categories');
  const allProducts: SubCategory[] = useMemo(() => {
    return watchedCategories.flatMap(cat => cat.subcategories || []);
  }, [watchedCategories]);
  
  const updateHrefs = useCallback((categoryIndex: number, subcategoryIndex?: number) => {
    const categories = getValues('categories');
    const category = categories[categoryIndex];
    if (!category) return;

    const categorySlug = slugify(category.name);
    const expectedCategoryHref = `/category/${categorySlug}`;
    if (category.href !== expectedCategoryHref) {
      setValue(`categories.${categoryIndex}.href`, expectedCategoryHref, { shouldDirty: true, shouldTouch: true });
    }

    if (subcategoryIndex !== undefined) {
      const subcategory = category.subcategories?.[subcategoryIndex];
      if (subcategory) {
        const subcategorySlug = slugify(subcategory.name);
        const expectedSubHref = `${expectedCategoryHref}/${subcategorySlug}`;
        if (subcategory.href !== expectedSubHref) {
          setValue(`categories.${categoryIndex}.subcategories.${subcategoryIndex}.href`, expectedSubHref, { shouldDirty: true, shouldTouch: true });
        }
      }
    } else {
       category.subcategories?.forEach((sub, subIndex) => {
          const subcategorySlug = slugify(sub.name);
          const expectedSubHref = `${expectedCategoryHref}/${subcategorySlug}`;
           if (sub.href !== expectedSubHref) {
             setValue(`categories.${categoryIndex}.subcategories.${subIndex}.href`, expectedSubHref, { shouldDirty: true, shouldTouch: true });
           }
       });
    }
  }, [getValues, setValue]);


  const { fields: heroProductFields, append: appendHero, remove: removeHero } = useFieldArray({
    control,
    name: "heroProducts",
  });

  const { fields: categoryFields, append: appendCategory, remove: removeCategory } = useFieldArray({
    control,
    name: "categories",
  });

  useEffect(() => {
    async function loadContent() {
      try {
        const content = await getSiteContent();
        
        const sanitizedContent = {
          heroProducts: content.heroProducts.map(p => ({ 
            productId: p.productId,
            tagline: p.tagline,
            imageUrl: p.imageUrl,
            imageHint: p.imageHint,
          })),
          categories: content.categories.map(c => ({
            ...c,
            subcategories: c.subcategories?.map(sc => ({ 
                ...sc, 
                price: sc.price ?? undefined,
                sizes: sc.sizes?.map(s => ({...s, price: s.price ?? undefined})) || []
            })) || []
          }))
        };

        reset(sanitizedContent);
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load site content.' });
      } finally {
        setIsLoading(false);
      }
    }
    loadContent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

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

  const onSubmit = async (data: FormValues) => {
    setIsSaving(true);
    try {
      const cleanedData: SiteContent = {
        heroProducts: data.heroProducts.map(p => ({
            productId: p.productId,
            tagline: p.tagline || '',
            imageUrl: p.imageUrl || '',
            imageHint: p.imageHint || '',
        })),
        categories: data.categories.map(c => ({
          ...c,
          subcategories: c.subcategories?.map(sc => ({
            ...sc,
            price: sc.price ? Number(sc.price) : undefined,
            sizes: sc.sizes
              ?.filter(s => s && s.name && s.name.trim() !== '')
              .map(s => ({...s, price: s.price ? Number(s.price) : 0 }))
          }))
        }))
      };
      
      await saveSiteContent(cleanedData);
      toast({ title: 'Success', description: 'Content saved successfully.' });
      reset(data); // Reset with the data from the form to keep it, but mark as not dirty
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save content.' });
    } finally {
      setIsSaving(false);
    }
  };

  const Subcategories = ({ categoryIndex }: { categoryIndex: number }) => {
    const { fields, append, remove } = useFieldArray({
      control: control,
      name: `categories.${categoryIndex}.subcategories`,
    });
    
    const categoryName = watch(`categories.${categoryIndex}.name`);
    const categorySlug = slugify(categoryName);

    return (
      <div className="ml-6 mt-4 space-y-4 border-l pl-4">
        <h4 className="font-semibold">Subcategories / Products</h4>
        {fields.map((field, index) => (
          <div key={field.id} className="relative rounded-md border p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <FormField
                    control={control}
                    name={`categories.${categoryIndex}.subcategories.${index}.name`}
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl><Input {...field} onBlur={() => updateHrefs(categoryIndex, index)} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                      control={control}
                      name={`categories.${categoryIndex}.subcategories.${index}.href`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Link (auto-generated)</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly className="bg-muted" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                        control={control}
                        name={`categories.${categoryIndex}.subcategories.${index}.price`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price (if no sizes)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number"
                                    placeholder="Price"
                                    {...field}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        field.onChange(value === '' ? undefined : Number(value));
                                    }}
                                    value={field.value ?? ''}
                                  />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="space-y-4">
                    <FormField
                        control={control}
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
                     <p className="text-xs text-muted-foreground">If no image is provided, the main category image will be used.</p>
                </div>
              </div>
              <ProductSizes control={control} fieldNamePrefix={`categories.${categoryIndex}.subcategories.${index}`} />
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="absolute top-2 right-2 h-6 w-6">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
          </div>
        ))}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => append({ 
            id: `new-subcat-${Date.now()}`, 
            name: '', 
            href: `/category/${categorySlug}/${slugify('')}`, 
            imageUrl: '', 
            imageHint: '',
            price: undefined,
            sizes: [] 
          })}
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
              <TabsTrigger value="categories">Categories & Products</TabsTrigger>
            </TabsList>
            <TabsContent value="hero">
              <Card>
                <CardHeader>
                  <CardTitle>Hero Banners</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {heroProductFields.map((field, index) => (
                    <Card key={field.id} className="p-4 relative">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <FormField
                            control={control}
                            name={`heroProducts.${index}.productId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Product</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a product to feature" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {allProducts.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={control}
                            name={`heroProducts.${index}.tagline`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tagline (Optional)</FormLabel>
                                <FormControl><Input {...field} placeholder="Override product tagline"/></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="space-y-2">
                           <FormField
                            control={control}
                            name={`heroProducts.${index}.imageUrl`}
                            render={({ field: { onChange, value } }) => (
                              <FormItem>
                                <FormLabel>Image (Optional)</FormLabel>
                                {value && <Image src={value} alt="preview" width={100} height={100} className="rounded-md object-cover" />}
                                <FormControl>
                                  <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, onChange)} />
                                </FormControl>
                                <FormMessage />
                                <p className="text-xs text-muted-foreground">If no image is provided, the original product image will be used.</p>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeHero(index)} className="absolute bottom-4 right-4">
                        <Trash2 className="mr-2 h-4 w-4" /> Remove
                      </Button>
                    </Card>
                  ))}
                  <Button type="button" onClick={() => appendHero({ productId: '', tagline: '', imageUrl: '', imageHint: '' })}>
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
                                control={control}
                                name={`categories.${index}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Category Name</FormLabel>
                                    <FormControl><Input {...field} onBlur={() => updateHrefs(index)}/></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                               <FormField
                                control={control}
                                name={`categories.${index}.href`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Link (auto-generated)</FormLabel>
                                    <FormControl><Input {...field} readOnly className="bg-muted"/></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="space-y-2">
                              <FormField
                                control={control}
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
                                <Button variant="ghost" size="sm">Edit Products</Button>
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
          
          <Button type="submit" disabled={isSaving || !form.formState.isDirty} size="lg">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Changes
          </Button>
        </form>
      </Form>
    </div>
  );
}
