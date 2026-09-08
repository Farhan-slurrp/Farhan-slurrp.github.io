import source from './content.yaml?raw';

export type Section = 'home' | 'about' | 'experience' | 'stack' | 'principles' | 'contact';
export type Block = { text?: string };
type ConfigSection = { id: Section; description: string; blocks?: Block[] };
type Config = { name: string; role: string; company: string; intro: string; sections: ConfigSection[] };

function parseConfig(text: string): Config {
  const config = { name: '', role: '', company: '', intro: '', sections: [] } as Config;
  let section: ConfigSection | undefined;
  let block: Block | undefined;
  text.split('\n').forEach((line) => {
    const root = line.match(/^(name|role|company|intro):\s+(.+)$/);
    if (root) config[root[1] as 'name' | 'role' | 'company' | 'intro'] = root[2];
    const sectionMatch = line.match(/^\s+- id:\s+(.+)$/);
    if (sectionMatch) { section = { id: sectionMatch[1] as Section, description: '' }; config.sections.push(section); block = undefined; }
    const description = line.match(/^\s+description:\s+(.+)$/);
    if (description && section) section.description = description[1];
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
