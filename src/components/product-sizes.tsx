
'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2 } from 'lucide-react';

const ProductSizes = ({ fieldNamePrefix }: { fieldNamePrefix: string }) => {
    const { control } = useFormContext(); 

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

export default ProductSizes;
