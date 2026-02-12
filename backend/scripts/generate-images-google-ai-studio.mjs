import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Modality } from '@google/genai';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      continue;
    }

    const key = token.slice(2);
    const nextToken = argv[index + 1];
    if (!nextToken || nextToken.startsWith('--')) {
      parsed[key] = true;
      continue;
    }

    parsed[key] = nextToken;
    index += 1;
  }

  return parsed;
}

function toSafeFilename(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function extensionFromMime(mimeType) {
  if (!mimeType || !mimeType.includes('/')) {
    return 'png';
  }

  const raw = mimeType.split('/')[1].toLowerCase();
  if (raw === 'jpeg') {
    return 'jpg';
  }

  return raw;
}

async function ensureDirectory(directoryPath) {
  await fs.mkdir(directoryPath, { recursive: true });
}

async function readPromptItems(promptFilePath) {
  const raw = await fs.readFile(promptFilePath, 'utf8');
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error('El archivo de prompts debe ser un arreglo JSON.');
  }

  return parsed;
}

async function generateImage({ ai, model, prompt }) {
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE]
    }
  });

  const parts = response?.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((part) => part.inlineData?.data);
  const textPart = parts.find((part) => part.text);

  if (!imagePart) {
    throw new Error('No se recibio imagen en la respuesta del modelo.');
  }

  return {
    base64Data: imagePart.inlineData.data,
    mimeType: imagePart.inlineData.mimeType ?? 'image/png',
    note: textPart?.text ?? null
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const model = String(args.model ?? process.env.GOOGLE_IMAGE_MODEL ?? 'gemini-2.5-flash-image-preview');
  const promptFilePath = path.resolve(projectRoot, String(args.prompts ?? 'scripts/grillerz-image-prompts.json'));
  const outputDirectory = path.resolve(projectRoot, String(args.out ?? '../assets/images/generated'));
  const limit = args.limit ? Number(args.limit) : Number.POSITIVE_INFINITY;

  const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
  if (!apiKey) {
    throw new Error('Falta GOOGLE_AI_STUDIO_API_KEY en variables de entorno.');
  }

  const prompts = await readPromptItems(promptFilePath);
  const promptItems = prompts.slice(0, Number.isFinite(limit) ? limit : prompts.length);

  if (promptItems.length === 0) {
    throw new Error('No hay prompts para generar.');
  }

  await ensureDirectory(outputDirectory);

  const ai = new GoogleGenAI({ apiKey });
  const manifest = [];

  console.log(`Generando ${promptItems.length} imagen(es) con modelo ${model}...`);

  for (let index = 0; index < promptItems.length; index += 1) {
    const item = promptItems[index];
    const id = item.id ? String(item.id) : `image-${index + 1}`;
    const prompt = String(item.prompt ?? '').trim();

    if (!prompt) {
      throw new Error(`Prompt vacio en item ${id}.`);
    }

    const { base64Data, mimeType, note } = await generateImage({ ai, model, prompt });
    const extension = extensionFromMime(mimeType);
    const filename = `${String(index + 1).padStart(2, '0')}-${toSafeFilename(id)}.${extension}`;
    const absolutePath = path.join(outputDirectory, filename);

    await fs.writeFile(absolutePath, Buffer.from(base64Data, 'base64'));

    manifest.push({
      id,
      file: filename,
      mimeType,
      prompt
    });

    console.log(`[${index + 1}/${promptItems.length}] ${filename}`);
    if (note) {
      console.log(`  nota: ${note}`);
    }
  }

  const manifestPath = path.join(outputDirectory, 'manifest.json');
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  console.log(`Listo. Manifest: ${manifestPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
