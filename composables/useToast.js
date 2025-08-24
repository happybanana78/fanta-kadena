import Toastify from 'toastify-js';
import "toastify-js/src/toastify.css";

export const useToast = (text, color) => {
    Toastify({
        text: text,
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
            background: color,
        },
    }).showToast();
}
