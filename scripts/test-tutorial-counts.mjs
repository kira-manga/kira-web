import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import ts from 'typescript';

// Load the actual formatter and editable messages with the existing compiler; no build or server.
async function loadTypeScript(relativePath) {
  const source = await readFile(new URL(relativePath, import.meta.url), 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2017 },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}

const { formatTutorialCount } = await loadTypeScript('../src/lib/tutorial-counts.ts');
const { tutorialsPageCopy } = await loadTypeScript('../src/content/tutorials.ts');

test('guide and step messages cover English other and all Arabic cardinal forms with Arabic-Indic digits', () => {
  const messages = [tutorialsPageCopy.library.count, tutorialsPageCopy.library.steps];
  const cases = [
    [0, ['0 guides', '0 steps'], ['لا توجد شروحات', 'لا توجد خطوات']],
    [1, ['1 guide', '1 step'], ['شرح واحد', 'خطوة واحدة']],
    [2, ['2 guides', '2 steps'], ['شرحان', 'خطوتان']],
    [3, ['3 guides', '3 steps'], ['٣ شروحات', '٣ خطوات']],
    [11, ['11 guides', '11 steps'], ['١١ شرحًا', '١١ خطوة']],
    [100, ['100 guides', '100 steps'], ['١٠٠ شرح', '١٠٠ خطوة']],
    [102, ['102 guides', '102 steps'], ['١٠٢ شرح', '١٠٢ خطوة']],
  ];

  for (const [count, english, arabic] of cases) {
    for (const [language, expected] of [['en', english], ['ar', arabic]]) {
      for (const [index, message] of messages.entries()) {
        assert.equal(formatTutorialCount(count, language, message), expected[index], `${language}/${count}/${index}`);
      }
    }
  }
});
