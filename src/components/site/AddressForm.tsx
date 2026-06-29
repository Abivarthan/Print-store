import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export type AddressFormValue = {
  label: string;
  contactName: string;
  contactPhone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
};

export const emptyAddress: AddressFormValue = {
  label: "Home",
  contactName: "",
  contactPhone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "IN",
  isDefault: false,
};

export function AddressForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save address",
  submitting = false,
}: {
  initial?: Partial<AddressFormValue>;
  onSubmit: (v: AddressFormValue) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  submitting?: boolean;
}) {
  const [v, setV] = useState<AddressFormValue>({ ...emptyAddress, ...initial });

  useEffect(() => {
    setV({ ...emptyAddress, ...initial });
  }, [initial]);

  function update<K extends keyof AddressFormValue>(k: K, val: AddressFormValue[K]) {
    setV((prev) => ({ ...prev, [k]: val }));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(v);
      }}
      className="space-y-5"
    >
      <div className="grid grid-cols-2 gap-4">
        <Field label="Label" value={v.label} onChange={(x) => update("label", x)} required maxLength={40} />
        <Field
          label="Contact name"
          value={v.contactName}
          onChange={(x) => update("contactName", x)}
          required
          maxLength={80}
        />
      </div>
      <Field
        label="Phone"
        value={v.contactPhone}
        onChange={(x) => update("contactPhone", x)}
        required
        maxLength={20}
        pattern="^\+?[0-9 ()-]{8,20}$"
      />
      <Field
        label="Address line 1"
        value={v.line1}
        onChange={(x) => update("line1", x)}
        required
        maxLength={120}
      />
      <Field
        label="Address line 2"
        value={v.line2}
        onChange={(x) => update("line2", x)}
        maxLength={120}
      />
      <div className="grid grid-cols-2 gap-4">
        <Field label="City" value={v.city} onChange={(x) => update("city", x)} required maxLength={60} />
        <Field label="State" value={v.state} onChange={(x) => update("state", x)} required maxLength={60} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field
          label="PIN code"
          value={v.pincode}
          onChange={(x) => update("pincode", x.replace(/\D/g, "").slice(0, 6))}
          required
          pattern="\d{6}"
          inputMode="numeric"
        />
        <Field label="Country" value={v.country} onChange={(x) => update("country", x.toUpperCase().slice(0, 2))} required />
      </div>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={v.isDefault}
          onChange={(e) => update("isDefault", e.target.checked)}
          className="accent-[oklch(0.8_0.16_86)]"
        />
        Make this my default shipping address
      </label>

      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-muted-foreground">
            Cancel
          </button>
        )}
        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={submitting}
          className="px-5 py-2.5 rounded-full bg-gold text-ink text-sm font-medium disabled:opacity-50"
        >
          {submitting ? "Saving…" : submitLabel}
        </motion.button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  pattern,
  maxLength,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  pattern?: string;
  maxLength?: number;
  inputMode?: "text" | "numeric" | "tel" | "email";
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        pattern={pattern}
        maxLength={maxLength}
        inputMode={inputMode}
        className="mt-1 w-full bg-transparent border-b border-border focus:border-gold/60 py-2 outline-none text-sm"
      />
    </label>
  );
}
