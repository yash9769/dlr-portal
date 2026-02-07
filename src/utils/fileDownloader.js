
import { Capacitor, registerPlugin } from '@capacitor/core';

// Define the custom native plugin
const FileDownloader = registerPlugin('FileDownloader');

/**
 * Enhanced file downloader that uses a custom Native Plugin on Mobile
 * and standard DOM APIs on Web.
 * 
 * @param {Blob|string} data - The file data (Blob for web/mobile, or Base64 string)
 * @param {string} filename - The name of the file to save
 * @param {string} mimeType - The MIME type of the file
 */
export const downloadFile = async (data, filename, mimeType) => {
    try {
        if (Capacitor.isNativePlatform()) {
            // --- MOBILE IMPLEMENTATION (Custom Native Plugin) ---

            // 1. Ensure we have base64 data
            let base64Data = data;
            if (data instanceof Blob) {
                base64Data = await blobToBase64(data);
            }
            // Remove data URI prefix if present for uniformity, though plugin handles it too
            // Plugin expects just the b64 string or data uri

            await FileDownloader.download({
                data: base64Data,
                filename: filename,
                mimeType: mimeType
            });

        } else {
            // --- WEB IMPLEMENTATION ---
            let blob = data;
            if (!(data instanceof Blob)) {
                blob = base64ToBlob(data, mimeType);
            }

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();

            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);
        }
        return true;
    } catch (error) {
        console.error('Download failed:', error);
        alert(`Download failed: ${error.message || error}`);
        return false;
    }
};

// Helper: Convert Blob to Base64
const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result); // returns data:application/xxx;base64,....
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

// Helper: Convert Base64 (without prefix) to Blob
const base64ToBlob = (base64, mimeType) => {
    const base64Clean = base64.includes(',') ? base64.split(',')[1] : base64;
    const byteCharacters = atob(base64Clean);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
};
