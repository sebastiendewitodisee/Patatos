import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const frLocalePath = path.join(rootDir, "src/i18n/locales/fr.json");
const nlLocalePath = path.join(rootDir, "src/i18n/locales/nl.json");

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function flattenObject(value, prefix = "", output = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return output;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    if (nestedValue && typeof nestedValue === "object" && !Array.isArray(nestedValue)) {
      flattenObject(nestedValue, nextPrefix, output);
    } else {
      output[nextPrefix] = nestedValue;
    }
  }

  return output;
}

function getInterpolationTokens(value) {
  if (typeof value !== "string") {
    return [];
  }

  const matches = [...value.matchAll(/{{\s*([a-zA-Z0-9_]+)\s*}}/g)].map((match) => match[1]);
  return [...new Set(matches)].sort();
}

function walkFiles(directory, extensions = [".js", ".jsx", ".ts", ".tsx"]) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const results = [];
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(fullPath, extensions));
      continue;
    }

    if (extensions.includes(path.extname(entry.name))) {
      results.push(fullPath);
    }
  }

  return results;
}

function relativeFromRoot(filePath) {
  return path.relative(rootDir, filePath).replace(/\\/g, "/");
}

function collectUsedI18nKeys(files) {
  const usedKeys = new Set();
  const regexes = [
    /\bt\(\s*["'`]([a-zA-Z0-9_.-]+)["'`]/g,
    /\bi18n\.t\(\s*["'`]([a-zA-Z0-9_.-]+)["'`]/g,
    /<Trans[^>]*\bi18nKey=["'`]([a-zA-Z0-9_.-]+)["'`]/g,
  ];

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    for (const regex of regexes) {
      let match;
      while ((match = regex.exec(content)) !== null) {
        usedKeys.add(match[1]);
      }
    }
  }

  return usedKeys;
}

function normalizeText(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function findLineNumber(content, index) {
  return content.slice(0, index).split(/\r?\n/).length;
}

function scanHardcodedFrenchUi(files) {
  const stringLiteralRegex = /(["'`])((?:\\.|(?!\1)[^\\\n]){3,})\1/g;
  const frenchHints = [
    "accueil",
    "equipe",
    "varietes",
    "organisation",
    "recolte",
    "preparation",
    "conservation",
    "periode",
    "responsable",
    "aucun",
    "retour",
    "mentions",
    "formulaire",
    "lien",
    "nhesitez",
    "meteo",
    "terrain",
    "planning central",
  ];

  const allowedFragments = [
    "sébastien",
    "sebastien",
    "patatos",
    "denis",
    "josh",
    "melvin",
    "desiree",
    "premiere",
    "recap-varietes",
  ];

  const findings = [];

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    let match;

    while ((match = stringLiteralRegex.exec(content)) !== null) {
      const literal = match[2].trim();
      if (!literal) {
        continue;
      }

      if (
        /^[a-z0-9_.-]+$/i.test(literal) ||
        /^[a-z0-9-]+(?: [a-z0-9-]+)*$/i.test(literal) ||
        literal.includes("/") ||
        literal.includes("${") ||
        /\.(png|jpe?g|webp|svg|css|js)$/i.test(literal)
      ) {
        continue;
      }

      const normalized = normalizeText(literal);
      if (allowedFragments.some((fragment) => normalized.includes(fragment))) {
        continue;
      }

      const looksFrench = frenchHints.some((hint) => normalized.includes(hint));
      const hasAccentedChars = /[À-ÿ]/.test(literal);
      const likelySentence = /\s/.test(literal);

      if (!likelySentence || (!looksFrench && !hasAccentedChars)) {
        continue;
      }

      findings.push({
        file: relativeFromRoot(file),
        line: findLineNumber(content, match.index),
        literal,
      });
    }
  }

  return findings;
}

async function collectDynamicDataKeys() {
  const planningModule = await import(pathToFileURL(path.join(rootDir, "src/data/planning.js")).href);
  const varietiesModule = await import(pathToFileURL(path.join(rootDir, "src/data/varieties.js")).href);
  const faqModule = await import(pathToFileURL(path.join(rootDir, "src/data/faq.js")).href);
  const teamModule = await import(pathToFileURL(path.join(rootDir, "src/data/team.js")).href);

  const keys = new Set();

  for (const event of planningModule.planningEvents ?? []) {
    for (const keyField of ["titleKey", "descriptionKey", "periodKey", "validationKey", "phaseKey"]) {
      const keyValue = event?.[keyField];
      if (typeof keyValue === "string" && keyValue.trim()) {
        keys.add(keyValue);
      }
    }
  }

  for (const option of planningModule.STATUS_OPTIONS ?? []) {
    if (option?.value) {
      keys.add(`status.${option.value}`);
    }
  }

  for (const phaseId of planningModule.PHASE_ORDER ?? []) {
    if (typeof phaseId === "string" && phaseId.trim()) {
      keys.add(`planning.phases.${phaseId}`);
    }
  }

  for (const typeId of Object.keys(planningModule.TYPE_META ?? {})) {
    keys.add(`planning.types.${typeId}`);
  }

  for (const item of varietiesModule.varieties ?? []) {
    for (const keyField of ["plantingKey", "harvestKey", "usageKey"]) {
      const keyValue = item?.[keyField];
      if (typeof keyValue === "string" && keyValue.trim()) {
        keys.add(keyValue);
      }
    }
  }

  for (const item of faqModule.faqItems ?? []) {
    for (const keyField of ["questionKey", "answerKey"]) {
      const keyValue = item?.[keyField];
      if (typeof keyValue === "string" && keyValue.trim()) {
        keys.add(keyValue);
      }
    }
  }

  for (const member of teamModule.teamMembers ?? []) {
    for (const keyField of ["roleKey", "taglineKey"]) {
      const keyValue = member?.[keyField];
      if (typeof keyValue === "string" && keyValue.trim()) {
        keys.add(keyValue);
      }
    }
  }

  return keys;
}

function printList(title, items) {
  console.log(`\n${title} (${items.length})`);
  if (!items.length) {
    console.log("  - OK");
    return;
  }

  for (const item of items) {
    if (typeof item === "string") {
      console.log(`  - ${item}`);
    } else {
      console.log(`  - ${item.file}:${item.line} -> ${item.literal}`);
    }
  }
}

async function main() {
  const frLocale = readJson(frLocalePath);
  const nlLocale = readJson(nlLocalePath);
  const frFlat = flattenObject(frLocale);
  const nlFlat = flattenObject(nlLocale);
  const frKeys = new Set(Object.keys(frFlat));
  const nlKeys = new Set(Object.keys(nlFlat));

  const sourceFiles = walkFiles(path.join(rootDir, "src"));
  const usedStaticKeys = collectUsedI18nKeys(sourceFiles);
  const dynamicDataKeys = await collectDynamicDataKeys();
  const requiredKeys = new Set([...usedStaticKeys, ...dynamicDataKeys]);

  const missingInFr = [...requiredKeys].filter((key) => !frKeys.has(key)).sort();
  const missingInNl = [...requiredKeys].filter((key) => !nlKeys.has(key)).sort();
  const frOnly = [...frKeys].filter((key) => !nlKeys.has(key)).sort();
  const nlOnly = [...nlKeys].filter((key) => !frKeys.has(key)).sort();

  const interpolationMismatches = [];
  for (const key of frKeys) {
    if (!nlKeys.has(key)) {
      continue;
    }

    const frTokens = getInterpolationTokens(frFlat[key]);
    const nlTokens = getInterpolationTokens(nlFlat[key]);
    if (JSON.stringify(frTokens) !== JSON.stringify(nlTokens)) {
      interpolationMismatches.push(
        `${key} | fr=[${frTokens.join(", ")}] nl=[${nlTokens.join(", ")}]`
      );
    }
  }

  const uiFiles = [
    ...walkFiles(path.join(rootDir, "src/pages")),
    ...walkFiles(path.join(rootDir, "src/components")),
  ];
  const hardcodedFrenchFindings = scanHardcodedFrenchUi(uiFiles);

  console.log("i18n check summary");
  console.log(`  static keys used: ${usedStaticKeys.size}`);
  console.log(`  dynamic data keys: ${dynamicDataKeys.size}`);
  console.log(`  required keys total: ${requiredKeys.size}`);

  printList("Missing keys in fr.json", missingInFr);
  printList("Missing keys in nl.json", missingInNl);
  printList("Keys present only in fr.json", frOnly);
  printList("Keys present only in nl.json", nlOnly);
  printList("Interpolation mismatches", interpolationMismatches);
  printList("Suspicious hardcoded FR UI strings", hardcodedFrenchFindings);

  const hasError =
    missingInFr.length > 0 ||
    missingInNl.length > 0 ||
    frOnly.length > 0 ||
    nlOnly.length > 0 ||
    interpolationMismatches.length > 0 ||
    hardcodedFrenchFindings.length > 0;

  if (hasError) {
    process.exitCode = 1;
    return;
  }

  console.log("\nAll i18n checks passed.");
}

main().catch((error) => {
  console.error("i18n check failed with an exception:");
  console.error(error);
  process.exit(1);
});
