import React, { useState, useRef } from 'react';
import { describeImage, generateAltText, checkPromptApiAvailability } from '../utils/promptApi';

interface ImageDescriptionProps {
    onResult?: (description: string, type: 'description' | 'alt-text') => void;
    className?: string;
}

export const ImageDescription: React.FC<ImageDescriptionProps> = ({ 
    onResult, 
    className = '' 
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [customPrompt, setCustomPrompt] = useState('');
    const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Check API availability on component mount
    React.useEffect(() => {
        const checkAvailability = async () => {
            try {
                const availability = await checkPromptApiAvailability({
                    expectedInputs: [{ type: 'image' }, { type: 'text' }]
                });
                setApiAvailable(availability === 'available' || availability === 'downloadable');
                if (availability === 'unavailable') {
                    setError('Chrome Prompt API with image support is not available. Make sure you\'re using Chrome with experimental AI features enabled.');
                }
            } catch (err) {
                setApiAvailable(false);
                setError('Failed to check Prompt API availability');
            }
        };
        
        checkAvailability();
    }, []);

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select a valid image file');
                return;
            }

            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                setError('Image file is too large. Please select an image under 10MB.');
                return;
            }

            setSelectedImage(file);
            setError('');
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDescribeImage = async () => {
        if (!selectedImage) {
            setError('Please select an image first');
            return;
        }

        setIsLoading(true);
        setError('');
        setProgress(0);
        setResult('');

        try {
            const description = await describeImage(
                selectedImage,
                customPrompt || undefined,
                setProgress
            );
            
            setResult(description);
            onResult?.(description, 'description');
        } catch (err) {
            console.error('Error describing image:', err);
            setError(err instanceof Error ? err.message : 'Failed to describe image');
        } finally {
            setIsLoading(false);
            setProgress(0);
        }
    };

    const handleGenerateAltText = async () => {
        if (!selectedImage) {
            setError('Please select an image first');
            return;
        }

        setIsLoading(true);
        setError('');
        setProgress(0);
        setResult('');

        try {
            const altText = await generateAltText(selectedImage, setProgress);
            setResult(altText);
            onResult?.(altText, 'alt-text');
        } catch (err) {
            console.error('Error generating alt text:', err);
            setError(err instanceof Error ? err.message : 'Failed to generate alt text');
        } finally {
            setIsLoading(false);
            setProgress(0);
        }
    };

    const clearImage = () => {
        setSelectedImage(null);
        setImagePreview('');
        setResult('');
        setError('');
        setCustomPrompt('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    if (apiAvailable === false) {
        return (
            <div className={`p-4 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
                <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-yellow-800">
                        Image description requires Chrome with experimental AI features enabled.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                />
                
                {!selectedImage ? (
                    <label htmlFor="image-upload" className="cursor-pointer">
                        <div className="space-y-2">
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="text-sm text-gray-600">
                                <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span>
                                {' '}or drag and drop an image
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </div>
                    </label>
                ) : (
                    <div className="space-y-4">
                        <div className="relative inline-block">
                            <img 
                                src={imagePreview} 
                                alt="Selected image preview" 
                                className="max-w-full max-h-48 rounded-lg shadow-lg"
                            />
                            <button
                                onClick={clearImage}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                title="Remove image"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-sm text-gray-600">{selectedImage.name}</p>
                    </div>
                )}
            </div>

            {selectedImage && (
                <>
                    <div className="space-y-2">
                        <label htmlFor="custom-prompt" className="block text-sm font-medium text-gray-700">
                            Custom Prompt (optional)
                        </label>
                        <textarea
                            id="custom-prompt"
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            placeholder="Enter a custom prompt for image description..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                        />
                    </div>

                    <div className="flex space-x-3">
                        <button
                            onClick={handleDescribeImage}
                            disabled={isLoading}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? 'Describing...' : 'Describe Image'}
                        </button>
                        
                        <button
                            onClick={handleGenerateAltText}
                            disabled={isLoading}
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? 'Generating...' : 'Generate Alt Text'}
                        </button>
                    </div>
                </>
            )}

            {isLoading && progress > 0 && (
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Processing...</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-800 text-sm">{error}</p>
                </div>
            )}

            {result && (
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Result:
                    </label>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                        <p className="text-gray-800 whitespace-pre-wrap">{result}</p>
                    </div>
                    <button
                        onClick={() => navigator.clipboard.writeText(result)}
                        className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        Copy to clipboard
                    </button>
                </div>
            )}
        </div>
    );
};