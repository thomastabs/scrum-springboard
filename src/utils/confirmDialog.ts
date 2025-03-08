
import { toast } from "sonner";

export const confirmDialog = (title: string, message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    toast(title, {
      description: message,
      action: {
        label: "Confirm",
        onClick: () => resolve(true),
      },
      cancel: {
        label: "Cancel",
        onClick: () => resolve(false),
      },
      duration: 10000,
    });
  });
};
