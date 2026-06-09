import { ActivityPanel } from './components/generation/activity-panel'
import { BatchConsole } from './components/generation/batch-console'
import { PresetBrowser } from './components/generation/preset-browser'
import { PromptComposer } from './components/generation/prompt-composer'
import { ReferenceUploader } from './components/generation/reference-uploader'
import { ResultGallery } from './components/generation/result-gallery'
import { SettingsPanel } from './components/generation/settings-panel'
import { AppShell } from './components/layout/app-shell'
import { presetPacks, workflowTemplates } from './data/preset-packs'
import { useGenerationWorkspace } from './hooks/useGenerationWorkspace'

function App() {
  const workspace = useGenerationWorkspace()
  const activeBatch =
    workspace.batches.find((batch) => batch.id === workspace.currentBatchId) || null

  return (
    <AppShell>
      <div className="grid flex-1 grid-cols-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)] 2xl:grid-cols-[320px_minmax(0,1fr)_380px]">
        <aside className="order-2 grid content-start gap-3 xl:order-none xl:sticky xl:top-3">
          <ReferenceUploader
            reference={workspace.reference}
            error={workspace.referenceError}
            onChange={workspace.setReference}
            onError={workspace.setReferenceError}
          />
          <SettingsPanel settings={workspace.settings} onChange={workspace.setSettings} />
        </aside>

        <section className="order-1 grid min-w-0 content-start gap-4 xl:order-none">
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

        <aside className="order-3 grid min-w-0 content-start gap-3 2xl:order-none 2xl:sticky 2xl:top-3">
          <PresetBrowser
            activePackId={workspace.activePackId}
            activeTag={workspace.activeTag}
            activeWorkflowTemplateId={workspace.activeWorkflowTemplateId}
            availableTags={workspace.availableTags}
            packs={presetPacks}
            presets={workspace.filteredPresets}
            selectedPresetIds={workspace.selectedPresetIds}
            query={workspace.presetQuery}
            workflowTemplates={workflowTemplates}
            onPackChange={workspace.setActivePackId}
            onQueryChange={workspace.setPresetQuery}
            onTagChange={workspace.setActiveTag}
            onTogglePreset={workspace.togglePreset}
            onWorkflowTemplateChange={workspace.setActiveWorkflowTemplateId}
          />
        </aside>

        <div className="order-4 xl:col-start-2 2xl:order-none 2xl:col-start-3">
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
        </div>
      </div>
    </AppShell>
  )
}

export default App
