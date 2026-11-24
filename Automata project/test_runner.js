const fs = require('fs');
const vm = require('vm');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) { console.log('ERROR: No script tag found'); process.exit(1); }
let js = match[1];

// Remove DOM-dependent code at end
js = js.split('document.addEventListener')[0];
// Remove 'use strict' so eval puts things in global scope
js = js.replace('"use strict";', '');
// Replace DOM-dependent esc() with pure version
js = js.replace(
  /function esc\(s\) \{\s*const d = document\.createElement\('div'\);\s*d\.appendChild\(document\.createTextNode\(s\)\);\s*return d\.innerHTML;\s*\}/,
  "function esc(s) { return String(s); }"
);

// Create a context and run
const ctx = { console, require, process, setTimeout, Math, String, RegExp, Set, Array, Object, parseInt, parseFloat, isNaN, Infinity, NaN, undefined, Error, TypeError, RangeError, JSON };
vm.createContext(ctx);
try {
  vm.runInContext(js, ctx);
  console.log('JS pure functions: loaded OK');
} catch(e) {
  console.log('JS load ERROR:', e.message);
  process.exit(1);
}

// Pull out needed functions/vars - const declarations in strict-mode VM
// need an extra eval to make them accessible
vm.runInContext(`
  this.isPrime = isPrime;
  this.isPerfectSquare = isPerfectSquare;
  this.isPowerOf2 = isPowerOf2;
  this.pumpString = pumpString;
  this.checkMembership = checkMembership;
  this.LANGUAGES = LANGUAGES;
  this.getValidDecompositions = getValidDecompositions;
  this.runProof = runProof;
  this.showStr = showStr;
`, ctx);
const { isPrime, isPerfectSquare, isPowerOf2, pumpString, checkMembership, LANGUAGES, getValidDecompositions, runProof, showStr } = ctx;

let pass = 0, fail = 0;
function test(name, fn) {
  try {
    if (fn()) { pass++; console.log('  PASS:', name); }
    else { fail++; console.log('  FAIL:', name); }
  } catch(e) { fail++; console.log('  FAIL:', name, '-', e.message); }
}

console.log('\n=== Self-Tests ===');

test('isPrime basics', () => !isPrime(0) && !isPrime(1) && isPrime(2) && isPrime(3) && !isPrime(4) && isPrime(5) && isPrime(7));
test('isPerfectSquare', () => isPerfectSquare(0) && isPerfectSquare(1) && !isPerfectSquare(2) && isPerfectSquare(4) && isPerfectSquare(9));
test('isPowerOf2', () => isPowerOf2(1) && isPowerOf2(2) && !isPowerOf2(3) && isPowerOf2(4) && !isPowerOf2(0));
test('pumpString', () => pumpString('','a','bb',0)==='bb' && pumpString('','a','bb',2)==='aabb' && pumpString('x','y','z',3)==='xyyyz');

test('anbn: empty in L', () => checkMembership(0, '').inL === true);
test('anbn: aabb in L', () => checkMembership(0, 'aabb').inL === true);
test('anbn: aab not in L', () => checkMembership(0, 'aab').inL === false);
test('anbn: abc invalid chars', () => checkMembership(0, 'abc').invalidChars === true);

const abStarIdx = LANGUAGES.findIndex(l => l.id === 'ab_star');
const aStarBStarIdx = LANGUAGES.findIndex(l => l.id === 'a_star_b_star');
const end01Idx = LANGUAGES.findIndex(l => l.id === 'end01');
const evenAIdx = LANGUAGES.findIndex(l => l.id === 'even_a');
const primeIdx = LANGUAGES.findIndex(l => l.id === 'a_prime');
const palindromeIdx = LANGUAGES.findIndex(l => l.id === 'palindrome');

test('a*b*: empty in L', () => checkMembership(aStarBStarIdx, '').inL === true);
test('end01: empty not in L', () => checkMembership(end01Idx, '').inL === false);

test('Decomp count: |w|=6, p=3 -> 6', () => getValidDecompositions('aaabbb', 3).length === 6);

test('anbn pump: x=e,y=a,z=aabbb,i=2 not in L', () => {
  const pumped = pumpString('', 'a', 'aabbb', 2);
  return !checkMembership(0, pumped).inL;
});

test('anbn: all decomps y in a*, all break i=0', () => {
  const decomps = getValidDecompositions('aaabbb', 3);
  return decomps.every(d => /^a+$/.test(d.y)) && decomps.every(d => !checkMembership(0, pumpString(d.x,d.y,d.z,0)).inL);
});

test('(ab)*: x=e,y=ab,z=ab stays in L i=0..10', () => {
  for (let i = 0; i <= 10; i++) if (!checkMembership(abStarIdx, pumpString('','ab','ab',i)).inL) return false;
  return true;
});

