"use client";

import { Gift, Loader2, Save } from "lucide-react";
import type { ReferralSettings } from "@/lib/services/settings/settings-service";
import type { ActionFeedback } from "@/lib/services/settings/types";

type ReferralSettingsCardProps = {
  value: ReferralSettings;
  onChange: (value: ReferralSettings) => void;
  onSave: () => Promise<void>;
  feedback: ActionFeedback;
  saving: boolean;
};

function centsToReais(cents: number) {
  return String((cents / 100).toFixed(2)).replace(".", ",");
}

function reaisToCents(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return 0;
  return Number(digits);
}

function ToggleRow({
  checked,
  label,
  description,
  onChange,
}: {
  checked: boolean;
  label: string;
  description: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-xl border border-[var(--border)] bg-white px-3 py-3 dark:bg-slate-950">
      <span className="space-y-1">
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block text-xs text-slate-500 dark:text-slate-400">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 accent-emerald-600"
      />
    </label>
  );
}

export function ReferralSettingsCard({
  value,
  onChange,
  onSave,
  feedback,
  saving,
}: ReferralSettingsCardProps) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-slate-50/70 p-4 dark:bg-slate-900/30">
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-xl bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
          <Gift className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold">Programa de indicacoes</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Controle o que aparece no app e os valores usados nas recompensas.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ToggleRow
          checked={value.enabled}
          label="Ativar indicacoes"
          description="Liga ou desliga todo o programa no app mobile."
          onChange={(enabled) => onChange({ ...value, enabled })}
        />
        <ToggleRow
          checked={value.showEntryPoint}
          label="Mostrar card/botao no app"
          description="Exibe o acesso de indicacoes na tela de configuracoes."
          onChange={(showEntryPoint) => onChange({ ...value, showEntryPoint })}
        />
        <ToggleRow
          checked={value.showRegisterInput}
          label="Mostrar codigo no cadastro"
          description="Exibe o input de codigo promocional/de indicacao."
          onChange={(showRegisterInput) => onChange({ ...value, showRegisterInput })}
        />
        <ToggleRow
          checked={value.requiresPaidSubscription}
          label="Exigir assinatura paga"
          description="Valida recompensa apenas apos compra/assinatura ativa."
          onChange={(requiresPaidSubscription) => onChange({ ...value, requiresPaidSubscription })}
        />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Bonus por indicacao</span>
          <input
            value={centsToReais(value.rewardCents)}
            onChange={(event) => onChange({ ...value, rewardCents: reaisToCents(event.target.value) })}
            inputMode="numeric"
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm dark:bg-slate-950"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Saque minimo</span>
          <input
            value={centsToReais(value.minimumWithdrawalCents)}
            onChange={(event) => onChange({ ...value, minimumWithdrawalCents: reaisToCents(event.target.value) })}
            inputMode="numeric"
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm dark:bg-slate-950"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => void onSave()}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-70"
        >
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          Salvar indicacoes
        </button>
        {feedback.message && (
          <p className={`text-xs ${feedback.state === "error" ? "text-red-600" : "text-emerald-600"}`}>
            {feedback.message}
          </p>
        )}
      </div>
    </div>
  );
}
