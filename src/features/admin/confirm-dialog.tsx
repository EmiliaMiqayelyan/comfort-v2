"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils";

type ConfirmOptions = {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
};

type ConfirmState = ConfirmOptions & {
  resolve: (confirmed: boolean) => void;
};

export function useConfirmDialog() {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ ...options, resolve });
    });
  }, []);

  const close = useCallback((confirmed: boolean) => {
    state?.resolve(confirmed);
    setState(null);
  }, [state]);

  const dialog = state ? (
    <Dialog.Root open onOpenChange={(open) => !open && close(false)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2",
            "rounded-2xl border border-border bg-white p-6 shadow-2xl outline-none",
          )}
        >
          <Dialog.Title className="text-lg font-semibold text-foreground">
            {state.title}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {state.description}
          </Dialog.Description>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => close(false)}
            >
              {state.cancelLabel}
            </Button>
            <Button
              type="button"
              className="rounded-xl bg-red-500 text-white hover:bg-red-500/90"
              onClick={() => close(true)}
            >
              {state.confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  ) : null;

  return { confirm, dialog };
}

export function useAdminDelete() {
  const t = useTranslations("admin");
  const { confirm, dialog } = useConfirmDialog();
  const [error, setError] = useState<string | null>(null);

  const deleteWithConfirm = useCallback(
    async (action: () => Promise<void>) => {
      const ok = await confirm({
        title: t("delete"),
        description: t("confirmDelete"),
        confirmLabel: t("delete"),
        cancelLabel: t("cancel"),
      });
      if (!ok) return false;
      try {
        await action();
        setError(null);
        return true;
      } catch (err) {
        setError(t("saveError"));
        return false;
      }
    },
    [confirm, t],
  );

  return { deleteWithConfirm, dialog, error, setError };
}