test('primes p=5 w=aaaaa all decomps break', () => {
  const decomps = getValidDecompositions('aaaaa', 5);
  return decomps.every(d => {
    for (let i = 0; i <= 20; i++) if (!checkMembership(primeIdx, pumpString(d.x,d.y,d.z,i)).inL) return true;
    return false;
  });
});

test('even_a: x=e,y=aa,z=b stays in L', () => {
  for (let i = 0; i <= 10; i++) if (!checkMembership(evenAIdx, pumpString('','aa','b',i)).inL) return false;
  return true;
});

test('palindrome: w=aabaa p=3 some decomp breaks at i=2', () => {
  const decomps = getValidDecompositions('aabaa', 3);
  return decomps.some(d => !checkMembership(palindromeIdx, pumpString(d.x,d.y,d.z,2)).inL);
});

test('runProof: anbn p=3 w=aaabbb all broken', () => {
  const result = runProof(0, 'aaabbb', 3);
  return result.allBroken === true;
});

test('runProof: (ab)* p=2 w=abab some survive', () => {
  const result = runProof(abStarIdx, 'abab', 2);
  return result.someSurvive === true;
});

// Additional membership tests for all languages
const wwIdx = LANGUAGES.findIndex(l => l.id === 'ww');
const eqIdx = LANGUAGES.findIndex(l => l.id === 'equal_ab');
const nsqIdx = LANGUAGES.findIndex(l => l.id === 'a_nsq');
const o1oIdx = LANGUAGES.findIndex(l => l.id === '0n1n0n');
const pow2Idx = LANGUAGES.findIndex(l => l.id === 'a_2n');
const ab2nIdx = LANGUAGES.findIndex(l => l.id === 'anb2n');
const abcIdx = LANGUAGES.findIndex(l => l.id === 'aibjck');
const div3Idx = LANGUAGES.findIndex(l => l.id === 'div3');
const abaIdx = LANGUAGES.findIndex(l => l.id === 'contains_aba');

test('ww: abab in L', () => checkMembership(wwIdx, 'abab').inL === true);
test('ww: abc not in L', () => checkMembership(wwIdx, 'abc').inL === false);
test('equal_ab: aabb in L', () => checkMembership(eqIdx, 'aabb').inL === true);
test('a_nsq: aaaa in L (4=2^2)', () => checkMembership(nsqIdx, 'aaaa').inL === true);
test('a_nsq: aaa not in L', () => checkMembership(nsqIdx, 'aaa').inL === false);
test('0n1n0n: 001100 in L (n=2)', () => checkMembership(o1oIdx, '001100').inL === true);
test('0n1n0n: 011100 not in L (1!=2!=2)', () => checkMembership(o1oIdx, '011100').inL === false);
test('a_2n: aa in L (2=2^1)', () => checkMembership(pow2Idx, 'aa').inL === true);
test('anb2n: abb in L', () => checkMembership(ab2nIdx, 'abb').inL === true);
test('aibjck: bcc in L (0<1<2)', () => checkMembership(abcIdx, 'bcc').inL === true);
test('div3: aaa in L', () => checkMembership(div3Idx, 'aaa').inL === true);
test('contains_aba: baba in L', () => checkMembership(abaIdx, 'baba').inL === true);
test('contains_aba: bb not in L', () => checkMembership(abaIdx, 'bb').inL === false);

/* ================================================================
   NEW TESTS — lab-core logic (validator, pumping, automata,
   machines, experiments, quiz, progress)
   ================================================================ */
const coreMatch = html.match(/<script id="lab-core">([\s\S]*?)<\/script>/);
if (!coreMatch) { console.log('ERROR: lab-core script not found'); process.exit(1); }
try {
  vm.runInContext(coreMatch[1], ctx);
  vm.runInContext('this.LabCore = LabCore; this.DFA_DEFINITIONS = DFA_DEFINITIONS;', ctx);
  console.log('\nlab-core: loaded OK');
} catch (e) { console.log('lab-core load ERROR:', e.message); process.exit(1); }
const C = ctx.LabCore, DFA = ctx.DFA_DEFINITIONS;
const idx = id => LANGUAGES.findIndex(l => l.id === id);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

console.log('\n=== New languages ===');
test('anbn1: ε not in L, ab in L, aabbb not in L', () => !checkMembership(idx('anbn1'), '').inL && checkMembership(idx('anbn1'), 'ab').inL && !checkMembership(idx('anbn1'), 'aabbb').inL);
test('0n1n: 000111 in L, 0101 not in L, ε in L', () => checkMembership(idx('0n1n'), '000111').inL && !checkMembership(idx('0n1n'), '0101').inL && checkMembership(idx('0n1n'), '').inL);
test('a_n: ε and aaaa in L, aab invalid chars', () => checkMembership(idx('a_n'), '').inL && checkMembership(idx('a_n'), 'aaaa').inL && checkMembership(idx('a_n'), 'aab').invalidChars);
test('LANGUAGES[0] is still anbn and custom is last', () => LANGUAGES[0].id === 'anbn' && LANGUAGES[LANGUAGES.length - 1].id === 'custom');
test('runProof: 0n1n p=3 w=000111 all broken; anbn1 p=4 all broken', () => runProof(idx('0n1n'), '000111', 3).allBroken && runProof(idx('anbn1'), 'aaaabbbb', 4).allBroken);

