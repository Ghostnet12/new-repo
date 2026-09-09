export const dreamVersion = '2026-09-09.1';
export const dreamMoods = ['Curious', 'Peaceful', 'Uneasy', 'Sad', 'Amazed', 'Mixed'];
export const dreamResearch = [
  {
    id: 'emotional-continuity',
    title: 'Dream feelings and waking life',
    text: 'Research has found similarities between emotional reactions in dreams and waking life, even when a dream’s events are unusual. This offers a reason to explore how the dream felt, without assuming what caused it.',
    citation: 'Kahn, 2019 · Frontiers in Psychology',
    url: 'https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2019.02676/full'
  },
  {
    id: 'memory-and-learning',
    title: 'Experiences can enter dreams',
    text: 'A learning study linked dreaming about a task with better performance after sleep. This is an association in a particular experiment, not proof that every dream has a purpose or a hidden message.',
    citation: 'Wamsley and colleagues, 2010 · Current Biology',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC2869395/'
  },
  {
    id: 'personal-reflection',
    title: 'Reflection can be personally useful',
    text: 'Research on dream discussion has examined people’s reported insight. Feeling that an interpretation fits is different from proving it is true. Your own associations are a starting point, and you can reject any suggestion.',
    citation: 'Edwards and colleagues, 2015 · Frontiers in Psychology',
    url: 'https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2015.00831/full'
  }
];

export function dreamTitle(text) {
  const first = text.trim().replace(/\s+/g, ' ').split(/[.!?\n]/)[0];
  return first.length > 75 ? first.slice(0, 72).trimEnd() + '…' : first || 'An untitled dream';
}

export function newDreamDraft() {
  return { entryId: null, text: '', mood: '', context: '', reflection: null, saved: false };
}

export function guidedDreamReflection(input, message = 'A guided reflection to begin with. The fuller AI reflection is unavailable right now.') {
  const feeling = input.mood ? `You described the dream as ${input.mood.toLowerCase()}. ` : '';
  return {
    version: dreamVersion,
    mode: 'guided',
    message,
    title: dreamTitle(input.text),
    summary: `${feeling}Start with the moment you remember most clearly. Consider what it brings to mind for you, and whether that feeling has appeared anywhere in your waking life. A dream alone cannot establish why you feel something or what will happen next.`,
    themes: [
      { label: 'What stayed with you', observation: 'Choose one image, person, place, or moment from your own description.', question: 'What is your first personal association with that detail?' },
      { label: input.context ? 'Your waking context' : 'The emotional thread', observation: input.context ? 'You included a waking-life note. Compare it with the dream without forcing a connection.' : 'The way you felt may offer a more useful starting point than a symbol dictionary.', question: input.context ? 'Does anything in your note feel connected, or do the two seem separate?' : 'Did the feeling change between the beginning and end of the dream?' }
    ],
    practice: 'Write one sentence beginning “What this brings to mind for me is…” and leave room for more than one explanation.',
    question: 'Which part feels meaningful to you, and which part might simply be dream imagery?'
  };
}
