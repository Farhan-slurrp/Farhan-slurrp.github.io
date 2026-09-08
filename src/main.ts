import './style.css';
import { marked } from 'marked';
import { descriptions, profile, sections, type Block, type Section } from './content';

const root = document.querySelector<HTMLDivElement>('#app') ?? document.body.appendChild(document.createElement('div'));
root.id = 'app';
let activeSection: Section = 'home';

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = ''): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  if (text) node.textContent = text;
  return node;
}

function render(section: Section): void {
  activeSection = section;
  shell();
  history.replaceState(null, '', `#${section}`);
}

function shell(): void {
  root.replaceChildren();
  const header = el('header', 'header');
  const brand = el('a', 'brand', 'FAN');
  brand.href = '#home';
  brand.addEventListener('click', (event) => { event.preventDefault(); render('home'); });
  header.append(brand, el('span', 'header-path', '~/portfolio'));

  const main = el('main', 'terminal');
  main.id = 'main-content';
  main.setAttribute('aria-live', 'polite');
  const next = followup();
  next.classList.add('hidden');
  const thought = agentThought(activeSection);
  const response = sectionView(activeSection);
  response.classList.add('hidden');
  main.append(transcript(sectionIntro(activeSection)), thought, response, next);

  root.append(main, header);
  window.setTimeout(() => {
    thought.classList.add('complete');
    thought.textContent = `+ Thought: preparing ${activeSection}`;
    window.clearInterval(Number(thought.dataset.spinner));
    response.classList.remove('hidden');
    const responseLines = response.querySelectorAll('.stream-line').length + response.children.length;
    window.setTimeout(() => {
      if (next.isConnected) {
        next.classList.remove('hidden');
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: reducedMotion ? 'auto' : 'smooth' });
      }
    }, Math.max(500, responseLines * 150));
  }, 1050);
}

function agentThought(section: Section): HTMLElement {
  const thought = el('p', 'thought');
  const spinner = el('span', 'thinking-dots', '⠋');
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let frame = 0;
  thought.append(spinner, document.createTextNode(` Thought: loading ${section}`));
  thought.dataset.spinner = String(window.setInterval(() => {
    frame = (frame + 1) % frames.length;
    spinner.textContent = frames[frame];
  }, 90));
  return thought;
}

function transcript(lines: string[]): HTMLElement {
  const block = el('div', 'transcript');
  lines.forEach((text, index) => {
    const line = el('p', `stream-line delay-${Math.min(index, 5)}`, text);
    block.append(line);
  });
  return block;
}

function sectionIntro(section: Section): string[] {
  if (section === 'home') return [];
  return [`→ Opened ${section}`];
}

function sectionView(section: Section): HTMLElement {
  const view = el('section', 'response');
  view.setAttribute('aria-label', `${section} section`);
  if (section !== 'home') view.append(question(descriptions[section]));
  profile.sections.find((item) => item.id === section)?.blocks?.forEach((block) => view.append(renderBlock(block)));
  const status = el('p', 'section-status');
  status.append(el('span', 'status-glyph', '▣'), document.createTextNode(' '), el('span', 'status-title', section[0].toUpperCase() + section.slice(1)), document.createTextNode(` · ${descriptions[section]}`));
  view.append(status);
  Array.from(view.children).forEach((child, index) => {
    (child as HTMLElement).style.animationDelay = `${index * 0.14}s`;
  });
  return view;
}

function question(text: string): HTMLElement { return el('p', 'question', text); }

function renderBlock(block: Block): HTMLElement {
  const content = el('div', 'markdown-content');
  content.innerHTML = marked.parse(block.text ?? '', { breaks: true }) as string;
  content.querySelectorAll<HTMLAnchorElement>('a').forEach((link) => {
    link.classList.add('contact-link');
    link.target = '_blank';
    link.rel = 'noreferrer';
  });
  content.querySelectorAll<HTMLElement>('pre code').forEach((code) => {
    const lines = code.textContent?.split('\n') ?? [];
    code.replaceChildren(...lines.map((line) => {
      const row = el('span', 'code-line', line || ' ');
      return row;
    }));
  });
  content.querySelectorAll<HTMLParagraphElement>('blockquote p').forEach((paragraph) => {
    if (paragraph.textContent?.trim() !== 'Cooking...') return;
    paragraph.replaceChildren(el('span', 'cooking-loader', 'Cooking...'));
  });
  return content;
}

function followup(): HTMLElement {
  const block = el('section', 'followup');
  block.setAttribute('aria-label', 'Choose next section');
  block.append(question('What should I show you next?'));
  sections.filter((section) => section !== activeSection).forEach((section, index) => {
    const row = el('div', 'choice-row');
    const option = el('button', 'option');
    option.type = 'button';
    option.append(el('span', 'option-number', `${index + 1}.`), el('span', 'option-label', section));
    option.addEventListener('click', () => render(section));
    row.append(option, el('span', 'option-description', descriptions[section]));
    block.append(row);
  });
  return block;
}

function openMenu(): void {
  if (document.querySelector('.menu-modal')) return;
  const backdrop = el('div', 'menu-backdrop');
  const dialog = el('section', 'menu-modal');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-label', 'Choose a portfolio section');
  dialog.append(question('Where should we go next?'));
  sections.forEach((section, index) => {
    const row = el('div', 'choice-row');
    const option = el('button', 'option');
    option.type = 'button';
    option.append(el('span', 'option-number', `${index + 1}.`), el('span', 'option-label', section));
    option.addEventListener('click', () => render(section));
    row.append(option, el('span', 'option-description', descriptions[section]));
    dialog.append(row);
  });
  backdrop.append(dialog);
  backdrop.addEventListener('mousedown', (event) => { if (event.target === backdrop) backdrop.remove(); });
  document.body.append(backdrop);
  dialog.querySelector<HTMLButtonElement>('.option')?.focus();
}

function execute(raw: string): void {
  const command = raw.trim().toLowerCase();
  if (!command) return;
  if (command === 'help') addOutput('commands: help · home · about · experience · stack · principles · contact · clear');
  else if (command === 'clear') document.querySelector('.command-output')?.remove();
  else if (sections.includes(command as Section)) render(command as Section);
  else addOutput(`command not found: ${command} · try help`);
}

function addOutput(text: string): void {
  const output = document.querySelector('.command-output') ?? (() => {
    const node = el('div', 'command-output');
    document.querySelector('.terminal')?.append(node);
    return node;
  })();
  output.append(el('p', 'stream-line', `› ${text}`));
}

const hash = location.hash.slice(1) as Section;
activeSection = sections.includes(hash) ? hash : 'home';
shell();
document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openMenu(); }
  if (event.key === 'Escape') document.querySelector('.menu-backdrop')?.remove();
});

export { execute };