console.log('\n=== Decomposition validator ===');
test('legal split 000111, p=3, |x|=1,|y|=2', () => { const v = C.validateDecomposition('000111', 3, 1, 2); return v.valid && v.x === '0' && v.y === '00' && v.z === '111'; });
test('|y| = 0 violates condition (1) only', () => { const v = C.validateDecomposition('000111', 3, 1, 0); return !v.valid && !v.conditions.yNonEmpty && v.conditions.xyWithinP && v.conditions.lengthAtLeastP; });
test('|xy| > p violates condition (2) only', () => { const v = C.validateDecomposition('aaabbb', 3, 2, 2); return !v.valid && v.conditions.yNonEmpty && !v.conditions.xyWithinP; });
test('|w| < p flagged', () => { const v = C.validateDecomposition('ab', 3, 0, 1); return !v.valid && !v.conditions.lengthAtLeastP; });
test('bad inputs rejected with errors (past end, negative, non-integer p)', () =>
  C.validateDecomposition('abc', 3, 2, 2).errors.length > 0 &&
  C.validateDecomposition('abc', 3, -1, 1).errors.length > 0 &&
  C.validateDecomposition('abc', 1.5, 0, 1).errors.length > 0);
test('validator agrees with getValidDecompositions on every split', () => {
  const w = 'aabbab', p = 4;
  const legal = getValidDecompositions(w, p).map(d => d.xLen + ',' + d.yLen);
  for (let x = 0; x <= w.length; x++) for (let y = 0; x + y <= w.length; y++) {
    if (C.validateDecomposition(w, p, x, y).valid !== legal.includes(x + ',' + y)) return false;
  }
  return true;
});

console.log('\n=== Pumping i = 0..5 ===');
test('pumpSeries anbn x=a,y=a,z=abbb: only i=1 in L', () => {
  const s = C.pumpSeries(0, 'a', 'a', 'abbb', 0, 5);
  return s.length === 6 && s.map(r => r.inL).join() === 'false,true,false,false,false,false' && s.every(r => r.length === 5 + r.i);
});
test('pumpSeries strings for i=0..5 equal pumpString', () => C.pumpSeries(idx('ab_star'), 'x', 'yz', 'w', 0, 5).every(r => r.str === pumpString('x', 'yz', 'w', r.i)));
test('(ab)* x=ε,y=ab,z=ab stays in L for i=0..5', () => C.pumpSeries(idx('ab_star'), '', 'ab', 'ab', 0, 5).every(r => r.inL));
test('pumpSegments i=0 marks y removed', () => { const s = C.pumpSegments('a', 'bc', 'd', 0); return s.length === 4 && s.filter(g => g.kind === 'removed').length === 2; });
test('pumpSegments i=3 marks 2 copies inserted, 1 unchanged', () => { const s = C.pumpSegments('a', 'bc', 'd', 3); return s.filter(g => g.kind === 'inserted').length === 4 && s.filter(g => g.part === 'y' && g.kind === 'unchanged').length === 2 && s.map(g => g.ch).join('') === 'abcbcbcd'; });
test('pumpSegments i=1 is all unchanged and equals w', () => { const s = C.pumpSegments('a', 'bc', 'd', 1); return s.every(g => g.kind === 'unchanged') && s.map(g => g.ch).join('') === 'abcd'; });

console.log('\n=== Honest classification ===');
test('anbn decomposition → counterexample at i=0', () => { const c = C.classifyDecomposition(0, '', 'a', 'aabbb'); return c.kind === 'counterexample' && c.i === 0; });
test('(ab)* x=ε,y=ab,z=ab → verified for all i via DFA', () => C.classifyDecomposition(idx('ab_star'), '', 'ab', 'ab').kind === 'verified');
test('a_n any decomposition → verified', () => C.classifyDecomposition(idx('a_n'), 'a', 'aa', 'a').kind === 'verified');
test('even_a y=a → counterexample at i=0', () => { const c = C.classifyDecomposition(idx('even_a'), '', 'a', 'a'); return c.kind === 'counterexample' && c.i === 0; });
test('custom regex surviving split → "unavailable", never "verified"', () => {
  const ci = LANGUAGES.length - 1; const lang = LANGUAGES[ci];
  lang._regex = /^(?:(ab)*)$/; lang.alphabet = ['a', 'b'];
  const c = C.classifyDecomposition(ci, '', 'ab', 'ab', 10);
  lang._regex = null;
  return c.kind === 'unavailable';
});
test('empty y → invalid', () => C.classifyDecomposition(0, 'a', '', 'abb').kind === 'invalid');
test('languageStatus: anbn formal, ab_star verified DFA, custom unavailable', () =>
  C.languageStatus(0).kind === 'formal' && C.languageStatus(idx('ab_star')).kind === 'verified' && C.languageStatus(LANGUAGES.length - 1).kind === 'unavailable');
