import React, { useState } from 'react';
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase.ts';

interface ImageUploadProps {
    label: string;
    value?: string;
    onUpload: (url: string) => void;
    className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ label, value, onUpload, className = '' }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState(value);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) return;

        const file = event.target.files[0];
        setIsUploading(true);
        setPreview(URL.createObjectURL(file));

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to 'images' bucket
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // Get Public URL
            const { data } = supabase.storage.from('images').getPublicUrl(filePath);

            onUpload(data.publicUrl);
        } catch (error: any) {
            console.error('Upload Error:', error);
            alert('Erro ao fazer upload. Verifique se o bucket "images" existe no Supabase e se é público.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={`space-y-2 ${className}`}>
            <label className="block text-xs font-bold text-slate-500 uppercase">{label}</label>
            <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer group">
                    <div className={`
              border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-colors
              group-hover:border-indigo-400 group-hover:bg-indigo-50
              ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
           `}>
                        {isUploading ? (
                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                        ) : (
                            <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-600" />
                        )}
                        <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-600">
                            {isUploading ? 'Enviando...' : 'Escolher Imagem'}
                        </span>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={isUploading}
                        />
                    </div>
                </label>

                {preview && (
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 relative">
                        <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageUpload;
