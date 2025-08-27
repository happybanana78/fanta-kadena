import {useToast} from "./useToast.js";

export const useCopyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        useToast('Copied to clipboard', 'green');
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
}