test('DFA verification detects failure: (ab)* x=a,y=b,z=abab fails at i=0', () => { const v = C.verifyDecompositionDFA(DFA.ab_star, 'a', 'b', 'abab'); return !v.verified && v.failingI === 0; });
test('DFA verification agrees with brute force (div3, every split of aaaaaa, p=3)', () => {
  const L = idx('div3');
  return getValidDecompositions('aaaaaa', 3).every(d => {
    const v = C.verifyDecompositionDFA(DFA.div3, d.x, d.y, d.z).verified;
    let brute = true; for (let i = 0; i <= 12; i++) if (!checkMembership(L, pumpString(d.x, d.y, d.z, i)).inL) brute = false;
    return v === brute;
  });
});

console.log('\n=== DFA / NFA stepping ===');
test('dfaTrace end01 "1101": 5 steps, states 0,0,0,1,2, accepted', () => { const r = C.dfaTrace(DFA.end01, '1101'); return r.steps.length === 5 && r.steps.map(s => s.state).join() === '0,0,0,1,2' && r.accepted; });
test('dfaTrace records from/to/char for each step', () => { const r = C.dfaTrace(DFA.end01, '01'); return r.steps[1].from === 0 && r.steps[1].to === 1 && r.steps[1].char === '0' && r.steps[2].to === 2; });
test('dfaTrace halts on undefined transition', () => { const r = C.dfaTrace(DFA.div3, 'ab'); return r.halted && !r.accepted && r.steps[r.steps.length - 1].dead; });
test('dfaTrace on ε: one step, verdict from start state', () => { const r = C.dfaTrace(DFA.even_a, ''); return r.steps.length === 1 && r.accepted; });
test('nfaTrace ends01 "1001": active sets {0},{0},{0,1},{0,1},{0,2}', () => {
  const r = C.nfaTrace(C.NFA_DEFINITIONS.ends01, '1001');
  return r.accepted && same(r.steps.map(s => s.active), [[0], [0], [0, 1], [0, 1], [0, 2]]);
});
test('nfaTrace ends01 "10" rejected', () => !C.nfaTrace(C.NFA_DEFINITIONS.ends01, '10').accepted);
test('nfaTrace third1 "0100" accepted, "0010" rejected', () => C.nfaTrace(C.NFA_DEFINITIONS.third1, '0100').accepted && !C.nfaTrace(C.NFA_DEFINITIONS.third1, '0010').accepted);
test('nfaTrace ε-closure: a*∪b* starts in {0,1,2}, accepts ε, aaa, bb', () => {
  const d = C.NFA_DEFINITIONS.aOrB;
  return same(C.nfaTrace(d, '').steps[0].active, [0, 1, 2]) && C.nfaTrace(d, '').accepted && C.nfaTrace(d, 'aaa').accepted && C.nfaTrace(d, 'bb').accepted;
});
test('nfaTrace a*∪b* "ab": all branches die → rejected', () => { const r = C.nfaTrace(C.NFA_DEFINITIONS.aOrB, 'ab'); return !r.accepted && r.died && r.steps[2].active.length === 0; });
test('nfaTrace moves list the branching transitions', () => { const r = C.nfaTrace(C.NFA_DEFINITIONS.ends01, '0'); return r.steps[1].moves.length === 2; });

console.log('\n=== Transition builder ===');
test('builder: first state becomes start; max 8 states enforced', () => {
  let m = C.builderCreate();
  for (let i = 0; i < 8; i++) m = C.builderAddState(m).model;
  const over = C.builderAddState(m);
  return m.start === 0 && m.states.length === 8 && over.error !== null && over.model.states.length === 8;
});
test('builder: rejects bad symbol, duplicate transition, missing state', () => {
  let m = C.builderAddState(C.builderCreate()).model;
  m = C.builderAddTransition(m, 0, 0, 'a').model;
  return C.builderAddTransition(m, 0, 0, 'ab').error && C.builderAddTransition(m, 0, 0, '#').error &&
    C.builderAddTransition(m, 0, 0, 'a').error && C.builderAddTransition(m, 0, 5, 'a').error && C.builderAddTransition(m, 0, 0, '').error;
});
test('builder: removing a state removes its transitions and fixes start', () => {
  let m = C.builderExample();
  m = C.builderRemoveState(m, 0).model;
  return m.states.length === 2 && m.transitions.every(t => t.from !== 0 && t.to !== 0) && m.start === 1;
});
test('builder: example NFA accepts "baab", rejects "bba"', () => {
  const a = C.builderToAutomaton(C.builderExample());
  return !a.error && !a.deterministic && C.nfaTrace(a.def, 'baab').accepted && !C.nfaTrace(a.def, 'bba').accepted;
});
test('builder: determinism detection (ε makes it an NFA)', () => {
  let m = C.builderCreate(); m = C.builderAddState(m).model; m = C.builderAddState(m).model;
  m = C.builderAddTransition(m, 0, 1, 'a').model;
  const det = C.builderIsDeterministic(m);
  m = C.builderAddTransition(m, 0, 1, 'ε').model;
  return det && !C.builderIsDeterministic(m);
});
test('builder: toAutomaton errors with no states / toggles final', () => {
  let m = C.builderCreate();
  const e = C.builderToAutomaton(m).error;
  m = C.builderAddState(m).model; m = C.builderToggleFinal(m, 0).model;
  return !!e && same(C.builderToAutomaton(m).def.accepting, [0]) && C.nfaTrace(C.builderToAutomaton(m).def, '').accepted;
});

