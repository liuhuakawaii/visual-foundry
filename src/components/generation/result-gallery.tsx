import { DownloadSimple, ImageBroken, ImagesSquare } from '@phosphor-icons/react'
import type { GenerationJob } from '../../types/generation'
import { Button } from '../ui/button'

interface ResultGalleryProps {
  jobs: GenerationJob[]
}

function downloadImage(url: string, fileName: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
}

export function ResultGallery({ jobs }: ResultGalleryProps) {
  const completedJobs = jobs.filter((job) => job.status === 'completed' && job.imageUrl)
  const failedJobs = jobs.filter((job) => job.status === 'failed')

  return (
    <section className="rounded-md border border-stone-900/10 bg-white/72 p-4 shadow-[0_24px_50px_-42px_rgba(60,44,31,0.58)] backdrop-blur">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-stone-950">结果画廊</h2>
          <p className="mt-1 text-xs leading-5 text-stone-500">完成后可以逐张审片、下载，失败结果会保留错误信息。</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#f0e4d0] text-[#7c5f3f]">
          <ImagesSquare size={19} weight="duotone" />
        </span>
      </div>

      {completedJobs.length === 0 && failedJobs.length === 0 ? (
        <div className="grid min-h-[360px] place-items-center rounded-md border border-dashed border-stone-900/12 bg-[#f9f7f3] px-6 text-center">
          <div>
            <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-white text-[#476653]">
              <ImagesSquare size={24} weight="duotone" />
            </span>
            <p className="text-sm font-semibold text-stone-900">还没有生成结果</p>
            <p className="mt-2 max-w-sm text-xs leading-5 text-stone-500">上传参考图、选择预设并开始生成后，这里会显示输出图片。</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {completedJobs.map((job) => (
            <article key={job.id} className="overflow-hidden rounded-md border border-stone-900/10 bg-white">
              <img src={job.imageUrl} alt={`${job.presetTitle} 生成结果`} className="aspect-[4/5] w-full object-cover" />
              <div className="p-3">
                <p className="truncate text-sm font-semibold text-stone-950">{job.presetTitle}</p>
                <Button
                  className="mt-3 w-full"
                  icon={<DownloadSimple size={17} />}
                  onClick={() => downloadImage(job.imageUrl || '', `${job.presetTitle}-${job.id}.png`)}
                >
                  下载
                </Button>
              </div>
            </article>
          ))}
          {failedJobs.map((job) => (
            <article key={job.id} className="rounded-md border border-rose-900/15 bg-rose-50 p-3">
              <div className="flex items-center gap-2 text-rose-800">
                <ImageBroken size={18} weight="duotone" />
                <p className="text-sm font-semibold">{job.presetTitle}</p>
              </div>
              <p className="mt-2 text-xs leading-5 text-rose-700">{job.error || '生成失败。'}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
