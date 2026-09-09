// Shared by the picker, request validation, server reading, and device reading.
// Research and the distinction between traditional patterns and adaptations:
// docs/TAROT-SPREADS.md. Position wording and guidance are original to The Fold.
export const spreads={
 three:{name:'Three Veils',label:'Three-card reading',detail:'Past · Present · Future',focusIndex:1,positions:['What Shaped You','Present Energy','Conditional Direction']},
 shadow:{name:'Shadow Compass',detail:'The pattern beneath it all',positions:['The Mask','Hidden Pattern','The Trigger','What Must Be Reclaimed','Your Direction']},
 love:{name:'Black Rose',detail:'Love & connection',positions:['Your Heart','Relationship Energy','What Helps','What Harms','Direction of the Bond']},
 career:{name:'Iron Key',detail:'Work & direction',positions:['Current Position','Untapped Strength','Obstacle','Opportunity','Next Move']},
 celtic:{name:'Celtic Cross',detail:'Explore the complete picture',positions:['Present','Challenge','Foundation','Recent Past','Conscious Aim','Near Future','Self','Environment','Hopes / Fears','Outcome / Direction']},
 daily:{name:'Daily Lantern',detail:'One card · A focus for today',positions:['Today’s Focus']},
 clarity:{name:'Clear Lens',detail:'Situation · Complication · Response',positions:['The Situation','The Complication','A Useful Response']},
 balance:{name:'Mind, Body & Spirit',detail:'Thoughts · Care · Meaning',positions:['Your Thoughts','Your Energy & Care','Your Sense of Meaning']},
 crossroads:{name:'Crossroads',detail:'Compare two possible paths',positions:['Your Priority','What Path A Asks','What Path B Asks','What to Compare','A Reversible Next Step']},
 release:{name:'Letting Go',detail:'Loosen a pattern · Make room',positions:['What You Carry','What It Protects','What to Loosen','What to Nurture']},
 newMoon:{name:'New Moon Intentions',detail:'A seed · Support · A beginning',positions:['The Seed','Room to Grow','Support to Gather','One Grounded Start']},
 fullMoon:{name:'Full Moon Reflection',detail:'Notice · Appreciate · Release',positions:['What Comes to Light','What to Honor','What to Release','What to Take Forward']},
 horseshoe:{name:'Horseshoe',detail:'Seven cards · A wider perspective',focusIndex:1,positions:['The Background','Where You Stand','Unseen Influences','Your Own Stance','Outside Influences','A Helpful Action','A Possible Direction']}
};
export const spreadIds=Object.keys(spreads);
export const spreadChoices=Object.entries(spreads).map(([id,spread])=>({id,name:spread.label||spread.name,count:String(spread.positions.length).padStart(2,'0'),detail:spread.detail}));
export const extraPositionPrompts={
 'Today’s Focus':'Choose one theme to notice and practice today, without treating it as a forecast.',
 'The Situation':'Describe what is happening using facts you can observe.',
 'The Complication':'Consider what makes the situation difficult, including an assumption worth checking.',
 'A Useful Response':'Turn this card into a response that is within your control.',
 'Your Thoughts':'Notice the story you are telling yourself and which parts you can verify.',
 'Your Energy & Care':'Reflect on everyday rest, comfort and the demands on your attention; this card is not a health assessment.',
 'Your Sense of Meaning':'Ask what makes this situation meaningful and which value you want to honor.',
 'Your Priority':'Name what matters most before comparing the options.',
 'What Path A Asks':'Name your first option. Consider its likely demands using real information, rather than treating this as its guaranteed outcome.',
 'What Path B Asks':'Name your second option. Explore what it would ask of you and what you still need to learn.',
 'What to Compare':'Compare the same practical question across both paths, including any tradeoffs.',
 'A Reversible Next Step':'Choose a small experiment or a question that helps you learn before committing.',
 'What You Carry':'Name a responsibility, expectation or memory that still takes up space.',
 'What It Protects':'Ask what need this pattern has been trying to serve, without judging yourself for having it.',
 'What to Loosen':'Consider a small part of the pattern you can safely stop repeating.',
 'What to Nurture':'Choose what deserves the space that letting go could create.',
 'The Seed':'Name one intention you would like to begin tending.',
 'Room to Grow':'Consider what space, time or permission that intention would need.',
 'Support to Gather':'Look for a practical resource, a useful skill or a person you can ask.',
 'One Grounded Start':'Choose one achievable action to begin; intention alone does not guarantee a result.',
 'What Comes to Light':'Notice what has become clearer through recent experience.',
 'What to Honor':'Recognize something you have learned, received or followed through on.',
 'What to Release':'Ask which expectation or unfinished argument no longer deserves so much attention.',
 'What to Take Forward':'Choose a lesson or practice you want to carry into the next chapter.',
 'The Background':'Consider the earlier conditions that still shape this question.',
 'Where You Stand':'Describe your current circumstances before imagining where they might lead.',
 'Unseen Influences':'Ask what you may have overlooked, then seek evidence rather than assuming a hidden threat.',
 'Your Own Stance':'Notice your attitude, choices and responsibility in the situation.',
 'Outside Influences':'Consider visible circumstances and other people’s stated needs, without claiming to know their private thoughts.',
 'A Helpful Action':'Choose a practical response you can try with the information you have.',
 'A Possible Direction':'Explore a possible development that depends on choices and circumstances, not a fixed prediction.'
};
