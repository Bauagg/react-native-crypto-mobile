import type { AccountMode } from '@/client/transactions/types';

import { SegmentedControl } from './segmented-control';

const MODES: { value: AccountMode; label: string }[] = [
  { value: 'DEMO', label: 'Demo' },
  { value: 'LIVE', label: 'Live' },
];

/** Pilihan mode akun (Demo / Live) untuk layar Asset, Riwayat, dan Dasbor. */
export function ModeSwitch({
  value,
  onChange,
}: {
  value: AccountMode;
  onChange: (mode: AccountMode) => void;
}) {
  return <SegmentedControl options={MODES} value={value} onChange={onChange} />;
}