console.log('\n=== Vending machine ===');
const V = (s, ...evs) => evs.reduce((st, e) => C.vendingReduce(st, e), s);
test('happy path IDLE→SELECTION→PAYMENT→VERIFICATION→DISPENSING→COMPLETE→IDLE with change', () => {
  let s = C.vendingCreate();
  const seen = [s.state];
  for (const e of [{ type: 'START' }, { type: 'SELECT', code: 'b1' }, { type: 'INSERT', amount: 50 }, { type: 'VERIFY' }, { type: 'DISPENSED' }]) { s = C.vendingReduce(s, e); seen.push(s.state); }
  const stockAfter = s.stock.B1;
  s = C.vendingReduce(s, { type: 'COLLECT' }); seen.push(s.state);
  return seen.join('>') === 'IDLE>SELECTION>PAYMENT>VERIFICATION>DISPENSING>COMPLETE>IDLE' && stockAfter === 3;
});
test('change computed: ₹50 for ₹25 product → ₹25 change', () => V(C.vendingCreate(), { type: 'SELECT', code: 'B1' }, { type: 'INSERT', amount: 50 }, { type: 'VERIFY' }).change === 25);
test('insufficient payment → back to PAYMENT with error, then top-up succeeds', () => {
  let s = V(C.vendingCreate(), { type: 'SELECT', code: 'A3' }, { type: 'INSERT', amount: 20 }, { type: 'VERIFY' });
  const ok1 = s.state === 'PAYMENT' && /Insufficient/.test(s.error) && s.credit === 20;
  s = V(s, { type: 'INSERT', amount: 20 }, { type: 'VERIFY' });
  return ok1 && s.state === 'DISPENSING' && s.change === 0;
});
test('invalid code and sold-out product are rejected in SELECTION', () => {
  const a = V(C.vendingCreate(), { type: 'START' }, { type: 'SELECT', code: 'D4' });
  const b = V(C.vendingCreate(), { type: 'START' }, { type: 'SELECT', code: 'C3' });
  return a.state === 'SELECTION' && /Invalid code/.test(a.error) && b.state === 'SELECTION' && /sold out/.test(b.error);
});
test('invalid coin rejected; paying before selecting rejected', () => {
  const a = V(C.vendingCreate(), { type: 'SELECT', code: 'A1' }, { type: 'INSERT', amount: 2 });
  const b = V(C.vendingCreate(), { type: 'INSERT', amount: 10 });
  return a.state === 'PAYMENT' && a.credit === 0 && /not accepted/.test(a.error) && b.state === 'IDLE' && b.error;
});
test('cancel refunds credit and returns to IDLE', () => { const s = V(C.vendingCreate(), { type: 'SELECT', code: 'A2' }, { type: 'INSERT', amount: 10 }, { type: 'VERIFY' }, { type: 'CANCEL' }); return s.state === 'IDLE' && s.credit === 0 && /refunded/.test(s.message); });
test('events invalid for the state leave it unchanged', () => { const s = V(C.vendingCreate(), { type: 'DISPENSED' }); return s.state === 'IDLE' && s.error && s.last.rejected; });
test('reducer is pure (does not mutate input state)', () => { const s0 = C.vendingCreate(); const snap = JSON.stringify(s0); V(s0, { type: 'SELECT', code: 'A1' }, { type: 'INSERT', amount: 20 }, { type: 'VERIFY' }, { type: 'DISPENSED' }); return JSON.stringify(s0) === snap; });

