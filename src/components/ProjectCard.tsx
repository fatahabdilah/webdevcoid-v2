import Image from "next/image";
import type { Project } from "@/content/portfolio";
import { ArrowButton } from "./ArrowButton";
import { noOrphan } from "@/lib/text";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="flex w-full flex-col rounded-3xl border border-grey-07 bg-grey-09 p-2 shadow-[var(--shadow-card)] md:gap-2 lg:min-h-[500px] lg:flex-row">
      {/* The image tilts toward the cursor (.hover-3d in globals.css) */}
      <div className="hover-3d h-80 w-full shrink-0 md:h-[400px] lg:h-[484px] lg:flex-1">
        <div className="rounded-2xl shadow-[inset_0_1px_13px_0_#fff]">
          <Image src={project.image} alt={`Tampilan website ${project.domain}`} fill sizes="(min-width: 1200px) 500px, (min-width: 800px) 640px, 100vw" className="object-cover" />
          <div className="absolute inset-0 z-[2] rounded-2xl shadow-[inset_0_0_40px_0_rgba(255,255,255,0.4),inset_0_0_12px_0_#fff]" />
        </div>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} aria-hidden />
        ))}
      </div>

      <div className="flex flex-col gap-8 p-6 sm:gap-10 sm:p-8 md:gap-16 md:px-12 md:pt-6 md:pb-12 lg:h-[484px] lg:flex-1 lg:justify-between lg:gap-6 lg:p-10">
        <div className="flex flex-col gap-6 lg:gap-10">
          <span className="t-body-m-semibold flex h-6 items-center self-start text-grey-01 md:h-8">
            {project.type} · {project.domain}
          </span>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h3 className="t-title-m text-grey-01 sm:t-title-l lg:t-h6">{noOrphan(project.title)}</h3>
              <p className="t-body-m text-balance text-grey-03 md:text-pretty lg:text-balance">{noOrphan(project.description)}</p>
            </div>
            <div>
              <ArrowButton href={project.url} tone="outline">
                Kunjungi Situs
              </ArrowButton>
            </div>
          </div>
        </div>

        <dl className="flex gap-4">
          {project.stats.map((s) => (
            <div key={s.label} className="flex flex-1 flex-col gap-1">
              <dt className="t-title-l text-grey-01">{s.value}</dt>
              <dd className="t-body-m">{noOrphan(s.label)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}
