import {extraPositionPrompts} from '../../../shared/spreads.js';
// Shared, versioned symbolic reference. Original editorial explanations;
// practitioner references describe traditions, not scientifically verified predictions.
export const knowledgeVersion = '2026-09-09.1';
export const sources = [
  ['Tarot structure · Joan Bunning', 'https://www.learntarot.com/less12.htm'],
  ['Reading reversals · Joan Bunning', 'https://www.learntarot.com/less17.htm'],
  ['Elements · Astrodienst', 'https://www.astro.com/astrowiki/en/Air'],
  ['Modalities · Astrodienst', 'https://www.astro.com/astrowiki/en/Quadruplicities'],
  ['Birth-chart requirements · Astrodienst', 'https://www.astro.com/horoscope'],
  ['Zodiac and tarot correspondences · Tarot.com', 'https://www.tarot.com/astrology/tarot-cards'],
  ['Life-path calculation · Numerology.com', 'https://www.numerology.com/articles/your-numerology-chart/life-path-number-meanings/'],
  ['Name numerology · Numerology.com', 'https://www.numerology.com/articles/your-numerology-chart/name-numerology/']
];
export const elements = {
  Fire: { meaning:'Initiative, enthusiasm and the urge to act.', practice:'Choose a useful first step; leave room to listen before moving again.' },
  Earth: { meaning:'Stability, resources and practical follow-through.', practice:'Give the idea a budget, a place in your schedule or one repeatable habit.' },
  Air: { meaning:'Ideas, language and the exchange of perspectives.', practice:'Say what you mean, then check that you understood the reply.' },
  Water: { meaning:'Feeling, connection and emotional responsiveness.', practice:'Acknowledge the feeling without treating it as proof of someone else’s intentions.' }
};
export const modalities = {
  Cardinal:'Begins and mobilizes. The reflection is how to start without taking every decision away from others.',
  Fixed:'Sustains and concentrates. The reflection is where commitment helps and where changing course would help more.',
  Mutable:'Adapts and translates. The reflection is how to stay flexible while still choosing a direction.'
};
const signRows = [
 ['Aries','♈','Mar 21–Apr 19','Fire','Cardinal','Mars','initiative','Let your first step be brave and small enough to revise.'],
 ['Taurus','♉','Apr 20–May 20','Earth','Fixed','Venus','steadiness','Keep what supports you, but make room for a better way.'],
 ['Gemini','♊','May 21–Jun 20','Air','Mutable','Mercury','curiosity','Ask the question you have been circling, then stay for the answer.'],
 ['Cancer','♋','Jun 21–Jul 22','Water','Cardinal','Moon','belonging','Name what would help you feel secure without asking others to guess.'],
 ['Leo','♌','Jul 23–Aug 22','Fire','Fixed','Sun','expression','Share something honestly without making the response a measure of your worth.'],
 ['Virgo','♍','Aug 23–Sep 22','Earth','Mutable','Mercury','discernment','Improve the part you can change today; leave perfection out of the agreement.'],
 ['Libra','♎','Sep 23–Oct 22','Air','Cardinal','Venus','balance','Include your own needs when you decide what would be fair.'],
 ['Scorpio','♏','Oct 23–Nov 21','Water','Fixed','Mars; Pluto in modern astrology','transformation','Notice what trust would require in practice, rather than testing it in silence.'],
 ['Sagittarius','♐','Nov 22–Dec 21','Fire','Mutable','Jupiter','exploration','Let a new perspective change one real choice, not just the story you tell.'],
 ['Capricorn','♑','Dec 22–Jan 19','Earth','Cardinal','Saturn','responsibility','Choose a sustainable commitment, including time when you are allowed to stop.'],
 ['Aquarius','♒','Jan 20–Feb 18','Air','Fixed','Saturn; Uranus in modern astrology','independence','Make space for both your own view and the person affected by it.'],
 ['Pisces','♓','Feb 19–Mar 20','Water','Mutable','Jupiter; Neptune in modern astrology','imagination','Give compassion a boundary so that helping remains a choice.']
];
export const signs = signRows.map(([name,symbol,dates,element,modality,ruler,theme,practice])=>({name,symbol,dates,element,modality,ruler,theme,practice}));
// Concise traditional number associations; reflective exercises are original.
export const numbers = Object.fromEntries([
 [1,'Initiative','Try taking the lead on one task without having to handle everything alone.'],
 [2,'Cooperation','Ask for a clear agreement instead of keeping the peace by staying quiet.'],
 [3,'Expression','Put the idea into words, music or a conversation before judging the result.'],
 [4,'Structure','Make the next step repeatable; a simple routine can hold what motivation cannot.'],
 [5,'Change','Explore an option while deciding what needs to remain stable.'],
 [6,'Care','Offer support with a limit you can keep, and include yourself in that care.'],
 [7,'Reflection','Leave space to think, then return with one question you can actually investigate.'],
 [8,'Stewardship','Measure progress by how responsibly you use your resources and influence.'],
 [9,'Completion','Recognize what has been learned and choose what you can now put down.'],
 [11,'Inspiration','Capture the insight, then find one grounded way to try it.'],
 [22,'Building','Break the larger vision into a plan that other people can understand and share.'],
 [33,'Service','Help in a way that leaves both you and the other person with room to grow.']
].map(([number,title,practice])=>[number,{number,title,practice}]));
export const planets = [
 ['Sun','Identity, vitality and conscious direction. A Sun sign describes one symbolic theme, not your whole personality.'],
 ['Moon','Emotional habits, comfort and instinctive responses. Its sign changes quickly enough that a date alone may be insufficient.'],
 ['Mercury','Thinking, learning and communication. Consider both how an idea is formed and how it is delivered.'],
 ['Venus','Values, pleasure and relating. Its symbolism includes what people appreciate as well as romantic affection.'],
 ['Mars','Initiative, assertion and conflict. The useful question is how to pursue something without overriding another person.'],
 ['Jupiter','Expansion, meaning and confidence. Growth also asks for judgment about what is enough.'],
 ['Saturn','Limits, responsibility and patient effort. A boundary can protect a goal as well as restrict it.'],
 ['Uranus','Modern associations with disruption, invention and independence. Shared generational themes need individual chart context.'],
 ['Neptune','Modern associations with imagination, ideals and blurred boundaries. Inspiration and wishful thinking need to be distinguished.'],
 ['Pluto','Modern associations with power and deep change. These themes should never be used to predict literal death.']
];
export const houses = ['Identity and approach','Personal resources and values','Communication and local life','Home and roots','Creativity and enjoyment','Routines and everyday service','Partnership and agreements','Shared resources and intimacy','Study, travel and worldview','Public role and vocation','Friendship and collective aims','Retreat and private inner life'];
export const aspects = [
 ['Conjunction · 0°','Two planetary themes are read together. Whether the combination is easy or demanding depends on the planets and context.'],
 ['Sextile · 60°','A traditional opportunity for cooperation; it may need deliberate participation.'],
 ['Square · 90°','A traditional tension between needs or approaches. It invites adjustment rather than a prediction of failure.'],
 ['Trine · 120°','A traditional ease of expression. Something natural can still need attention and practice.'],
 ['Opposition · 180°','A polarity that asks for balance or negotiation. Neither side automatically has to defeat the other.']
];
export const tarotLessons = [
 ['A language of pictures','The Fold uses the 78-card, Rider–Waite–Smith-style structure: 22 Major Arcana and 56 Minor Arcana. Majors describe broad symbolic themes; minors bring those themes into everyday situations. A draw is an invitation to reflect, not evidence that an event has happened.'],
 ['The four suits','Wands explore action and creativity; Cups explore feelings and connection; Swords explore thought and communication; Pentacles explore practical resources. Their familiar elemental associations are Fire, Water, Air and Earth respectively. More of one suit makes that topic prominent in this particular draw.'],
 ['Numbers and court cards','Aces suggest beginnings. The numbered cards explore development, tension and completion, but each picture has its own meaning. Pages can suggest learning; Knights, pursuit; Queens, mature care or discernment; Kings, responsibility. These are roles anyone can express, regardless of gender.'],
 ['Why the position matters','A card in an obstacle position asks where its theme complicates the situation. The same card in an opportunity position asks how that quality might help. Read the position, the image and your actual question together before deciding what fits.'],
 ['What a reversal means','An upside-down card is not automatically bad. In this reading style it can point to a theme that is blocked, inward, excessive or changing. Some reversed meanings describe recovery. The Fold uses each card’s specific reversed meaning rather than simply negating its upright meaning.'],
 ['Reading cards together','Look for contrasts as well as repetition. A card about taking action beside a card about rest can invite better pacing. It does not require choosing one and ignoring the other. Avoid assuming that every spread is a timeline: the Celtic Cross, for example, includes environment and hopes as well as possible direction.'],
 ['Asking a useful question','“What can I do to communicate more clearly?” gives you more to work with than “What are they secretly thinking?” The cards cannot verify another person’s feelings. Start with what you know, ask what you can influence, and finish with one realistic action.'],
 ['Birth cards and correspondences','The Fold retains its birth-card convention: sum the birth-date digits and reduce until the result is 21 or below, then use that Major Arcana number. Other schools use pairs or different reductions. Zodiac-card associations are a separate esoteric tradition; they do not change which cards are randomly drawn.']
];
export const positionPrompts = {
 ...extraPositionPrompts,
 'What Shaped You':'Look back at an experience or habit that may still influence your response.',
 'Present Energy':'Look at what you can observe and respond to now.',
 'Conditional Direction':'Consider a possible next chapter, depending on what you choose.',
 'The Mask':'Ask how you present the situation, and what that presentation leaves out.',
 'Hidden Pattern':'Consider a habit you might be overlooking; check it against your experience.',
 'The Trigger':'Notice what tends to start this reaction.',
 'What Must Be Reclaimed':'Consider a quality or choice you want to make room for again.',
 'Your Direction':'Choose a way forward that you can put into practice.',
 'Your Heart':'Start with your own feelings and needs.',
 'Relationship Energy':'Consider the interaction you can actually observe between you.',
 'What Helps':'Look for a quality that could support the connection.',
 'What Harms':'Ask whether this theme is making connection harder.',
 'Direction of the Bond':'Consider where your shared actions might lead; no card can promise another person’s choice.',
 'Current Position':'Take an honest look at where your work stands today.',
 'Untapped Strength':'Consider a skill or quality you could use more deliberately.',
 'Obstacle':'Look for a complication you can name and work around.',
 'Opportunity':'Ask what useful opening this theme suggests.',
 'Next Move':'Turn the theme into one practical step.',
 'Present':'Begin with the situation as it stands.',
 'Challenge':'Ask what needs attention before things can move more easily.',
 'Foundation':'Consider the assumptions or experiences underneath the situation.',
 'Recent Past':'Reflect on what has recently changed or carried over.',
 'Conscious Aim':'Ask what you are trying to achieve and why it matters.',
 'Near Future':'Consider what may develop if current choices continue.',
 'Self':'Notice the part of the situation that belongs to your own response.',
 'Environment':'Consider the circumstances around you without assuming anyone’s hidden motives.',
 'Hopes / Fears':'Separate the outcome you want from the outcome you are afraid of.',
 'Outcome / Direction':'Use this as a possible direction, not a fixed result.'
};