console.log('\n=== Traffic light ===');
test('trafficTick follows RED(6)→GREEN(5)→YELLOW(2)→RED', () => {
  let s = C.trafficCreate(); const seq = [s.phase];
  for (let t = 0; t < 26; t++) { const r = C.trafficTick(s, 0.5); s = r.state; r.transitions.forEach(x => seq.push(x.to)); }
  return seq.join('>') === 'RED>GREEN>YELLOW>RED';
});
test('large dt crosses several states at once; cycles counted', () => { const r = C.trafficTick(C.trafficCreate(), 13 * 2 + 1); return r.transitions.length === 6 && r.state.phase === 'RED' && r.state.cycles === 2 && Math.abs(r.state.elapsed - 1) < 1e-9; });
test('remaining time and non-positive dt', () => { const s = C.trafficTick(C.trafficCreate(), 2).state; return Math.abs(C.trafficRemaining(s) - 4) < 1e-9 && C.trafficTick(s, 0).state === s; });
test('cross street and pedestrians only go while main is RED', () => {
  const red = C.trafficTick(C.trafficCreate(), 2).state, green = C.trafficTick(C.trafficCreate(), 7).state, lateRed = C.trafficTick(C.trafficCreate(), 5.2).state;
  return C.trafficCrossPhase(red) === 'GREEN' && C.trafficWalk(red) && C.trafficCrossPhase(green) === 'RED' && !C.trafficWalk(green) && C.trafficCrossPhase(lateRed) === 'YELLOW' && !C.trafficWalk(lateRed);
});
test('car before stop line does not cross on RED but does on GREEN', () => {
  const cars = [{ id: 'a', pos: 20 }];
  let red = cars; for (let k = 0; k < 20; k++) red = C.advanceCars(red, 'RED', 0.2, { stopLine: 25 });
  let green = cars; for (let k = 0; k < 5; k++) green = C.advanceCars(green, 'GREEN', 0.2, { stopLine: 25 });
  return red[0].pos === 25 && green[0].pos > 25;
});
test('cars keep a minimum gap while queueing at RED', () => {
  let cars = [{ id: 'a', pos: 20 }, { id: 'b', pos: 5 }, { id: 'c', pos: -5 }];
  for (let k = 0; k < 40; k++) cars = C.advanceCars(cars, 'RED', 0.2, { stopLine: 25, gap: 9 });
  const p = cars.map(c => c.pos).sort((x, y) => y - x);
  return p[0] === 25 && p[0] - p[1] >= 9 - 1e-9 && p[1] - p[2] >= 9 - 1e-9;
});

console.log('\n=== Password validator ===');
test('character classes', () => C.pwClass('A') === 'U' && C.pwClass('z') === 'L' && C.pwClass('7') === 'D' && C.pwClass('#') === 'S' && C.pwClass(' ') === 'space');
test('"Lab#2026x" accepted, ends in qUDS', () => { const r = C.runPassword('Lab#2026x'); return r.accepted && r.final === 7 && r.missing.length === 0; });
test('missing requirements reported', () => { const r = C.runPassword('abcdefgh'); return !r.accepted && r.missing.join('|') === 'an uppercase letter|a digit|a symbol'; });
test('short password rejected on length only', () => { const r = C.runPassword('Ab1#'); return !r.accepted && r.final === 7 && !r.lenOk && r.missing.length === 1; });
test('space sends to trap permanently', () => { const r = C.runPassword('Ab1# xyzW'); return !r.accepted && r.final === C.PW_TRAP && r.missing.includes('no spaces'); });
test('one step per character with from/to chain', () => { const r = C.runPassword('aB1'); return r.steps.length === 4 && r.steps.slice(1).every((s, k) => s.from === r.steps[k].to); });

console.log('\n=== Binary recogniser ===');
test('runBinary accepts 1101 and 01, rejects 110 and ε', () => C.runBinary('1101').accepted && C.runBinary('01').accepted && !C.runBinary('110').accepted && !C.runBinary('').accepted);
test('runBinary rejects non-binary input with an error', () => !!C.runBinary('102').error && C.runBinary('102').steps.length === 0);
test('runBinary agrees with the end01 language on all strings up to length 6', () => {
  const L = idx('end01');
  for (let n = 0; n <= 6; n++) for (let k = 0; k < (1 << n); k++) {
    const s = n ? k.toString(2).padStart(n, '0') : '';
    if (C.runBinary(s).accepted !== checkMembership(L, s).inL) return false;
  }
  return true;
});

