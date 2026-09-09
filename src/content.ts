import source from './content.yaml?raw';

export type Section = string;
export type Block = { text?: string };
type ConfigSection = { id: Section; description: string; status?: string; blocks?: Block[] };
type Config = { name: string; role: string; company: string; intro: string; sections: ConfigSection[] };

function parseConfig(text: string): Config {
  const config: Config = { name: '', role: '', company: '', intro: '', sections: [] };
  let section: ConfigSection | undefined;
  let block: Block | undefined;
  text.split('\n').forEach((line) => {
    const sectionMatch = line.match(/^\s+- id:\s+(.+)$/);
    if (sectionMatch) { section = { id: sectionMatch[1] as Section, description: '' }; config.sections.push(section); block = undefined; }
    const description = line.match(/^\s+description:\s+(.+)$/);
    if (description && section) section.description = description[1];
    const status = line.match(/^\s+status:\s+(.+)$/);
    if (status && section) section.status = status[1];
    const blockMatch = line.match(/^\s{6}- (?:(type):\s+)?(.+)$/);
    if (blockMatch && section) {
      section.blocks ??= [];
      const inlineText = blockMatch[2].match(/^text:\s+(.+)$/);
      const value = (inlineText?.[1] ?? blockMatch[2]).replace(/^['"]|['"]$/g, '').replaceAll('\\n', '\n');
      block = { text: value };
      section.blocks.push(block);
    }
  });
  return config;
}

export const profile = parseConfig(source);
export const sections = profile.sections.map((section) => section.id);
export const descriptions = Object.fromEntries(profile.sections.map((section) => [section.id, section.description])) as Record<Section, string>;
export const statuses = Object.fromEntries(profile.sections.map((section) => [section.id, section.status ?? section.description])) as Record<Section, string>;
