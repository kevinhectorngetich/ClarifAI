// Test utilities for the Prompt API functionality

export const testPromptApiAvailability = async () => {
    console.log('=== Testing Prompt API Availability ===');

    try {
        // Check if LanguageModel is available
        if (!window.LanguageModel) {
            console.error('❌ LanguageModel not available in window');
            return false;
        }

        console.log('✅ LanguageModel found in window');

        // Check availability for text-only inputs
        const textAvailability = await window.LanguageModel.availability({
            expectedInputs: [{ type: 'text' }]
        });

        console.log(`� Text-only availability: ${textAvailability}`);

        // Check availability for multimodal inputs
        const { checkMultimodalAvailability } = await import('./promptApi');
        const multimodalAvailability = await checkMultimodalAvailability();

        console.log(`� Multimodal availability: ${multimodalAvailability}`);

        // Get model parameters
        const params = await window.LanguageModel.params();
        console.log('🔧 Model parameters:', params);

        return textAvailability === 'available' || textAvailability === 'downloadable';

    } catch (error) {
        console.error('❌ Error testing Prompt API:', error);
        return false;
    }
}; export const testCreateSession = async () => {
    console.log('=== Testing Session Creation ===');

    try {
        if (!window.LanguageModel) {
            throw new Error('LanguageModel not available');
        }

        const params = await window.LanguageModel.params();

        // Test text-only session
        console.log('Creating text-only session...');
        const textSession = await window.LanguageModel.create({
            temperature: params.defaultTemperature,
            topK: params.defaultTopK,
            expectedInputs: [{ type: 'text' }],
            expectedOutputs: [{ type: 'text' }]
        });

        console.log('✅ Text-only session created successfully');

        // Test the session with a simple prompt
        const response = await textSession.prompt('Say hello!');
        console.log('📝 Test response:', response);

        textSession.destroy();
        console.log('✅ Text session destroyed');

        // Test multimodal session
        console.log('Creating multimodal session...');
        const multimodalSession = await window.LanguageModel.create({
            temperature: params.defaultTemperature,
            topK: params.defaultTopK,
            expectedInputs: [{ type: 'image' }, { type: 'text' }],
            expectedOutputs: [{ type: 'text' }]
        });

        console.log('✅ Multimodal session created successfully');
        multimodalSession.destroy();
        console.log('✅ Multimodal session destroyed');

        return true;

    } catch (error) {
        console.error('❌ Error creating session:', error);
        return false;
    }
};

export const createTestImage = (): File => {
    // Create a simple test image (1x1 pixel red PNG)
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');

    if (ctx) {
        // Draw a simple test pattern
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, 50, 50);
        ctx.fillStyle = 'blue';
        ctx.fillRect(50, 0, 50, 50);
        ctx.fillStyle = 'green';
        ctx.fillRect(0, 50, 50, 50);
        ctx.fillStyle = 'yellow';
        ctx.fillRect(50, 50, 50, 50);

        // Add some text
        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        ctx.fillText('TEST', 35, 55);
    }

    return new Promise<File>((resolve) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(new File([blob], 'test-image.png', { type: 'image/png' }));
            }
        }, 'image/png');
    }) as any; // Type assertion for demo purposes
};

export const testImageDescription = async () => {
    console.log('=== Testing Image Description ===');

    try {
        // Test multimodal availability first
        const { checkMultimodalAvailability, describeFallback } = await import('./promptApi');
        const multimodalAvailability = await checkMultimodalAvailability();

        console.log('🔍 Multimodal availability:', multimodalAvailability);

        if (multimodalAvailability === 'unavailable') {
            console.log('📝 Testing fallback description...');

            // Test fallback functionality
            const fallbackResult = await describeFallback(
                'https://example.com/test-image.jpg',
                'Test Page',
                'https://example.com/test-page'
            );

            console.log('✅ Fallback description result:', fallbackResult);
            return true;
        } else {
            // Create test image
            const testImage = createTestImage();
            console.log('📷 Created test image:', testImage.name, testImage.size, 'bytes');

            // Test image description
            const { describeImage } = await import('./promptApi');

            console.log('🔍 Testing multimodal image description...');
            const description = await describeImage(
                testImage,
                'Describe this test image in detail.',
                (progress) => console.log(`Progress: ${progress}%`)
            );

            console.log('✅ Image description result:', description);
            return true;
        }

    } catch (error) {
        console.error('❌ Error testing image description:', error);
        return false;
    }
}; export const runAllTests = async () => {
    console.log('🚀 Starting Prompt API Tests...');
    console.log('');

    const results = {
        availability: false,
        sessionCreation: false,
        imageDescription: false
    };

    // Test 1: API Availability
    results.availability = await testPromptApiAvailability();
    console.log('');

    // Test 2: Session Creation (only if API is available)
    if (results.availability) {
        results.sessionCreation = await testCreateSession();
        console.log('');

        // Test 3: Image Description (only if sessions work)
        if (results.sessionCreation) {
            results.imageDescription = await testImageDescription();
            console.log('');
        }
    }

    // Summary
    console.log('=== Test Results Summary ===');
    console.log(`API Availability: ${results.availability ? '✅' : '❌'}`);
    console.log(`Session Creation: ${results.sessionCreation ? '✅' : '❌'}`);
    console.log(`Image Description: ${results.imageDescription ? '✅' : '❌'}`);

    const allPassed = Object.values(results).every(Boolean);
    console.log(`Overall: ${allPassed ? '✅ All tests passed!' : '❌ Some tests failed'}`);

    if (!results.availability) {
        console.log('');
        console.log('💡 Tips for fixing availability issues:');
        console.log('• Make sure you\'re using Chrome 129+ or Chrome Canary');
        console.log('• Enable experimental AI features in chrome://flags/');
        console.log('• Ensure you have user activation (click/tap before testing)');
    }

    return results;
};

// Make functions available globally for console testing
declare global {
    interface Window {
        testPromptApi: typeof runAllTests;
        testPromptApiAvailability: typeof testPromptApiAvailability;
        testCreateSession: typeof testCreateSession;
        testImageDescription: typeof testImageDescription;
    }
}

// Export for console access
if (typeof window !== 'undefined') {
    window.testPromptApi = runAllTests;
    window.testPromptApiAvailability = testPromptApiAvailability;
    window.testCreateSession = testCreateSession;
    window.testImageDescription = testImageDescription;
}