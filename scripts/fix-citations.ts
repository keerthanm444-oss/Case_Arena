// scripts/fix-citations.ts
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = process.cwd();
const CONTENT_DIRS = ['content/modules', 'content/cases', 'content/resources'];

function generateId(file: string, index: number) {
  const base = path.basename(file, '.mdx').replace(/[^a-z0-9]/gi, '-').toLowerCase();
  return `generated-${base}-${index}`;
}

function fixFile(absPath: string) {
  const rel = path.relative(ROOT, absPath);
  const raw = fs.readFileSync(absPath, 'utf8');
  const { data: fm, content } = matter(raw);
  const citations: any[] = [];
  let changed = false;
  // unify source -> citations
  if (fm.source && !Array.isArray(fm.citations)) {
    fm.citations = [fm.source];
    delete fm.source;
    changed = true;
  }
  const srcCits = Array.isArray(fm.citations) ? fm.citations : [];
  srcCits.forEach((c, i) => {
    const citation = { ...c };
    if (!citation.id) {
      citation.id = generateId(rel, i + 1);
      changed = true;
    }
    if (!citation.type) {
      citation.type = 'generic';
      changed = true;
    }
    if (!citation.publisher) {
      citation.publisher = 'unknown';
      changed = true;
    }
    if (!citation.title) {
      citation.title = 'Untitled';
      changed = true;
    }
    citations.push(citation);
  });
  if (changed) {
    fm.citations = citations;
    const newRaw = matter.stringify(content, fm);
    // backup original
    fs.writeFileSync(absPath + '.bak', raw);
    fs.writeFileSync(absPath, newRaw);
    console.log(`Fixed ${rel}`);
  }
}

function walk() {
  for (const dir of CONTENT_DIRS) {
    const absDir = path.join(ROOT, dir);
    if (!fs.existsSync(absDir)) continue;
    const entries = fs.readdirSync(absDir, { withFileTypes: true });
    for (const e of entries) {
      if (e.isFile() && e.name.endsWith('.mdx')) {
        fixFile(path.join(absDir, e.name));
      }
    }
  }
}

walk();
