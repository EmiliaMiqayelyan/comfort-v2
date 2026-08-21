"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Textarea } from "@/components/atoms/textarea";
import { Label } from "@/components/atoms/label";
import { cn } from "@/lib/utils";
import { sendContact } from "@/lib/api";

const contactSchema = z.object({
  name: z.string().min(2, "Required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().min(10, "Too short"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactForm({ className }: { className?: string }) {
  const t = useTranslations("contact");
  const tc = useTranslations("common");
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setSubmitError(false);
    try {
      await sendContact(data);
      setSubmitted(true);
      reset();
    } catch {
      setSubmitError(true);
    }
  };

  if (submitted) {
    return (
      <div
        className={cn(
          "rounded-3xl border border-border bg-card p-8 text-center shadow-soft md:p-12",
          className,
        )}
      >
        <p className="display text-xl text-foreground md:text-2xl">
          {t("success")}
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-6"
          onClick={() => setSubmitted(false)}
        >
          {t("send")}
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn(
        "space-y-6 rounded-3xl border border-border bg-card p-6 shadow-soft md:p-10",
        className,
      )}
      noValidate
    >
      <h2 className="display text-2xl text-foreground md:text-3xl">
        {t("formTitle")}
      </h2>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">
            {t("name")} <span className="text-accent">*</span>
          </Label>
          <Input
            id="name"
            autoComplete="name"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            {t("email")} <span className="text-accent">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">{t("phone")}</Label>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            {...register("phone")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">{t("company")}</Label>
          <Input id="company" autoComplete="organization" {...register("company")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">
          {t("message")} <span className="text-accent">*</span>
        </Label>
        <Textarea
          id="message"
          rows={5}
          aria-invalid={!!errors.message}
          {...register("message")}
        />
        {errors.message && (
          <p className="text-xs text-destructive">{errors.message.message}</p>
        )}
      </div>

      {submitError && (
        <p className="text-sm text-destructive">{tc("error")}</p>
      )}

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? tc("loading") : t("send")}
      </Button>
    </form>
  );
}