console.log('\n=== Guided experiments ===');
test('suggested strings are valid for p = 1..6', () => C.EXPERIMENTS.every(e => [1, 2, 3, 4, 5, 6].every(p => C.experimentCheckString(e, e.bestW(p), p).ok)));
test('anbn and 0n1n: every legal decomposition breaks (p = 2..5)', () => [2, 3, 4, 5].every(p => C.experimentObserve(C.EXPERIMENTS[0], C.EXPERIMENTS[0].bestW(p), p).allBroken && C.experimentObserve(C.EXPERIMENTS[2], C.EXPERIMENTS[2].bestW(p), p).allBroken));
test('aⁿ: every legal decomposition is verified for all i (p = 1..5)', () => [1, 2, 3, 4, 5].every(p => C.experimentObserve(C.EXPERIMENTS[1], C.EXPERIMENTS[1].bestW(p), p).allVerified));
test('five experiments, unique ids, palindromes and primes included', () => C.EXPERIMENTS.length === 5 && new Set(C.EXPERIMENTS.map(e => e.id)).size === 5 && C.EXPERIMENTS[3].langId === 'palindrome' && C.EXPERIMENTS[4].langId === 'a_prime');
test('palindromes and primes: every legal split breaks (p = 2..5)', () => [2, 3, 4, 5].every(p => C.experimentObserve(C.EXPERIMENTS[3], C.EXPERIMENTS[3].bestW(p), p).allBroken && C.experimentObserve(C.EXPERIMENTS[4], C.EXPERIMENTS[4].bestW(p), p).allBroken));
test('palindrome trap string a^(2p) cannot be broken in i = 0..5', () => { const o = C.experimentObserve(C.EXPERIMENTS[3], 'aaaaaa', 3); return !o.allBroken && o.rows.every(r => r.cells.every(Boolean)); });
test('each experiment offers exactly one recommended candidate that is valid', () => C.EXPERIMENTS.every(e => [3, 4].every(p => e.candidates(p).filter(c => C.experimentCheckString(e, c.w, p).ok).length >= 1 && C.experimentCheckString(e, e.bestW(p), p).ok)));
test('observation matrix cells match pumpSeries for i = 0..5', () => {
  const o = C.experimentObserve(C.EXPERIMENTS[0], 'aaabbb', 3);
  return o.rows.every(r => r.cells.length === 6 && same(r.cells, C.pumpSeries(idx('anbn1'), r.x, r.y, r.z, 0, 5).map(s => s.inL)));
});
test('experiment definitions are complete (palindrome keeps "w = wᴿ")', () =>
  C.EXPERIMENTS[3].def === 'L = { w ∈ {a,b}* | w = wᴿ }' && C.EXPERIMENTS.every(e => /^L = \{.*\}$/.test(e.def)));
test('sampleMembers enumerates real members in length order', () =>
  same(C.sampleMembers('anbn1', 6, 8), ['ab', 'aabb', 'aaabbb', 'aaaabbbb']) &&
  same(C.sampleMembers('palindrome', 6, 8), ['', 'a', 'b', 'aa', 'bb', 'aaa']) &&
  same(C.sampleMembers('a_prime', 3, 8), ['aa', 'aaa', 'aaaaa']));
test('notebook grows with progress and ends in a contradiction (aⁿbⁿ)', () => {
  const e = C.EXPERIMENTS[0], w = e.bestW(3);
  const base = { assumptionOk: false, p: 3, pFixed: false, w: null, wOk: false, split: null, pumped: null, observed: null, concluded: false };
  const n0 = C.experimentNotebook(e, base).length;
  const full = C.experimentNotebook(e, { ...base, assumptionOk: true, pFixed: true, w, wOk: true, split: { x: '', y: 'a', z: 'aabbb' }, pumped: { i: 2, str: 'aaaabbb', inL: false }, observed: C.experimentObserve(e, w, 3), concluded: true });
  const text = full.map(l => l.text).join(' ');
  return n0 === 1 && full.length > 8 && full[full.length - 1].kind === 'qed' && /not regular/.test(full[full.length - 1].text) &&
    text.includes(LANGUAGES[idx('anbn1')].proofTemplate(3).yRegion) && text.includes('Suppose, for contradiction');
});
test('notebook for aⁿ credits the DFA, not the lemma', () => {
  const e = C.EXPERIMENTS[1], w = e.bestW(2);
  const nb = C.experimentNotebook(e, { assumptionOk: true, p: 2, pFixed: true, w, wOk: true, split: { x: '', y: 'a', z: 'aaa' }, pumped: { i: 0, str: 'aaa', inL: true }, observed: C.experimentObserve(e, w, 2), concluded: true });
  return /DFA/.test(nb[nb.length - 1].text) && !nb.some(l => /contradiction/.test(l.text));
});
test('notebook omits general template lines for a non-standard w', () => {
  const e = C.EXPERIMENTS[0];
  const nb = C.experimentNotebook(e, { assumptionOk: true, p: 2, pFixed: true, w: 'aaabbb', wOk: true, split: { x: '', y: 'a', z: 'aabbb' }, pumped: null, observed: null, concluded: false });
  return !nb.some(l => l.text === LANGUAGES[idx('anbn1')].proofTemplate(2).yRegion) && nb.some(l => /any split/.test(l.text));
});
test('experimentCheckString rejects too-short and non-member strings', () => !C.experimentCheckString(C.EXPERIMENTS[0], 'ab', 3).ok && !C.experimentCheckString(C.EXPERIMENTS[0], 'aab', 1).ok);

