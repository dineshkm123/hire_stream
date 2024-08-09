import { toast } from "react-toastify";

export const notifyErr = (message, theme, hideProgressBar) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 1000,
    hideProgressBar,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme,
  });
};
export const notify = (message, theme, hideProgressBar) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 1000,
    hideProgressBar,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme,
  });
};
