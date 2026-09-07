// Original plain-language readings of the deck's existing upright/reversed meanings.
const major = [
 ['You are at the beginning of something, and you may need to learn by taking a careful first step.','A fresh start may be tempting, but check whether you are moving toward something or simply escaping discomfort.'],
 ['You have tools or skills you can put to use. Bringing your attention to one goal matters more than waiting for ideal conditions.','Your effort may be scattered, or an impressive promise may need to be checked against real follow-through.'],
 ['Some understanding takes quiet attention. Let yourself notice what is unclear before rushing to fill in the gaps.','Your own thoughts may be hard to hear amid worry, noise or missing information. Slow down and check what you actually know.'],
 ['Something needs steady care in order to grow. This can concern a creative idea, a relationship or your own wellbeing.','Care may have become one-sided, or your own needs may be receiving too little attention. Growth needs room and resources.'],
 ['Clear boundaries and dependable structure can help you feel less pulled around by the situation.','Rules or control may have become too tight. Ask whether the structure protects people or mainly protects someone from uncertainty.'],
 ['A teacher, tradition or shared set of values may offer useful support. Understand the reason behind the rule.','An inherited rule may no longer fit. You can question it thoughtfully without having to reject everything you have learned.'],
 ['A meaningful choice asks you to bring your actions into line with your values, especially where connection is involved.','Attraction, wishes or obligations may be pulling in different directions. Notice where agreement is missing.'],
 ['Progress becomes easier when you choose a direction and bring competing priorities into line.','Pushing harder may not help until you decide what you are actually trying to achieve.'],
 ['Patient, steady courage is useful here. You can be firm without becoming harsh.','Confidence or energy may be running low. Gentler pacing can help you respond without suppressing your feelings.'],
 ['Some distance can help you understand what matters. The point of reflection is to return with greater clarity.','Time alone may be turning into avoidance, or you may need support while sorting things out.'],
 ['Conditions are changing. Notice what is different so you can respond to the present rather than repeat an old habit.','A familiar situation may be coming around again. Look for the response you could change this time.'],
 ['A fair decision needs honest information and willingness to accept the effects of your choices.','Something may feel unbalanced, or an uncomfortable fact may be getting left out of the decision.'],
 ['A pause can help you see the situation from another angle. You do not have to force an answer immediately.','Waiting may have stopped being useful. Ask what the pause has taught you and what decision it now makes possible.'],
 ['An ending or change may need to be acknowledged so something else can begin. This card does not predict a physical death.','It may be difficult to release something whose role has changed. Letting go can happen in manageable steps.'],
 ['A workable balance may come from combining approaches and reducing extremes. Give adjustments time to settle.','One part of life may be taking more than its share. A smaller, steadier rhythm could help.'],
 ['A desire, habit or obligation may be narrowing your sense of choice. Start by naming what keeps the pattern going.','You may be noticing an attachment more clearly or becoming ready to loosen its hold. Support can make that easier.'],
 ['An assumption or arrangement may need a serious rethink. Focus on what can remain solid while you adjust.','You may be avoiding a necessary change, or processing a disruption privately. You can prepare without assuming disaster.'],
 ['There is room to rebuild confidence and reconnect with possibility. Hope becomes more useful when paired with a small action.','Feeling discouraged does not mean possibility has disappeared. Look for a manageable way to reconnect with it.'],
 ['The situation may be difficult to read. Feelings and imagination matter, but they do not establish what another person intends.','Confusion may be lifting, or you may be ready to question a story that worry has kept alive.'],
 ['Clarity, warmth or enjoyment can help you recognize what is working. Let a healthy experience be simple.','Joy or confidence may feel harder to access just now. A temporary dip does not erase what is good.'],
 ['Something you have learned may be asking for a real response. Consider what you are ready to acknowledge or change.','Self-doubt or avoidance may be delaying a decision you keep returning to. Begin with an honest assessment.'],
 ['A cycle is reaching a point of completion. Recognize what you have learned and what finishing would require.','Something may need a final step, a clear ending or a more realistic definition of done.']
];
const minor = {
 wands:[
 ['An idea or burst of motivation is available. It needs a small experiment to become more than a possibility.','A beginning may be struggling to get going. Check your energy and the size of the first step.'],
 ['You are considering where to put your effort next. Planning can turn a broad wish into a direction.','Fear of the unknown or an unclear plan may be keeping a decision on hold.'],
 ['Early effort may be creating room for expansion. Look ahead while staying in contact with the work already underway.','Progress may be slower or narrower than expected. Review the plan before treating a delay as a final answer.'],
 ['A milestone, welcome or sense of belonging deserves to be noticed.','Stability or celebration may be interrupted by an issue that needs attention at home or within a group.'],
 ['Different priorities may be competing for space. Clarifying the disagreement can prevent wasted effort.','Conflict may be avoided or repeated without progress. Decide whether a direct conversation would help.'],
 ['Your effort may be ready to be seen or acknowledged. Recognition works best when it reflects something you value.','Approval may be delayed or carrying too much weight. Return to your own reasons for doing the work.'],
 ['A position or boundary may need defending. Choose where your energy is most needed.','Defending everything can become exhausting. Consider which boundaries matter and where support is possible.'],
 ['Events or messages may move quickly. Stay responsive while checking the important details.','Momentum may be scattered or communication delayed. Simplifying the next exchange could help.'],
 ['You have reasons to be careful and may still have enough strength for a measured next step.','Tiredness or guardedness may be making every new situation feel like another battle.'],
 ['Responsibility may have become heavy. Finishing something does not mean you must carry every part alone.','The load may need to be reduced or shared. Putting something down can be a responsible decision.'],
 ['Curiosity is opening a possibility. Learn through a small attempt before making a large promise.','Excitement may need more follow-through, or you may need to rediscover what interests you.'],
 ['Energy and enthusiasm can help you begin. A clear direction will keep them useful.','Speed or impatience may be outrunning the plan. Slow enough to notice the effects of your actions.'],
 ['Confidence can be warm and generous. Let your own interests take up some space.','Comparison or insecurity may be affecting how you express yourself. Return to what feels honest.'],
 ['A larger vision needs clear leadership and room for others to contribute.','A strong vision may be leaving too little room for feedback or practical limits.']
 ],
 cups:[
 ['An emotional opening may invite more kindness, honesty or connection.','Feelings may be held back, or you may need care before you can offer more of yourself.'],
 ['Mutual care and clear agreement can strengthen a connection.','The exchange between people may feel uneven or disconnected. Ask what each person actually wants.'],
 ['Friendship and shared enjoyment can remind you that support is available.','A social situation may need clearer boundaries or more honest communication.'],
 ['You may need time to notice what you want, but check whether disinterest is hiding an option worth considering.','Interest may be returning, or you may be ready to look again at an opportunity.'],
 ['Disappointment deserves acknowledgment. It can coexist with support or possibilities that remain.','You may be beginning to accept a loss or recognize what can still support you.'],
 ['A memory or familiar kindness may be influencing the present. Take what is helpful without recreating the past.','Nostalgia may be making the past seem easier than it was. Give the present a fair chance.'],
 ['Several possibilities may be competing for your attention. Learn enough about one to distinguish a real option from a wish.','A confusing range of options may be narrowing. A practical choice can help relieve overwhelm.'],
 ['Something may no longer feel meaningful enough to continue in the same way. Consider what moving on would require.','You may feel caught between leaving and staying. Clarify what each choice would actually change.'],
 ['There may be something you can appreciate or enjoy without waiting for everything else to be finished.','Getting what you wanted may not be meeting the need underneath it. Ask what satisfaction would really look like.'],
 ['Shared values and a sense of belonging can give the situation emotional support.','A picture of happiness may be hiding a disagreement or an unrealistic expectation. Honest care can make room for imperfection.'],
 ['A small feeling, invitation or creative idea may deserve a gentle response.','A feeling may be difficult to express clearly, or imagination may be taking the place of a needed conversation.'],
 ['A heartfelt gesture or invitation may help you express what matters.','A beautiful promise may need grounding in consistent behavior.'],
 ['You can respond with empathy while still keeping your own needs in view.','Care may be becoming overgiving, or attachment may be making it harder to hear your own judgment.'],
 ['Emotional steadiness can help you respond thoughtfully in a sensitive situation.','A calm appearance may be hiding feelings that need an honest, constructive outlet.']
 ],
 swords:[
 ['A clear question or honest conversation can cut through confusion.','Information may be incomplete or difficult to organize. Verify it before making a firm conclusion.'],
 ['A choice may be held in balance because something important is hard to face.','Indecision may be breaking open, or the pressure of too many thoughts may need to be reduced.'],
 ['A painful feeling or truth may need acknowledgment and support. This is not proof of betrayal or a prediction that a relationship will end.','A painful experience may be becoming easier to process. Recovery can include mixed feelings.'],
 ['Rest and mental space may help you return with a clearer view.','Restlessness or exhaustion may be making it difficult to recover. Reduce the demand before asking more of yourself.'],
 ['An argument may offer a victory that costs too much. Consider the relationship and your longer-term aims.','You may be ready to step away from an unproductive fight or make a repair.'],
 ['A transition can help you move toward a more manageable situation while carrying what you have learned.','Something unresolved may be making a transition difficult. Identify what needs attention before moving further.'],
 ['Discretion or independent planning may be relevant, but missing information should be checked rather than treated as proof of deceit.','An unclear strategy or incomplete account may need to be made more honest and direct.'],
 ['The situation may feel restrictive. Separate real limits from assumptions about what you are allowed to try.','A different perspective may be helping you recognize a choice you had not seen.'],
 ['Worry may be repeating more quickly than useful information is arriving. Bring the concern into a practical conversation or plan.','Some perspective or relief may be returning. Notice what helps you step out of repetitive worry.'],
 ['A difficult cycle may have reached its limit. The useful focus is what supports you from this point onward.','You may be beginning to recover, or finding it hard to accept that a difficult phase has ended.'],
 ['Curiosity can help you ask a sharper question and look for reliable information.','Communication may be rushed, defensive or based on information that has not been checked.'],
 ['A clear aim can support decisive action. Keep your pace close to the facts.','An urgent response may be moving faster than your understanding of the situation.'],
 ['Clear boundaries and direct language can help you make a fair decision.','Hurt or defensiveness may be affecting how a truth is expressed. Keep clarity without adding punishment.'],
 ['A considered decision needs evidence, consistency and awareness of the people affected.','A rule or argument may be technically neat while missing an important human consequence.']
 ],
 pentacles:[
 ['A practical opportunity may be available to develop. Give it a first step and realistic resources.','An opportunity may need better preparation or a clearer foundation before you commit.'],
 ['Changing demands may need careful balancing. Priorities can shift without everything being equally urgent.','Too many demands may be colliding. Decide what can be simplified or postponed.'],
 ['Learning and collaboration can improve the work. Agree on the standard you are trying to reach.','Teamwork or quality may be suffering from unclear expectations. A specific conversation could help.'],
 ['Protecting resources can create security. Check whether the protection still leaves enough room to live.','Fear of loss may be tightening your grip, or you may be ready to loosen a limit that no longer helps.'],
 ['A practical difficulty may feel isolating. Look for real sources of assistance rather than assuming none exist.','Support or a way to rebuild stability may be becoming available.'],
 ['Giving and receiving work best when expectations are clear and both people retain dignity.','An exchange may have hidden expectations or an uneven balance. Clarify the terms.'],
 ['Effort needs time, but it also needs review. Look at what is growing before deciding to invest more.','Impatience or disappointing results may be asking for a change in how you invest your effort.'],
 ['Steady practice can build confidence and skill. Small improvements count.','Repetition may have become empty, or perfectionism may be blocking useful practice.'],
 ['Something you have built may offer independence or comfort. Enjoy it without closing yourself off.','Self-sufficiency may be turning into overwork, or comfort may be coming with an unwanted cost.'],
 ['Long-term support depends on systems and values that can hold beyond one successful moment.','An arrangement meant to provide security may need a more honest review of its weak points.'],
 ['A practical lesson or new skill may be worth beginning. Make the first attempt concrete.','An intention to learn may need a place in the schedule before it becomes progress.'],
 ['Reliable effort can carry something forward without drama. Keep checking the direction.','A useful routine may have become too rigid or stopped serving its original purpose.'],
 ['Practical care can make daily life feel more supported and manageable.','Caring for everyone else may be leaving too little time or security for you.'],
 ['Responsible use of resources can create stability for yourself and others.','Status or control may be overshadowing the purpose of building security.']
 ]
};
export function plainMeaning(card,reversed=false) {
 const rank=['Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Page','Knight','Queen','King'].indexOf(card.rank);
 const pair=card.type==='major'?major[card.id]:minor[card.suit]?.[rank];
 return pair?.[reversed?1:0] || `${card.name} invites reflection on ${reversed?card.reversed:card.upright}.`;
}