console.log('\n=== Challenge Zone / quiz randomisation ===');
const BANK = C.buildQuestionBank();
test('bank has ≥ 12 questions per level and unique ids', () => C.LEVELS.every(l => BANK.filter(q => q.level === l).length >= 12) && new Set(BANK.map(q => q.id)).size === BANK.length);
test('every question has a valid answer index and an explanation', () => BANK.every(q => Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length && q.explanation));
test('all six question types are present', () => ['mcq', 'tf', 'decomp', 'invalid', 'membership', 'predict'].every(t => BANK.some(q => q.type === t)));
test('membership questions match the engine', () => BANK.filter(q => q.type === 'membership').every(q => {
  const m = q.explanation.match(/= (\S+)\. It is (not )?in L/); return !!m && (q.answer === 1) === !!m[2];
}));
test('same seed → same round; different seeds → different order', () => {
  const a = C.createQuizRound(BANK, 'intermediate', { rng: C.mulberry32(42) }).questions.map(q => q.id);
  const b = C.createQuizRound(BANK, 'intermediate', { rng: C.mulberry32(42) }).questions.map(q => q.id);
  const c = C.createQuizRound(BANK, 'intermediate', { rng: C.mulberry32(43) }).questions.map(q => q.id);
  return same(a, b) && !same(a, c) && a.length === 6;
});
test('no repeats within a session until the level is exhausted, then recycle', () => {
  const used = new Set(); const seen = [];
  for (let r = 0; r < 2; r++) {
    const round = C.createQuizRound(BANK, 'advanced', { used, rng: C.mulberry32(100 + r) });
    if (round.recycled) return false;
    round.questions.forEach(q => { seen.push(q.id); used.add(q.id); });
  }
  const pool = BANK.filter(q => q.level === 'advanced').length;
  while (used.size < pool) { const r = C.createQuizRound(BANK, 'advanced', { used, rng: C.mulberry32(used.size) }); r.questions.forEach(q => used.add(q.id)); }
  const after = C.createQuizRound(BANK, 'advanced', { used, rng: C.mulberry32(9) });
  return new Set(seen).size === seen.length && after.recycled && after.questions.length > 0;
});
test('option shuffling keeps the correct answer text', () => BANK.every(q => { const s = C.shuffleQuestion(q, C.mulberry32(5)); return s.options[s.answer] === q.options[q.answer] && s.options.length === q.options.length; }));
test('answerQuizRound scores once per question; nextQuizQuestion advances', () => {
  let r = C.createQuizRound(BANK, 'beginner', { rng: C.mulberry32(1), size: 2 });
  const q = r.questions[0];
  let res = C.answerQuizRound(r, q.answer); r = res.round;
  const again = C.answerQuizRound(r, (q.answer + 1) % q.options.length);
  const n = C.nextQuizQuestion(again.round);
  return res.correct && again.round.score === 1 && n.round.index === 1 && !n.done;
});

console.log('\n=== Progress (localStorage) ===');
function memStore() { const m = {}; return { getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: k => { delete m[k]; }, _m: m }; }
test('progress persists across store instances', () => {
  const st = memStore(); const p1 = C.createProgressStore(st);
  p1.completeExperiment('exp-anbn'); p1.recordAnswer(true); p1.recordAnswer(false); p1.learn('dfa'); p1.learn('dfa');
  const s = C.createProgressStore(st).summary();
  return s.experimentsDone === 1 && s.attempted === 2 && s.correct === 1 && s.conceptsDone === 1 && s.persistent;
});
test('overall progress formula reaches 100 when everything is done', () => {
  const p = C.createProgressStore(memStore());
  C.EXPERIMENTS.forEach(e => p.completeExperiment(e.id)); Object.keys(C.CONCEPTS).forEach(k => p.learn(k));
  for (let k = 0; k < 15; k++) p.recordAnswer(true);
  return p.summary().overall === 100;
});
test('throwing storage does not break the store', () => {
  const bad = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } };
  const p = C.createProgressStore(bad); p.learn('nfa');
  const s = p.summary(); return s.conceptsDone === 1 && s.persistent === false;
});
test('corrupt or hostile saved data is sanitised', () => {
  const st = memStore(); st.setItem(C.PROGRESS_KEY, '{"experiments":{"exp-anbn":true,"evil":true},"attempted":-5,"correct":99,"concepts":{"dfa":"yes","nfa":true}}');
  const s = C.createProgressStore(st).summary();
  const st2 = memStore(); st2.setItem(C.PROGRESS_KEY, 'not json{');
  return s.experimentsDone === 1 && s.attempted === 0 && s.correct === 0 && s.conceptsDone === 1 && C.createProgressStore(st2).summary().attempted === 0;
});
test('unknown experiment / concept ids are ignored; reset clears', () => {
  const p = C.createProgressStore(memStore()); p.completeExperiment('nope'); p.learn('nope'); p.learn('pumping'); p.reset();
  return p.summary().conceptsDone === 0 && p.summary().experimentsDone === 0;
});

console.log('\n=== Results: ' + pass + ' passed, ' + fail + ' failed ===');
if (fail > 0) process.exit(1);
console.log('ALL TESTS PASSED');
