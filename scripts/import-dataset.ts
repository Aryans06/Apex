/**
 * Import candidates from candidates.jsonl into the SQLite database.
 *
 * Usage:
 *   npx tsx scripts/import-dataset.ts [--limit 5000] [--file ./data_set/candidates.jsonl]
 *
 * Defaults: limit=5000, file=./data_set/candidates.jsonl
 */

import { createReadStream } from "fs";
import { createInterface } from "readline";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const args = process.argv.slice(2);
const limitIdx = args.indexOf("--limit");
const fileIdx = args.indexOf("--file");
const LIMIT = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : 5000;
const FILE = fileIdx !== -1 ? args[fileIdx + 1] : "./data_set/candidates.jsonl";

function formatDuration(startDate: string | null, endDate: string | null, isCurrent: boolean): string {
  if (!startDate) return "";
  const start = startDate.substring(0, 4);
  const end = isCurrent ? "Present" : (endDate ? endDate.substring(0, 4) : "Present");
  return `${start}–${end}`;
}

async function main() {
  console.log(`Importing up to ${LIMIT.toLocaleString()} candidates from ${FILE}…`);

  // Clear existing data
  await db.candidate.deleteMany();
  console.log("Cleared existing candidates.");

  const filePath = resolve(process.cwd(), FILE);
  const rl = createInterface({ input: createReadStream(filePath), crlfDelay: Infinity });

  let count = 0;
  let batch: any[] = [];
  const BATCH_SIZE = 100;

  async function flushBatch() {
    for (const c of batch) {
      await db.candidate.create({ data: c });
    }
    batch = [];
  }

  for await (const line of rl) {
    if (count >= LIMIT) break;
    const trimmed = line.trim();
    if (!trimmed) continue;

    let raw: any;
    try {
      raw = JSON.parse(trimmed);
    } catch {
      continue;
    }

    const profile = raw.profile ?? {};
    const signals = raw.redrob_signals ?? {};
    const careerHistory = raw.career_history ?? [];
    const education = raw.education ?? [];
    const skills = raw.skills ?? [];

    const candidateData = {
      candidateId: raw.candidate_id,
      name: profile.anonymized_name || "Unknown",
      headline: profile.headline || null,
      role: profile.current_title || "Unknown",
      summary: profile.summary || "",
      skills: JSON.stringify(
        skills.map((s: any) => ({
          name: s.name,
          proficiency: s.proficiency || "intermediate",
          endorsements: s.endorsements || 0,
          duration_months: s.duration_months || 0,
        }))
      ),
      location: profile.location || null,
      country: profile.country || null,
      isProcessed: true,
      yearsOfExperience: profile.years_of_experience ?? null,
      currentCompany: profile.current_company || null,
      currentCompanySize: profile.current_company_size || null,
      currentIndustry: profile.current_industry || null,
      githubUrl: signals.github_activity_score > 0 ? null : null, // no URL in dataset
      portfolioUrl: null,
      redrobSignals: JSON.stringify(signals),
      experiences: {
        create: careerHistory.slice(0, 6).map((exp: any) => ({
          role: exp.title || "",
          company: exp.company || "",
          duration: formatDuration(exp.start_date, exp.end_date, exp.is_current),
          startDate: exp.start_date || null,
          endDate: exp.end_date || null,
          durationMonths: exp.duration_months ?? null,
          isCurrent: exp.is_current ?? false,
          industry: exp.industry || null,
          companySize: exp.company_size || null,
          description: exp.description || "",
          bullets: JSON.stringify([]),
        })),
      },
      education: {
        create: education.slice(0, 3).map((ed: any) => ({
          institution: ed.institution || "",
          degree: ed.degree || "",
          fieldOfStudy: ed.field_of_study || null,
          startYear: ed.start_year ?? null,
          endYear: ed.end_year ?? null,
          grade: ed.grade || null,
          tier: ed.tier || null,
        })),
      },
    };

    batch.push(candidateData);
    count++;

    if (batch.length >= BATCH_SIZE) {
      await flushBatch();
      process.stdout.write(`\r  Imported ${count.toLocaleString()} / ${LIMIT.toLocaleString()}…`);
    }
  }

  if (batch.length > 0) {
    await flushBatch();
  }

  console.log(`\nDone. Imported ${count.toLocaleString()} candidates.`);
  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