// Card-specific, original practical prompts. These turn keywords into an action
// without claiming facts about the reader or other people's intentions.
export const minorPractices = {
 wands:[
  'Give the idea twenty minutes of real attention and see what takes shape.',
  'Compare two possible directions and decide what you need to learn before choosing.',
  'Look at the progress already made, then identify the next person or resource you need.',
  'Pause to acknowledge a milestone with someone who helped you reach it.',
  'Find the actual point of disagreement before spending more energy defending your position.',
  'Accept recognition while remembering what made the work meaningful to you.',
  'Choose the boundary that matters most; you do not have to defend every small point.',
  'Check the details before responding quickly to a message or opportunity.',
  'Notice where persistence is helping and where you need rest or support.',
  'List what you are carrying and choose one responsibility to share, postpone or release.',
  'Try a small experiment before promising a large result.',
  'Turn enthusiasm into a plan with a pace you can sustain.',
  'Let yourself be visible without competing for everyone’s approval.',
  'Explain the direction clearly and invite the people involved to help shape the plan.'
 ],
 cups:[
  'Make room for an honest feeling without rushing to decide what it means.',
  'Ask what a fair exchange of care would look like for both people.',
  'Reach out to someone whose company makes it easier to be yourself.',
  'Notice an offer or option you may have dismissed, and decide whether it deserves another look.',
  'Acknowledge the disappointment, then name one source of support that is still available.',
  'Take the kindness from an old memory without requiring the present to recreate it.',
  'Choose one possibility to investigate instead of trying to keep every possibility open.',
  'Ask whether staying supports your values or only postpones a difficult conversation.',
  'Notice what feels satisfying today without adding another condition to enjoying it.',
  'Talk about what belonging means to you instead of aiming for a perfect picture of it.',
  'Say the feeling simply, even if you have not worked out the whole story around it.',
  'Match a heartfelt promise with one action you can reliably follow through on.',
  'Listen with care while keeping track of your own needs.',
  'Give yourself time to settle before having an emotionally important conversation.'
 ],
 swords:[
  'Write the central question in one sentence and separate what you know from what you assume.',
  'Identify the missing information that would make this choice easier.',
  'Name the hurt honestly and choose a supportive person or place in which to process it.',
  'Protect a period of quiet before returning to a demanding decision.',
  'Ask what winning this disagreement would cost and whether that cost is worth it.',
  'Choose one manageable step away from an unhelpful situation, taking useful lessons with you.',
  'Check what has actually been said or agreed before drawing conclusions about secrecy.',
  'Name one real constraint and one choice that remains available within it.',
  'Write down the worry, then identify what evidence or support would help you address it.',
  'Focus on the next part of recovery rather than repeatedly proving how difficult the ending was.',
  'Ask a direct question and verify the answer before passing information along.',
  'Slow your response enough to check whether you have understood the situation.',
  'State a clear boundary without using honesty to punish.',
  'Make the decision using both the facts and its effects on the people involved.'
 ],
 pentacles:[
  'Give the opportunity a concrete first step, a realistic cost and a date to review it.',
  'Choose which priority needs attention today and which can safely wait.',
  'Ask for useful feedback and agree on what good work looks like.',
  'Review what you are protecting and whether the current limit still serves you.',
  'Identify a practical source of help instead of assuming you must manage the difficulty alone.',
  'Clarify what is being offered, what is expected in return and whether the exchange feels fair.',
  'Review the results so far before investing more time or resources.',
  'Practice one specific skill and notice a small improvement rather than demanding mastery.',
  'Enjoy something you have built while making room for connection as well as independence.',
  'Consider what would make your plans sustainable for the people who rely on them.',
  'Choose a useful thing to learn and schedule a first practice session.',
  'Set a steady pace, then check that the routine is still taking you somewhere worthwhile.',
  'Make a practical act of care that includes your own comfort and limits.',
  'Use your resources to create stability without making every decision about control.'
 ]
};

export const planetThemes={Sun:'your sense of identity and direction',Moon:'emotional needs and familiar ways of finding comfort',Mercury:'thinking, learning and communication',Venus:'values, affection and relating',Mars:'initiative and how you assert yourself',Jupiter:'growth, confidence and the search for meaning',Saturn:'responsibility, boundaries and sustained effort',Uranus:'independence and changes to established patterns',Neptune:'imagination, ideals and sensitivity',Pluto:'power, release and deep change'};
export const aspectLessons={Conjunction:'These two themes are read together. Notice when one brings the other into focus.',Sextile:'These themes may support each other when you deliberately give them a way to cooperate.',Square:'These themes may ask for different things at the same time. A practical adjustment can make room for both.',Trine:'These themes may work together with relative ease. Something that feels natural can still benefit from practice.',Opposition:'These themes describe a polarity. Try balancing both needs instead of deciding that only one is legitimate.'};
