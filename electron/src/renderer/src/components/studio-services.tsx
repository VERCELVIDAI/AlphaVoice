import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { getBridge } from '@/components/bridge';
import { runRendererTask } from '@/lib/global-error-recovery';
import { router } from '@/router';
import { NativeDictationSync } from '@/hooks/use-native-dictation';
import { ModelInstallSync } from '@/hooks/use-model-install-sync';
import { RealtimeEventSync } from '@/hooks/use-realtime-events';
import { GenerateBudgetSync } from '@/hooks/use-generate-budget-sync';
import { CloudSyncRuntime } from '@/features/account/cloud-sync-runtime';
import { GpuOfferBanner } from '@/components/gpu-offer';
import { FirstSoundHandoff } from '@/components/first-sound-handoff';
import { ModelLicenceGate } from '@/features/settings/model-licence-acceptance';

const notifiedUpdates = new Set<string>();

export function UpdateNotifier() {
  const { t } = useTranslation();
  useEffect(() => {
    const updates = getBridge()?.updates;
    if (!updates) return;
    return updates.onState((state) => {
      if (
        (state.status !== 'available' && state.status !== 'downloaded') ||
        !state.availableVersion ||
        notifiedUpdates.has(state.availableVersion)
      )
        return;
      notifiedUpdates.add(state.availableVersion);
      toast.info(t('update.toast_available', { version: state.availableVersion }), {
        action: {
          label: t('common.open'),
          onClick: () =>
            runRendererTask('Navigate to updates', () =>
              router.navigate({ to: '/settings/updates' }),
            ),
        },
      });
    });
  }, [t]);
  return null;
}

export function StudioServices() {
  return (
    <>
      <UpdateNotifier />
      <NativeDictationSync />
      <ModelInstallSync />
      <RealtimeEventSync />
      <GenerateBudgetSync />
      <CloudSyncRuntime />
      <GpuOfferBanner />
      <FirstSoundHandoff />
      <ModelLicenceGate />
    </>
  );
}
