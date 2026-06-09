import { ActivityPanel } from './components/generation/activity-panel'
import { BatchConsole } from './components/generation/batch-console'
import { PresetBrowser } from './components/generation/preset-browser'
import { PromptComposer } from './components/generation/prompt-composer'
import { ReferenceUploader } from './components/generation/reference-uploader'
import { ResultGallery } from './components/generation/result-gallery'
import { SettingsPanel } from './components/generation/settings-panel'
import { AppShell } from './components/layout/app-shell'
import { useGenerationWorkspace } from './hooks/useGenerationWorkspace'

function App() {
  const workspace = useGenerationWorkspace()
  const activeBatch =
    workspace.batches.find((batch) => batch.id === workspace.currentBatchId) || null

  return (
    <AppShell>
      <div className="grid flex-1 grid-cols-1 gap-4 xl:grid-cols-[340px_minmax(0,1fr)_360px]">
        <aside className="grid content-start gap-4 xl:sticky xl:top-3">
          <ReferenceUploader
            reference={workspace.reference}
            error={workspace.referenceError}
            onChange={workspace.setReference}
            onError={workspace.setReferenceError}
          />
          <SettingsPanel settings={workspace.settings} onChange={workspace.setSettings} />
        </aside>

        <section className="grid content-start gap-4">
          <BatchConsole
            hasReference={Boolean(workspace.reference)}
            isRunning={workspace.isRunning}
            jobCount={workspace.pendingJobsCount}
            selectedPresets={workspace.selectedPresets}
            usesTemporaryKey={Boolean(workspace.settings.provider.apiKey)}
            workflowError={workspace.workflowError}
            onCancel={workspace.cancelGeneration}
            onStart={() => void workspace.startGeneration()}
            onTogglePreset={workspace.togglePreset}
          />

          <PromptComposer
            activePreset={workspace.activePreset}
            customPrompt={workspace.customPrompt}
            preserveIdentity={workspace.preserveIdentity}
            onCustomPromptChange={workspace.setCustomPrompt}
            onPreserveIdentityChange={workspace.setPreserveIdentity}
          />

          <ResultGallery
            batches={workspace.batches}
            currentBatchId={workspace.currentBatchId}
            filter={workspace.resultFilter}
            jobs={workspace.jobs}
            onFilterChange={workspace.setResultFilter}
            onRetryJob={(jobId) => void workspace.retryJob(jobId)}
            onReviewStatusChange={workspace.setJobReviewStatus}
          />
        </section>

        <aside className="grid content-start gap-4">
          <PresetBrowser
            presets={workspace.filteredPresets}
            selectedPresetIds={workspace.selectedPresetIds}
            query={workspace.presetQuery}
            onQueryChange={workspace.setPresetQuery}
            onTogglePreset={workspace.togglePreset}
          />
          <ActivityPanel
            batch={activeBatch}
            batches={workspace.batches}
            currentBatchId={workspace.currentBatchId}
            isRunning={workspace.isRunning}
            jobs={workspace.jobs}
            queueJobs={workspace.currentBatchJobs}
            onRetryFailed={() => void workspace.retryFailedJobs()}
            onClear={workspace.clearJobs}
            onSelectBatch={workspace.setCurrentBatchId}
          />
        </aside>
      </div>
    </AppShell>
  )
}

export default App
