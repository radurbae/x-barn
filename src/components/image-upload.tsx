'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import Image from 'next/image';

interface ImageUploadProps {
    value: string | null;
    onChange: (url: string | null) => void;
    className?: string;
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();

    const handleFileSelect = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Max 5MB
        if (file.size > 5 * 1024 * 1024) {
            alert('Image must be less than 5MB');
            return;
        }

        setIsUploading(true);

        try {
            // Convert to base64 for demo mode (no Supabase storage)
            // In production, you'd upload to Supabase Storage instead
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                onChange(base64);
                setIsUploading(false);
            };
            reader.onerror = () => {
                alert('Failed to read image');
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error uploading image:', error);
            setIsUploading(false);
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleRemove = () => {
        onChange(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    return (
        <div className={cn('space-y-2', className)}>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
            />

            {value ? (
                <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                    <div className="aspect-square relative">
                        <Image
                            src={value}
                            alt="Product image"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={handleRemove}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div
                    onClick={() => inputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                        'flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors',
                        isDragging
                            ? 'border-amber-500 bg-amber-500/10'
                            : 'border-slate-300 dark:border-slate-600 hover:border-amber-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/50',
                        isUploading && 'opacity-50 pointer-events-none'
                    )}
                >
                    {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500/20 border-t-amber-500" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">{t('uploading')}</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-3">
                                <ImageIcon className="h-6 w-6 text-slate-500 dark:text-slate-400" />
                            </div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('uploadImage')}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('dragOrClick')}</p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
