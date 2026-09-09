import { yesNoChapters } from './yesNoChapters.js';

const titles = {
 yes: ['Yes', 'Absolutely', 'Looking likely', 'The teller says yes', 'A rather cheeky yes', 'Yes, with a wink', 'Signs point to yes', 'A confident yes'],
 no: ['Not likely', 'Nope', 'The teller says no', 'A rather firm no', 'Not this time', 'Looking doubtful', 'A polite but definite no', 'No, with affection']
};
export const yesNoFortunes = Object.freeze(yesNoChapters.flatMap(chapter => chapter.messages.trim().split('\n').map((line, index) => {
 const [number, message] = line.trim().split('|');
 if (!/^\d{3}$/.test(number) || !message) throw new Error(`Incomplete answer in ${chapter.key}`);
 return Object.freeze({ id: `yn-${chapter.key}-${number}`, mode: 'yesno', answer: chapter.answer, title: titles[chapter.answer][index % titles[chapter.answer].length], message, whisper: 'A playful verdict. You still write the story.' });
})));
export const yesNoDeckStorageKey = 'the-fold-yes-no-deck-v1';
