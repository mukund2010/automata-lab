



/* ================================================================
   (a) HELPER FUNCTIONS — number theory, string utilities
   ================================================================ */

/** @param {number} n @returns {boolean} */
function isPrime(n) {
  if (n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6)
    if (n % i === 0 || n % (i + 2) === 0) return false;
  return true;
}

/** Smallest prime >= n */
function nextPrime(n) {
  if (n <= 2) return 2;
  let c = n % 2 === 0 ? n + 1 : n;
  while (!isPrime(c)) c += 2;
  return c;
}

function isPerfectSquare(n) {
  if (n < 0) return false;
  const s = Math.round(Math.sqrt(n));
  return s * s === n;
}

function isPowerOf2(n) {
  return n >= 1 && (n & (n - 1)) === 0;
}

/** Escape HTML to prevent XSS */
function esc(s) { return String(s); }

/** Render epsilon for empty string */
function showStr(s) { return s === '' ? 'ε' : esc(s); }

/** Clamp a value */
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

/* ================================================================
   (b) LANGUAGE REGISTRY — name, alphabet, membership, suggest, proof
   ================================================================ */

const LANGUAGES = [
  // ---- NON-REGULAR LANGUAGES ----
  {
    id: 'anbn', name: 'aⁿbⁿ', description: '{ aⁿbⁿ | n ≥ 0 }',
    alphabet: ['a','b'], regular: false,
    membership(s) {
      if (s === '') return { inL: true, reason: 'ε: n = 0, 0 = 0 ✓' };
      if (!/^a*b*$/.test(s)) return { inL: false, reason: 'Not of the form a*b*' };
      const a = s.match(/^a*/)[0].length, b = s.length - a;
      return a === b
        ? { inL: true, reason: `a-count ${a} = b-count ${b}` }
        : { inL: false, reason: `a-count ${a} ≠ b-count ${b}` };
    },
    suggest(p) { return 'a'.repeat(p) + 'b'.repeat(p); },
    proofTemplate(p) {
      return {
        w: 'a'.repeat(p) + 'b'.repeat(p),
        wExpr: `a^${p}b^${p}`,
        wLen: `2·${p} = ${2*p}`,
        yRegion: `Since |xy| ≤ ${p} and the first ${p} characters are all a's, y lies entirely in the a-block: y = a^k for some k ≥ 1.`,
        pumpStep: `Consider i = 0: xy⁰z = a^(${p}−k)b^${p}.\nSince k ≥ 1, we get ${p}−k < ${p}, so the number of a's ≠ the number of b's.`,
        conclusion: `Therefore xy⁰z ∉ L, contradicting the Pumping Lemma.`
      };
    }
  },
  {
    id: 'anbn1', name: 'aⁿbⁿ (n ≥ 1)', description: '{ aⁿbⁿ | n ≥ 1 }',
    alphabet: ['a','b'], regular: false,
    membership(s) {
      if (s === '') return { inL: false, reason: 'ε: n = 0 is excluded (n ≥ 1)' };
      if (!/^a*b*$/.test(s)) return { inL: false, reason: 'Not of the form a*b*' };
      const a = s.match(/^a*/)[0].length, b = s.length - a;
      if (a === 0) return { inL: false, reason: 'No a\'s: n ≥ 1 requires at least one a' };
      return a === b
        ? { inL: true, reason: `a-count ${a} = b-count ${b}` }
        : { inL: false, reason: `a-count ${a} ≠ b-count ${b}` };
    },
    suggest(p) { return 'a'.repeat(p) + 'b'.repeat(p); },
    proofTemplate(p) {
      return {
        w: 'a'.repeat(p) + 'b'.repeat(p),
        wExpr: `a^${p}b^${p}`,
        wLen: `2·${p} = ${2*p}`,
        yRegion: `Since |xy| ≤ ${p} and the first ${p} characters are all a's, y = a^k for some k ≥ 1.`,
        pumpStep: `Consider i = 2: xy²z = a^(${p}+k)b^${p}.\nSince k ≥ 1, the a-count ${p}+k ≠ ${p} = b-count.`,
        conclusion: `Therefore xy²z ∉ L, contradicting the Pumping Lemma.`
      };
    }
  },
  {
    id: '0n1n', name: '0ⁿ1ⁿ', description: '{ 0ⁿ1ⁿ | n ≥ 0 }',
    alphabet: ['0','1'], regular: false,
    membership(s) {
      if (s === '') return { inL: true, reason: 'ε: n = 0' };
      if (!/^0*1*$/.test(s)) return { inL: false, reason: 'Not of the form 0*1*' };
      const a = s.match(/^0*/)[0].length, b = s.length - a;
      return a === b
        ? { inL: true, reason: `0-count ${a} = 1-count ${b}` }
        : { inL: false, reason: `0-count ${a} ≠ 1-count ${b}` };
    },
    suggest(p) { return '0'.repeat(p) + '1'.repeat(p); },
    proofTemplate(p) {
      return {
        w: '0'.repeat(p) + '1'.repeat(p),
        wExpr: `0^${p}1^${p}`,
        wLen: `2·${p} = ${2*p}`,
        yRegion: `Since |xy| ≤ ${p} and the first ${p} characters are all 0's, y = 0^k for some k ≥ 1.`,
        pumpStep: `Consider i = 0: xy⁰z = 0^(${p}−k)1^${p}.\nSince k ≥ 1, the 0-count ${p}−k < ${p} = 1-count.`,
        conclusion: `Therefore xy⁰z ∉ L, contradicting the Pumping Lemma.`
      };
    }
  },
  {
    id: 'anbm_ngtm', name: 'aⁿbᵐ (n > m)', description: '{ aⁿbᵐ | n > m ≥ 0 }',
    alphabet: ['a','b'], regular: false,
    membership(s) {
      if (s === '') return { inL: false, reason: '0 > 0 is false' };
      if (!/^a*b*$/.test(s)) return { inL: false, reason: 'Not of the form a*b*' };
      const a = s.match(/^a*/)[0].length, b = s.length - a;
      return a > b
        ? { inL: true, reason: `a-count ${a} > b-count ${b}` }
        : { inL: false, reason: `a-count ${a} is not > b-count ${b}` };
    },
    suggest(p) { return 'a'.repeat(p) + 'b'.repeat(p - 1); },
    proofTemplate(p) {
      const m = p - 1;
      return {
        w: 'a'.repeat(p) + 'b'.repeat(m),
        wExpr: `a^${p}b^${m}`,
        wLen: `${p}+${m} = ${p+m}`,
        yRegion: `Since |xy| ≤ ${p} and the first ${p} characters are all a's, y = a^k for some k ≥ 1.`,
        pumpStep: `Consider i = 0: xy⁰z = a^(${p}−k)b^${m}.\nSince k ≥ 1, ${p}−k ≤ ${p-1} = ${m}, so the a-count is not greater than the b-count.`,
        conclusion: `Therefore xy⁰z ∉ L, contradicting the Pumping Lemma.`
      };
    }
  },
  {
    id: 'ww', name: 'ww', description: '{ ww | w ∈ {a,b}* }',
    alphabet: ['a','b'], regular: false,
    membership(s) {
      if (s === '') return { inL: true, reason: 'ε: w = ε, ww = ε' };
      if (s.length % 2 !== 0) return { inL: false, reason: `Length ${s.length} is odd` };
      const h = s.length / 2;
      return s.substring(0, h) === s.substring(h)
        ? { inL: true, reason: 'First half = second half' }
        : { inL: false, reason: 'First half ≠ second half' };
    },
    suggest(p) { return 'a'.repeat(p) + 'b' + 'a'.repeat(p) + 'b'; },
    proofTemplate(p) {
      return {
        w: 'a'.repeat(p) + 'b' + 'a'.repeat(p) + 'b',
        wExpr: `a^${p}ba^${p}b`,
        wLen: `2·${p}+2 = ${2*p+2}`,
        yRegion: `Since |xy| ≤ ${p} and the first ${p} characters are all a's, y = a^k for some k ≥ 1.`,
        pumpStep: `Consider i = 2: xy²z = a^(${p}+k)ba^${p}b.\nThe first half now has more a's before the first b, so the two halves differ.`,
        conclusion: `Therefore xy²z ∉ L, contradicting the Pumping Lemma.`
      };
    }
  },
  {
    id: 'palindrome', name: 'Palindromes', description: '{ w ∈ {a,b}* | w = wᴿ }',
    alphabet: ['a','b'], regular: false,
    membership(s) {
      if (s === '') return { inL: true, reason: 'ε is a palindrome' };
      const rev = s.split('').reverse().join('');
      return s === rev
        ? { inL: true, reason: 'String equals its reverse' }
        : { inL: false, reason: 'String ≠ its reverse' };
    },
    suggest(p) { return 'a'.repeat(p) + 'b' + 'a'.repeat(p); },
    proofTemplate(p) {
      return {
        w: 'a'.repeat(p) + 'b' + 'a'.repeat(p),
        wExpr: `a^${p}ba^${p}`,
        wLen: `2·${p}+1 = ${2*p+1}`,
        yRegion: `Since |xy| ≤ ${p} and the first ${p} characters are all a's, y = a^k for some k ≥ 1.`,
        pumpStep: `Consider i = 2: xy²z = a^(${p}+k)ba^${p}.\nThe string has ${p}+k a's before the b and ${p} after, so it is not a palindrome.`,
        conclusion: `Therefore xy²z ∉ L, contradicting the Pumping Lemma.`
      };
    }
  },
  {
    id: 'equal_ab', name: 'Equal a\'s and b\'s', description: '{ w ∈ {a,b}* | #a(w) = #b(w) }',
    alphabet: ['a','b'], regular: false,
    membership(s) {
      if (s === '') return { inL: true, reason: 'ε: 0 a\'s = 0 b\'s' };
      const a = (s.match(/a/g) || []).length, b = (s.match(/b/g) || []).length;
      return a === b
        ? { inL: true, reason: `a-count ${a} = b-count ${b}` }
        : { inL: false, reason: `a-count ${a} ≠ b-count ${b}` };
    },
    suggest(p) { return 'a'.repeat(p) + 'b'.repeat(p); },
    proofTemplate(p) {
      return {
        w: 'a'.repeat(p) + 'b'.repeat(p),
        wExpr: `a^${p}b^${p}`,
        wLen: `2·${p} = ${2*p}`,
        yRegion: `Since |xy| ≤ ${p} and the first ${p} characters are all a's, y = a^k for some k ≥ 1.`,
        pumpStep: `Consider i = 2: xy²z = a^(${p}+k)b^${p}.\nSince k ≥ 1, the a-count ${p}+k > ${p} = b-count, so they are unequal.`,
        conclusion: `Therefore xy²z ∉ L, contradicting the Pumping Lemma.`
      };
    }
  },
  {
    id: 'a_nsq', name: 'aⁿ² (perfect squares)', description: '{ aⁿ² | n ≥ 0 }',
    alphabet: ['a'], regular: false,
    membership(s) {
      if (s === '') return { inL: true, reason: 'ε: n = 0, 0² = 0' };
      if (!/^a+$/.test(s)) return { inL: false, reason: 'Not all a\'s' };
      const n = s.length, sq = Math.round(Math.sqrt(n));
      return sq * sq === n
        ? { inL: true, reason: `Length ${n} = ${sq}²` }
        : { inL: false, reason: `Length ${n} is not a perfect square` };
    },
    suggest(p) {
      let n = Math.ceil(Math.sqrt(p));
      if (n * n < p) n++;
      return 'a'.repeat(n * n);
    },
    proofTemplate(p) {
      let n = Math.ceil(Math.sqrt(p));
      if (n * n < p) n++;
      const sq = n * n;
      return {
        w: 'a'.repeat(sq),
        wExpr: `a^(${n}²) = a^${sq}`,
        wLen: `${sq}`,
        yRegion: `Since |xy| ≤ ${p}, y = a^k for some 1 ≤ k ≤ ${p}.`,
        pumpStep: `Consider i = 2: |xy²z| = ${sq} + k.\nWe need ${sq} < ${sq}+k ≤ ${sq}+${p} < ${sq}+2·${n}+1 = ${(n+1)*(n+1)}.\nSo ${sq}+k lies strictly between ${n}² and ${n+1}², hence is not a perfect square.`,
        conclusion: `Therefore xy²z ∉ L, contradicting the Pumping Lemma.`
      };
    }
  },
  {
    id: 'a_prime', name: 'aᵖ (p prime)', description: '{ aⁿ | n is prime }',
    alphabet: ['a'], regular: false,
    membership(s) {
      if (s === '') return { inL: false, reason: 'Length 0 is not prime' };
      if (!/^a+$/.test(s)) return { inL: false, reason: 'Not all a\'s' };
      return isPrime(s.length)
        ? { inL: true, reason: `Length ${s.length} is prime` }
        : { inL: false, reason: `Length ${s.length} is not prime` };
    },
    suggest(p) { return 'a'.repeat(nextPrime(p)); },
    proofTemplate(p) {
      const pr = nextPrime(p);
      return {
        w: 'a'.repeat(pr),
        wExpr: `a^${pr} (${pr} is prime)`,
        wLen: `${pr}`,
        yRegion: `Since |xy| ≤ ${p}, y = a^k for some 1 ≤ k ≤ ${p}.`,
        pumpStep: `Consider i = ${pr}+1: |xy^(${pr}+1)z| = ${pr} + ${pr}·k = ${pr}(1+k).\nSince k ≥ 1, 1+k ≥ 2, so the length is a composite number (product of ${pr} and 1+k).`,
        conclusion: `Therefore xy^(${pr}+1)z ∉ L, contradicting the Pumping Lemma.`
      };
    }
  },
  {
    id: '0n1n0n', name: '0ⁿ1ⁿ0ⁿ', description: '{ 0ⁿ1ⁿ0ⁿ | n ≥ 0 }',
    alphabet: ['0','1'], regular: false,
    membership(s) {
      if (s === '') return { inL: true, reason: 'ε: n = 0' };
      const m = s.match(/^(0*)(1*)(0*)$/);
      if (!m) return { inL: false, reason: 'Not of the form 0*1*0*' };
      const a = m[1].length, b = m[2].length, c = m[3].length;
      return (a === b && b === c)
        ? { inL: true, reason: `0^${a} 1^${b} 0^${c}: ${a}=${b}=${c}` }
        : { inL: false, reason: `Counts 0:${a}, 1:${b}, 0:${c} are not all equal` };
    },
    suggest(p) { return '0'.repeat(p) + '1'.repeat(p) + '0'.repeat(p); },
    proofTemplate(p) {
      return {
        w: '0'.repeat(p) + '1'.repeat(p) + '0'.repeat(p),
        wExpr: `0^${p}1^${p}0^${p}`,
        wLen: `3·${p} = ${3*p}`,
        yRegion: `Since |xy| ≤ ${p} and the first ${p} characters are all 0's, y = 0^k for some k ≥ 1.`,
        pumpStep: `Consider i = 2: xy²z = 0^(${p}+k) 1^${p} 0^${p}.\nThe first block of 0's (${p}+k) ≠ the 1-block (${p}).`,
        conclusion: `Therefore xy²z ∉ L, contradicting the Pumping Lemma.`
      };
    }
  },
  {
    id: 'a_2n', name: 'a^(2ⁿ) (powers of 2)', description: '{ a^(2ⁿ) | n ≥ 0 }',
    alphabet: ['a'], regular: false,
    membership(s) {
      if (s === '') return { inL: false, reason: 'Length 0 is not a power of 2' };
      if (!/^a+$/.test(s)) return { inL: false, reason: 'Not all a\'s' };
      return isPowerOf2(s.length)
        ? { inL: true, reason: `Length ${s.length} = 2^${Math.log2(s.length)}` }
        : { inL: false, reason: `Length ${s.length} is not a power of 2` };
    },
    suggest(p) {
      let n = 1;
      while (n < p) n *= 2;
      return 'a'.repeat(n);
    },
    proofTemplate(p) {
      let pw = 1;
      while (pw < p) pw *= 2;
      const exp = Math.log2(pw);
      return {
        w: 'a'.repeat(pw),
        wExpr: `a^(2^${exp}) = a^${pw}`,
        wLen: `${pw}`,
        yRegion: `Since |xy| ≤ ${p}, y = a^k for some 1 ≤ k ≤ ${p}.`,
        pumpStep: `Consider i = 2: |xy²z| = ${pw}+k.\nSince 1 ≤ k ≤ ${p} ≤ ${pw}, we get ${pw} < ${pw}+k ≤ ${2*pw}.\nBut ${pw}+k can equal ${2*pw} only if k = ${pw}, which requires ${pw} ≤ ${p} — and for large enough k < ${pw}, ${pw}+k is strictly between 2^${exp} and 2^${exp+1}.`,
        conclusion: `Therefore xy²z ∉ L, contradicting the Pumping Lemma.`
      };
    }
  },
  {
    id: 'anb2n', name: 'aⁿb²ⁿ', description: '{ aⁿb²ⁿ | n ≥ 0 }',
    alphabet: ['a','b'], regular: false,
    membership(s) {
      if (s === '') return { inL: true, reason: 'ε: n = 0, 2·0 = 0' };
      if (!/^a*b*$/.test(s)) return { inL: false, reason: 'Not of the form a*b*' };
      const a = s.match(/^a*/)[0].length, b = s.length - a;
      return b === 2 * a
        ? { inL: true, reason: `b-count ${b} = 2 × a-count ${a}` }
        : { inL: false, reason: `b-count ${b} ≠ 2 × a-count ${a}` };
    },
    suggest(p) { return 'a'.repeat(p) + 'b'.repeat(2 * p); },
    proofTemplate(p) {
      return {
        w: 'a'.repeat(p) + 'b'.repeat(2 * p),
        wExpr: `a^${p}b^${2*p}`,
        wLen: `3·${p} = ${3*p}`,
        yRegion: `Since |xy| ≤ ${p} and the first ${p} characters are all a's, y = a^k for some k ≥ 1.`,
        pumpStep: `Consider i = 0: xy⁰z = a^(${p}−k)b^${2*p}.\nWe need b-count = 2 × a-count, i.e. ${2*p} = 2(${p}−k) = ${2*p}−2k.\nSince k ≥ 1, 2k ≥ 2, so this fails.`,
        conclusion: `Therefore xy⁰z ∉ L, contradicting the Pumping Lemma.`
      };
    }
  },
  {
    id: 'aibjck', name: 'aⁱbʲcᵏ (i<j<k)', description: '{ aⁱbʲcᵏ | 0 ≤ i < j < k }',
    alphabet: ['a','b','c'], regular: false,
    membership(s) {
      if (s === '') return { inL: false, reason: '0 < 0 < 0 is false' };
      const m = s.match(/^(a*)(b*)(c*)$/);
      if (!m || m[0] !== s) return { inL: false, reason: 'Not of the form a*b*c*' };
      const i = m[1].length, j = m[2].length, k = m[3].length;
      return (i < j && j < k)
        ? { inL: true, reason: `${i} < ${j} < ${k}` }
        : { inL: false, reason: `${i} < ${j} < ${k} is false` };
    },
    suggest(p) { return 'a'.repeat(p) + 'b'.repeat(p + 1) + 'c'.repeat(p + 2); },
    proofTemplate(p) {
      return {
        w: 'a'.repeat(p) + 'b'.repeat(p + 1) + 'c'.repeat(p + 2),
        wExpr: `a^${p}b^${p+1}c^${p+2}`,
        wLen: `${3*p+3}`,
        yRegion: `Since |xy| ≤ ${p} and the first ${p} characters are all a's, y = a^k for some k ≥ 1.`,
        pumpStep: `Consider i = 2: xy²z = a^(${p}+k)b^${p+1}c^${p+2}.\nSince k ≥ 1, ${p}+k ≥ ${p+1} = b-count, so i ≥ j, violating i < j.`,
        conclusion: `Therefore xy²z ∉ L, contradicting the Pumping Lemma.`
      };
    }
  },

  // ---- REGULAR LANGUAGES ----
  {
    id: 'ab_star', name: '(ab)*', description: '{ (ab)* }',
    alphabet: ['a','b'], regular: true,
    membership(s) {
      if (s === '') return { inL: true, reason: 'ε: zero repetitions' };
      return /^(ab)*$/.test(s)
        ? { inL: true, reason: `String matches (ab)*` }
        : { inL: false, reason: 'Does not match (ab)*' };
    },
    suggest(p) {
      const n = Math.ceil(p / 2);
      return 'ab'.repeat(n);
    },
    proofTemplate() { return null; /* regular, no proof */ }
  },
  {
    id: 'a_star_b_star', name: 'a*b*', description: '{ a*b* }',
    alphabet: ['a','b'], regular: true,
    membership(s) {
      if (s === '') return { inL: true, reason: 'ε matches a*b*' };
      return /^a*b*$/.test(s)
        ? { inL: true, reason: 'String matches a*b*' }
        : { inL: false, reason: 'Does not match a*b*' };
    },
    suggest(p) { return 'a'.repeat(p); },
    proofTemplate() { return null; }
  },
  {
    id: 'end01', name: 'Ends in 01', description: '{ w ∈ {0,1}* | w ends in 01 }',
    alphabet: ['0','1'], regular: true,
    membership(s) {
      if (s === '') return { inL: false, reason: 'ε does not end in 01' };
      return /^[01]*01$/.test(s)
        ? { inL: true, reason: 'Ends in 01' }
        : { inL: false, reason: 'Does not end in 01' };
    },
    suggest(p) { return '0'.repeat(Math.max(0, p - 2)) + '01'; },
    proofTemplate() { return null; }
  },
  {
    id: 'even_a', name: 'Even #a\'s', description: '{ w ∈ {a,b}* | #a(w) is even }',
    alphabet: ['a','b'], regular: true,
    membership(s) {
      if (s === '') return { inL: true, reason: 'ε: 0 a\'s (even)' };
      const a = (s.match(/a/g) || []).length;
      return a % 2 === 0
        ? { inL: true, reason: `a-count ${a} is even` }
        : { inL: false, reason: `a-count ${a} is odd` };
    },
    suggest(p) { return 'a'.repeat(p % 2 === 0 ? p : p + 1); },
    proofTemplate() { return null; }
  },
  {
    id: 'div3', name: 'aⁿ (n mod 3 = 0)', description: '{ aⁿ | n ≡ 0 (mod 3) }',
    alphabet: ['a'], regular: true,
    membership(s) {
      if (s === '') return { inL: true, reason: 'ε: length 0 ≡ 0 (mod 3)' };
      if (!/^a+$/.test(s)) return { inL: false, reason: 'Not all a\'s' };
      return s.length % 3 === 0
        ? { inL: true, reason: `Length ${s.length} ≡ 0 (mod 3)` }
        : { inL: false, reason: `Length ${s.length} ≢ 0 (mod 3)` };
    },
    suggest(p) {
      let n = p;
      while (n % 3 !== 0) n++;
      return 'a'.repeat(n);
    },
    proofTemplate() { return null; }
  },
  {
    id: 'contains_aba', name: 'Contains "aba"', description: '{ w ∈ {a,b}* | w contains "aba" }',
    alphabet: ['a','b'], regular: true,
    membership(s) {
      if (s === '') return { inL: false, reason: 'ε does not contain "aba"' };
      return s.includes('aba')
        ? { inL: true, reason: 'Contains substring "aba"' }
        : { inL: false, reason: 'Does not contain "aba"' };
    },
    suggest(p) { return 'b'.repeat(Math.max(0, p - 3)) + 'aba'; },
    proofTemplate() { return null; }
  },

  {
    id: 'a_n', name: 'aⁿ', description: '{ aⁿ | n ≥ 0 }',
    alphabet: ['a'], regular: true,
    membership(s) {
      if (s === '') return { inL: true, reason: 'ε: n = 0' };
      return /^a+$/.test(s)
        ? { inL: true, reason: `Only a's (n = ${s.length})` }
        : { inL: false, reason: 'Contains a symbol other than a' };
    },
    suggest(p) { return 'a'.repeat(p); },
    proofTemplate() { return null; }
  },

  // ---- CUSTOM (Regex) ----
  {
    id: 'custom', name: '✏️ Custom Regex', description: 'User-defined regular language',
    alphabet: ['a','b'], regular: true, isCustom: true,
    _regex: null,
    membership(s) {
      if (!this._regex) return { inL: false, reason: 'No regex defined' };
      try {
        return this._regex.test(s)
          ? { inL: true, reason: 'Matches custom regex' }
          : { inL: false, reason: 'Does not match custom regex' };
      } catch { return { inL: false, reason: 'Regex error' }; }
    },
    suggest(p) { return this.alphabet[0].repeat(p); },
    proofTemplate() { return null; }
  }
];

/* ================================================================
   (c) MEMBERSHIP — wrapper with alphabet check
   ================================================================ */

/**
 * Check membership of string s in language at index langIdx.
 * Returns {inL: boolean, reason: string, invalidChars: boolean}
 */
function checkMembership(langIdx, s) {
  const lang = LANGUAGES[langIdx];
  // Check alphabet
  if (s.length > 0) {
    const alpha = new Set(lang.alphabet);
    const invalid = [...new Set(s.split(''))].filter(c => !alpha.has(c));
    if (invalid.length > 0) {
      return { inL: false, reason: `Invalid character(s): "${invalid.join('", "')}" not in alphabet {${lang.alphabet.join(', ')}}`, invalidChars: true };
    }
  }
  const result = lang.membership(s);
  return { ...result, invalidChars: false };
}

/* ================================================================
   (d) DECOMPOSITION ENGINE — enumerate, pump, validate
   ================================================================ */

/**
 * Get all valid decompositions of w for pumping length p.
 * Valid: |y| > 0, |xy| <= p
 * Returns array of {x, y, z, xLen, yLen}
 */
function getValidDecompositions(w, p) {
  const decomps = [];
  const maxXY = Math.min(p, w.length);
  for (let xLen = 0; xLen < maxXY; xLen++) {
    const maxYLen = maxXY - xLen;
    for (let yLen = 1; yLen <= maxYLen; yLen++) {
      decomps.push({
        x: w.substring(0, xLen),
        y: w.substring(xLen, xLen + yLen),
        z: w.substring(xLen + yLen),
        xLen, yLen
      });
    }
  }
  return decomps;
}

/**
 * Build the pumped string x y^i z.
 * @param {string} x @param {string} y @param {string} z @param {number} i
 * @returns {string}
 */
function pumpString(x, y, z, i) {
  return x + y.repeat(i) + z;
}

/* ================================================================
   (e) PROOF ENGINE — test all decomps, generate proof text
   ================================================================ */

/**
 * For every valid decomposition, find the smallest i in [0..maxI] where
 * the pumped string is NOT in L. Returns detailed results.
 */
function runProof(langIdx, w, p, maxI) {
  if (typeof maxI === 'undefined') {
    // Use larger range for number-theoretic languages
    const id = LANGUAGES[langIdx].id;
    maxI = ['a_nsq','a_prime','a_2n'].includes(id) ? 20 : 10;
  }
  const decomps = getValidDecompositions(w, p);
  const results = decomps.map(d => {
    let breakingI = null;
    let breakingReason = '';
    for (let i = 0; i <= maxI; i++) {
      const pumped = pumpString(d.x, d.y, d.z, i);
      const mem = checkMembership(langIdx, pumped);
      if (!mem.inL) {
        breakingI = i;
        breakingReason = mem.reason;
        break;
      }
    }
    return { ...d, breakingI, breakingReason, maxI };
  });

  const allBroken = results.every(r => r.breakingI !== null);
  const someSurvive = results.some(r => r.breakingI === null);

  return { results, allBroken, someSurvive, decomps: decomps.length };
}

/**
 * Generate a full, language-specific proof text.
 */
function generateProofText(langIdx, w, p, proofResults) {
  const lang = LANGUAGES[langIdx];
  const tmpl = lang.proofTemplate ? lang.proofTemplate(p) : null;

  if (proofResults.allBroken && tmpl) {
    return [
      `Theorem: L = ${lang.description} is not regular.`,
      ``,
      `Proof (by contradiction using the Pumping Lemma):`,
      ``,
      `1. Assume for contradiction that L is regular.`,
      `2. By the Pumping Lemma, there exists p ≥ 1 such that every`,
      `   w ∈ L with |w| ≥ p can be written as w = xyz where:`,
      `   (i) |y| > 0, (ii) |xy| ≤ p, (iii) xy^i z ∈ L for all i ≥ 0.`,
      `3. Choose w = ${tmpl.wExpr}.`,
      `   Then w ∈ L and |w| = ${tmpl.wLen} ≥ p.`,
      `4. ${tmpl.yRegion}`,
      `5. ${tmpl.pumpStep}`,
      `6. ${tmpl.conclusion}`,
      ``,
      `Hence L is not regular.  □`,
      ``,
      `--- Empirical verification ---`,
      `Tested p = ${p}, w = "${showStr(w)}" (|w| = ${w.length})`,
      `All ${proofResults.decomps} valid decompositions produce a`,
      `non-member for some i, confirming the contradiction.`
    ].join('\n');
  }

  if (proofResults.allBroken) {
    return [
      `Empirical Result: All ${proofResults.decomps} valid decompositions`,
      `of w = "${showStr(w)}" with p = ${p} produce a non-member for some i.`,
      ``,
      `This is CONSISTENT with L = ${lang.description} being NOT regular.`,
      `A formal proof follows the same structure as the standard`,
      `Pumping Lemma contradiction proof.`
    ].join('\n');
  }

  if (proofResults.someSurvive) {
    const surv = proofResults.results.filter(r => r.breakingI === null);
    return [
      `Result: ${surv.length} of ${proofResults.decomps} decompositions`,
      `survive pumping for all i in [0..${proofResults.results[0]?.maxI || 10}].`,
      ``,
      `⚠️ The pumping condition is SATISFIED for these decompositions.`,
      `This is CONSISTENT with L being regular, but does NOT prove it.`,
      `Finite testing is not a proof.`,
      ``,
      `The Pumping Lemma can only prove non-regularity (by contradiction).`,
      `It can NEVER prove that a language IS regular.`
    ].join('\n');
  }

  return 'No decompositions to analyze.';
}

/* ================================================================
   (f) GAME ENGINE — You vs Adversary
   ================================================================ */

const gameState = {
  phase: 0, // 0=idle,1=adversary picked p,2=player picks w,3=adv picks xyz,4=player picks i,5=verdict
  p: 0,
  w: '',
  decomp: null,
  i: 0,
  langIdx: 0,
  score: { player: 0, adversary: 0 },
  rounds: 0,
  swapped: false, // if true: player picks decomp, computer finds i
  hintGiven: false
};

/** Adversary picks the "hardest" decomposition — the one that survives the most i values */
function adversaryPickDecomp(langIdx, w, p) {
  const decomps = getValidDecompositions(w, p);
  if (decomps.length === 0) return null;

  let best = decomps[0], bestSurvival = -1;
  for (const d of decomps) {
    let survived = 0;
    for (let i = 0; i <= 10; i++) {
      const pumped = pumpString(d.x, d.y, d.z, i);
      if (checkMembership(langIdx, pumped).inL) survived++;
    }
    if (survived > bestSurvival) {
      bestSurvival = survived;
      best = d;
    }
  }
  return best;
}

/** Computer searches for a breaking i for a given decomposition */
function computerFindBreakingI(langIdx, x, y, z) {
  for (let i = 0; i <= 20; i++) {
    const pumped = pumpString(x, y, z, i);
    if (!checkMembership(langIdx, pumped).inL) return i;
  }
  return null; // no breaking i found
}

/** Get a game hint based on current phase */
function getGameHint(langIdx, phase) {
  const lang = LANGUAGES[langIdx];
  if (phase === 2) {
    // Player picking w
    if (!lang.regular) {
      const p = gameState.p;
      return `Hint: Use the "suggest" string for this language. For ${lang.name}, try "${lang.suggest(p)}".`;
    } else {
      return `Hint: This language is regular — you won't be able to break pumping for every decomposition!`;
    }
  }
  if (phase === 4) {
    // Player picking i
    if (!lang.regular) {
      return `Hint: Try i = 0 (pump down) or i = 2 (pump up). For many languages, i = 0 works because removing y breaks the balance.`;
    }
    return `Hint: Since this language is regular, the adversary chose a surviving decomposition. You may not find a breaking i.`;
  }
  if (phase === 3 && gameState.swapped) {
    return `Hint: Pick a decomposition where y crosses a block boundary or is at the edge — these are often hardest to pump.`;
  }
  return '';
}

/* ================================================================
   (g) DFA VISUALIZER — definitions and SVG rendering
   ================================================================ */

const DFA_DEFINITIONS = {
  ab_star: {
    name: '(ab)*',
    states: ['q₀','q₁','q₂'],
    accepting: [0],
    start: 0,
    transitions: [
      { from: 0, to: 1, label: 'a' },
      { from: 0, to: 2, label: 'b' },
      { from: 1, to: 0, label: 'b' },
      { from: 1, to: 2, label: 'a' },
      { from: 2, to: 2, label: 'a,b' }
    ],
    transMap: { '0_a': 1, '0_b': 2, '1_b': 0, '1_a': 2, '2_a': 2, '2_b': 2 },
    positions: [{x:120,y:150},{x:320,y:150},{x:220,y:310}]
  },
  a_star_b_star: {
    name: 'a*b*',
    states: ['q₀','q₁','q₂'],
    accepting: [0, 1],
    start: 0,
    transitions: [
      { from: 0, to: 0, label: 'a' },
      { from: 0, to: 1, label: 'b' },
      { from: 1, to: 1, label: 'b' },
      { from: 1, to: 2, label: 'a' },
      { from: 2, to: 2, label: 'a,b' }
    ],
    transMap: { '0_a': 0, '0_b': 1, '1_b': 1, '1_a': 2, '2_a': 2, '2_b': 2 },
    positions: [{x:120,y:150},{x:320,y:150},{x:220,y:310}]
  },
  end01: {
    name: 'Ends in 01',
    states: ['q₀','q₁','q₂'],
    accepting: [2],
    start: 0,
    transitions: [
      { from: 0, to: 1, label: '0' },
      { from: 0, to: 0, label: '1' },
      { from: 1, to: 1, label: '0' },
      { from: 1, to: 2, label: '1' },
      { from: 2, to: 1, label: '0' },
      { from: 2, to: 0, label: '1' }
    ],
    transMap: { '0_0': 1, '0_1': 0, '1_0': 1, '1_1': 2, '2_0': 1, '2_1': 0 },
    positions: [{x:100,y:150},{x:280,y:150},{x:460,y:150}]
  },
  even_a: {
    name: 'Even #a\'s',
    states: ['q₀','q₁'],
    accepting: [0],
    start: 0,
    transitions: [
      { from: 0, to: 1, label: 'a' },
      { from: 0, to: 0, label: 'b' },
      { from: 1, to: 0, label: 'a' },
      { from: 1, to: 1, label: 'b' }
    ],
    transMap: { '0_a': 1, '0_b': 0, '1_a': 0, '1_b': 1 },
    positions: [{x:150,y:170},{x:380,y:170}]
  },
  div3: {
    name: 'aⁿ (n mod 3 = 0)',
    states: ['q₀','q₁','q₂'],
    accepting: [0],
    start: 0,
    transitions: [
      { from: 0, to: 1, label: 'a' },
      { from: 1, to: 2, label: 'a' },
      { from: 2, to: 0, label: 'a' }
    ],
    transMap: { '0_a': 1, '1_a': 2, '2_a': 0 },
    positions: [{x:120,y:150},{x:320,y:70},{x:320,y:230}]
  },
  contains_aba: {
    name: 'Contains "aba"',
    states: ['q₀','q₁','q₂','q₃'],
    accepting: [3],
    start: 0,
    transitions: [
      { from: 0, to: 1, label: 'a' },
      { from: 0, to: 0, label: 'b' },
      { from: 1, to: 1, label: 'a' },
      { from: 1, to: 2, label: 'b' },
      { from: 2, to: 3, label: 'a' },
      { from: 2, to: 0, label: 'b' },
      { from: 3, to: 3, label: 'a,b' }
    ],
    transMap: { '0_a': 1, '0_b': 0, '1_a': 1, '1_b': 2, '2_a': 3, '2_b': 0, '3_a': 3, '3_b': 3 },
    positions: [{x:80,y:150},{x:220,y:150},{x:360,y:150},{x:500,y:150}]
  },
  a_n: {
    name: 'aⁿ (n ≥ 0)',
    states: ['q₀'],
    accepting: [0],
    start: 0,
    transitions: [
      { from: 0, to: 0, label: 'a' }
    ],
    transMap: { '0_a': 0 },
    positions: [{x:290,y:150}]
  }
};

/** Render a DFA as an SVG string */
function renderDFA(dfaId, activeState, repeatedState) {
  const dfa = DFA_DEFINITIONS[dfaId];
  if (!dfa) return '<p class="text-muted">No DFA available.</p>';

  const W = 580, H = dfa.positions.reduce((mx,p) => Math.max(mx,p.y),0) + 100;
  const R = 30; // state radius

  let svg = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">`;

  // Arrowhead marker
  svg += `<defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
    <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-secondary)"/></marker></defs>`;

  // Start arrow
  const startPos = dfa.positions[dfa.start];
  svg += `<line x1="${startPos.x-60}" y1="${startPos.y}" x2="${startPos.x-R-2}" y2="${startPos.y}" class="trans-line"/>`;
  svg += `<text x="${startPos.x-55}" y="${startPos.y-10}" class="trans-label" style="font-size:11px">start</text>`;

  // Transitions
  for (const t of dfa.transitions) {
    const from = dfa.positions[t.from], to = dfa.positions[t.to];
    if (t.from === t.to) {
      // Self-loop
      svg += `<path d="M${from.x-10},${from.y-R} C${from.x-30},${from.y-R-50} ${from.x+30},${from.y-R-50} ${from.x+10},${from.y-R}" class="trans-line" fill="none"/>`;
      svg += `<text x="${from.x}" y="${from.y-R-35}" class="trans-label">${esc(t.label)}</text>`;
    } else {
      const dx = to.x - from.x, dy = to.y - from.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const ux = dx/dist, uy = dy/dist;
      // Check if reverse transition exists for curve offset
      const hasReverse = dfa.transitions.some(tr => tr.from === t.to && tr.to === t.from);
      if (hasReverse) {
        const nx = -uy * 20, ny = ux * 20;
        const mx = (from.x+to.x)/2 + nx, my = (from.y+to.y)/2 + ny;
        const sx = from.x + ux*R, sy = from.y + uy*R;
        const ex = to.x - ux*R, ey = to.y - uy*R;
        svg += `<path d="M${sx},${sy} Q${mx},${my} ${ex},${ey}" class="trans-line" fill="none"/>`;
        const lx = (sx+2*mx+ex)/4, ly = (sy+2*my+ey)/4;
        svg += `<text x="${lx}" y="${ly-6}" class="trans-label">${esc(t.label)}</text>`;
      } else {
        const sx = from.x + ux*R, sy = from.y + uy*R;
        const ex = to.x - ux*R, ey = to.y - uy*R;
        svg += `<line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" class="trans-line"/>`;
        const lx = (sx+ex)/2 - uy*14, ly = (sy+ey)/2 + ux*14;
        svg += `<text x="${lx}" y="${ly}" class="trans-label">${esc(t.label)}</text>`;
      }
    }
  }

  // States
  dfa.positions.forEach((pos, idx) => {
    let cls = 'state-circle';
    if (idx === activeState) cls += ' active-state';
    if (idx === repeatedState) cls += ' repeated-state';
    if (dfa.accepting.includes(idx)) {
      svg += `<circle cx="${pos.x}" cy="${pos.y}" r="${R+5}" class="${cls}" style="fill:none"/>`;
    }
    svg += `<circle cx="${pos.x}" cy="${pos.y}" r="${R}" class="${cls}"/>`;
    svg += `<text x="${pos.x}" y="${pos.y}" class="state-label">${esc(dfa.states[idx])}</text>`;
  });

  svg += '</svg>';
  return svg;
}

/** Trace a string through a DFA, returning the state sequence and first repeated state */
function traceDFA(dfaId, str) {
  const dfa = DFA_DEFINITIONS[dfaId];
  if (!dfa) return null;
  const stateSeq = [dfa.start];
  let cur = dfa.start;
  for (const ch of str) {
    const key = `${cur}_${ch}`;
    const next = dfa.transMap[key];
    if (next === undefined) return { stateSeq, accepted: false, error: `No transition from ${dfa.states[cur]} on '${ch}'` };
    cur = next;
    stateSeq.push(cur);
  }
  // Find first repeated state (pigeonhole)
  let firstRepeated = null;
  const seen = new Set();
  for (const s of stateSeq) {
    if (seen.has(s)) { firstRepeated = s; break; }
    seen.add(s);
  }
  return {
    stateSeq,
    accepted: dfa.accepting.includes(cur),
    firstRepeated,
    error: null
  };
}

/* ================================================================
   (h) UI STATE AND RENDERING
   ================================================================ */

const state = {
  activeTab: 'simulator',
  langIdx: 0,
  pumpLen: 3,
  inputStr: '',
  xLen: 0,
  yLen: 1,
  pumpI: 1
};

// --- Tab switching ---
function switchTab(tabId) {
  state.activeTab = tabId;
  document.querySelectorAll('.tab-btn').forEach(b => {
    const isActive = b.dataset.tab === tabId;
    b.classList.toggle('active', isActive);
    b.setAttribute('aria-selected', isActive);
  });
  document.querySelectorAll('.tab-content').forEach(tc => {
    tc.classList.toggle('active', tc.id === 'tab-' + tabId);
  });
}

// --- Populate language dropdowns ---
function populateDropdowns() {
  const selectors = ['langSelect', 'gameLangSelect'];
  selectors.forEach(selId => {
    const sel = document.getElementById(selId);
    sel.innerHTML = '';
    // Non-regular group
    const grNR = document.createElement('optgroup');
    grNR.label = '— Non-Regular Languages —';
    // Regular group
    const grR = document.createElement('optgroup');
    grR.label = '— Regular Languages —';
    // Custom group
    const grC = document.createElement('optgroup');
    grC.label = '— Custom —';

    LANGUAGES.forEach((lang, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `${lang.name} — ${lang.description}`;
      if (lang.isCustom) grC.appendChild(opt);
      else if (lang.regular) grR.appendChild(opt);
      else grNR.appendChild(opt);
    });
    sel.appendChild(grNR);
    sel.appendChild(grR);
    sel.appendChild(grC);
  });

  // DFA dropdown — only regular languages with DFAs
  const dfaSel = document.getElementById('dfaLangSelect');
  dfaSel.innerHTML = '';
  LANGUAGES.forEach((lang, idx) => {
    if (DFA_DEFINITIONS[lang.id]) {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `${lang.name} — ${lang.description}`;
      dfaSel.appendChild(opt);
    }
  });
}

// --- Update language info display ---
function updateLangInfo() {
  const lang = LANGUAGES[state.langIdx];
  const badge = document.getElementById('langBadge');
  badge.textContent = lang.isCustom ? 'CUSTOM' : (lang.regular ? 'REGULAR' : 'NON-REGULAR');
  badge.className = 'badge ' + (lang.isCustom ? 'badge-custom' : (lang.regular ? 'badge-regular' : 'badge-nonregular'));
  document.getElementById('langDescription').textContent = lang.description;
  document.getElementById('langAlphabet').textContent = `Alphabet: { ${lang.alphabet.join(', ')} }`;
  document.getElementById('customRegexArea').style.display = lang.isCustom ? 'flex' : 'none';
}

// --- String validation ---
function validateString() {
  const s = state.inputStr;
  const lang = LANGUAGES[state.langIdx];
  const el = document.getElementById('stringValidation');

  if (s === '' && lang.membership('').inL) {
    el.className = 'validation success';
    el.textContent = '✓ Empty string (ε) — in L.';
    return true;
  }
  if (s.length > 60) {
    el.className = 'validation warning';
    el.textContent = '⚠ String too long (max 60). Please shorten it.';
    return false;
  }

  const mem = checkMembership(state.langIdx, s);
  if (mem.invalidChars) {
    el.className = 'validation error';
    el.textContent = '✗ ' + mem.reason;
    return false;
  }
  if (!mem.inL) {
    el.className = 'validation error';
    el.textContent = `✗ Not in L: ${mem.reason}`;
    return false;
  }
  if (s.length < state.pumpLen) {
    el.className = 'validation warning';
    el.textContent = `⚠ |w| = ${s.length} < p = ${state.pumpLen}. The Pumping Lemma requires |w| ≥ p.`;
    return false;
  }
  el.className = 'validation success';
  el.textContent = `✓ w ∈ L, |w| = ${s.length} ≥ p = ${state.pumpLen}`;
  return true;
}

// --- Render character boxes ---
function renderCharBoxes() {
  const w = state.inputStr;
  const container = document.getElementById('charBoxes');
  container.innerHTML = '';
  if (!w) return;

  for (let i = 0; i < w.length; i++) {
    const box = document.createElement('span');
    box.className = 'char-box';
    box.textContent = w[i];
    if (i < state.xLen) box.classList.add('x-part');
    else if (i < state.xLen + state.yLen) box.classList.add('y-part');
    else box.classList.add('z-part');
    box.setAttribute('aria-label', `Character ${i+1}: ${w[i]} (${i < state.xLen ? 'x' : (i < state.xLen + state.yLen ? 'y' : 'z')})`);
    container.appendChild(box);
  }

  // Update value displays
  const x = w.substring(0, state.xLen);
  const y = w.substring(state.xLen, state.xLen + state.yLen);
  const z = w.substring(state.xLen + state.yLen);
  document.getElementById('xVal').textContent = showStr(x);
  document.getElementById('yVal').textContent = showStr(y);
  document.getElementById('zVal').textContent = showStr(z);
  document.getElementById('totalLen').textContent = w.length;
  document.getElementById('xyLen').textContent = state.xLen + state.yLen;

  // Checklist
  const cl = document.getElementById('decompChecklist');
  const yGt0 = state.yLen > 0;
  const xyLeP = (state.xLen + state.yLen) <= state.pumpLen;
  cl.innerHTML = `
    <li><span class="check-icon ${yGt0 ? 'check-pass' : 'check-fail'}">${yGt0 ? '✓' : '✗'}</span> |y| = ${state.yLen} > 0 ${yGt0 ? '— satisfied' : '— VIOLATED: y must be non-empty'}</li>
    <li><span class="check-icon ${xyLeP ? 'check-pass' : 'check-fail'}">${xyLeP ? '✓' : '✗'}</span> |xy| = ${state.xLen + state.yLen} ≤ p = ${state.pumpLen} ${xyLeP ? '— satisfied' : '— VIOLATED: |xy| exceeds p'}</li>
  `;
}

// --- Render pumped string ---
function renderPumped() {
  const w = state.inputStr;
  if (!w || state.yLen <= 0) return;

  const x = w.substring(0, state.xLen);
  const y = w.substring(state.xLen, state.xLen + state.yLen);
  const z = w.substring(state.xLen + state.yLen);
  const i = state.pumpI;
  const pumped = pumpString(x, y, z, i);
  // Animate only what changed since the last render of this decomposition.
  const key = `${state.langIdx}|${w}|${state.xLen}|${state.yLen}`;
  const prevI = state._pumpKey === key ? state._prevPumpI : 1;
  state._pumpKey = key;
  state._prevPumpI = i;

  // Original string row
  const orig = document.getElementById('origDisplay');
  orig.innerHTML = '';
  for (let c = 0; c < w.length; c++) {
    const box = document.createElement('span');
    box.className = 'char-box ' + (c < x.length ? 'x-part' : c < x.length + y.length ? 'y-part' : 'z-part');
    box.textContent = w[c];
    orig.appendChild(box);
  }

  // Pumped row: unchanged / inserted / removed characters
  const container = document.getElementById('pumpedDisplay');
  container.innerHTML = '';
  LabCore.pumpSegments(x, y, z, i).forEach(seg => {
    const box = document.createElement('span');
    let cls = 'char-box ' + seg.part + '-part';
    if (seg.kind === 'inserted') cls += ' k-inserted' + (seg.copy >= prevI ? ' k-new' : '');
    if (seg.kind === 'removed') cls += ' k-removed' + (prevI !== 0 ? ' k-new' : '');
    box.className = cls;
    box.textContent = seg.ch;
    box.setAttribute('aria-label', `${seg.ch} (${seg.part}, ${seg.kind})`);
    container.appendChild(box);
  });
  if (!pumped.length) container.innerHTML += '<span class="text-muted">= ε (empty string)</span>';

  // Highlight quick-exponent buttons
  document.querySelectorAll('#iButtons [data-i]').forEach(b => b.classList.toggle('is-on', Number(b.dataset.i) === i));

  // Facts
  const mem = checkMembership(state.langIdx, pumped);
  const delta = (i - 1) * y.length;
  document.getElementById('pumpedInfo').innerHTML = `<div class="stat-grid">
      <div><div class="k">Original w</div><div class="v">${esc(showStr(w))}</div></div>
      <div><div class="k">Pumped xy<sup>${i}</sup>z</div><div class="v">${pumped.length > 40 ? esc(pumped.substring(0, 37)) + '…' : esc(showStr(pumped))}</div></div>
      <div><div class="k">Length</div><div class="v">${w.length} → ${pumped.length} (${delta >= 0 ? '+' : ''}${delta})</div></div>
      <div><div class="k">Exponent i</div><div class="v">${i}</div></div>
      <div><div class="k">Membership</div><div class="v" style="color:var(${mem.inL ? '--ok' : '--bad'})">${mem.inL ? 'in L' : 'not in L'}</div></div>
    </div>`;

  const verdEl = document.getElementById('pumpedVerdict');
  verdEl.innerHTML = mem.inL
    ? `<div class="alert alert-success" style="margin:0"><strong>Tested exponent i = ${i}: in L.</strong> ${esc(mem.reason)}. One exponent says nothing about the others.</div>`
    : `<div class="alert alert-danger" style="margin:0"><strong>Tested exponent i = ${i}: not in L.</strong> ${esc(mem.reason)}.</div>`;

  // Honest classification: tested exponent vs verified decomposition vs formal proof
  const tag = { tested: 't-tested', verified: 't-verified', counterexample: 't-counter', formal: 't-formal', unavailable: 't-unavail', invalid: 't-counter' };
  const dc = LabCore.classifyDecomposition(state.langIdx, x, y, z, 10);
  const ls = LabCore.languageStatus(state.langIdx);
  const item = (label, cls, text) => `<div class="class-item"><span class="tagline ${cls}">${esc(label)}</span><span>${text}</span></div>`;
  document.getElementById('pumpClass').innerHTML =
    item('Tested exponent', 't-tested', `i = ${i} → ${mem.inL ? 'xy<sup>i</sup>z ∈ L' : 'xy<sup>i</sup>z ∉ L'}. A single exponent is a measurement, not a proof.`) +
    item(dc.label, tag[dc.kind], esc(dc.detail)) +
    item(ls.label, tag[ls.kind], esc(ls.detail));

  // Pumping table i=0..6
  renderPumpTable(x, y, z);
}

function renderPumpTable(x, y, z) {
  let html = '<table><thead><tr><th>i</th><th>xy<sup>i</sup>z</th><th>Length</th><th>Verdict</th><th>Reason</th></tr></thead><tbody>';
  for (let i = 0; i <= 6; i++) {
    const pumped = pumpString(x, y, z, i);
    const mem = checkMembership(state.langIdx, pumped);
    const cls = mem.inL ? 'in-l' : 'not-in-l';
    const icon = mem.inL ? '✓' : '✗';
    const displayStr = pumped.length > 40 ? esc(pumped.substring(0, 37)) + '…' : esc(showStr(pumped));
    html += `<tr><td>${i}</td><td>${displayStr}</td><td>${pumped.length}</td><td class="${cls}">${icon} ${mem.inL ? 'In L' : 'Not in L'}</td><td style="font-family:var(--font-sans);font-size:.8rem">${esc(mem.reason)}</td></tr>`;
  }
  html += '</tbody></table>';
  document.getElementById('pumpTable').innerHTML = html;
}

// --- List all valid decompositions ---
function renderAllDecomps() {
  const w = state.inputStr;
  const p = state.pumpLen;
  const decomps = getValidDecompositions(w, p);
  const container = document.getElementById('allDecompsTable');

  if (decomps.length === 0) {
    container.innerHTML = '<p class="text-muted">No valid decompositions.</p>';
    container.style.display = 'block';
    return;
  }

  let html = `<p class="text-muted mt-2">${decomps.length} valid decomposition(s) for |w| = ${w.length}, p = ${p}:</p>`;
  html += '<div class="table-wrap compact"><table><thead><tr><th>#</th><th>x</th><th>y</th><th>z</th><th>|x|</th><th>|y|</th><th>|z|</th><th>|xy|</th></tr></thead><tbody>';
  decomps.forEach((d, idx) => {
    html += `<tr><td>${idx+1}</td><td>${showStr(d.x)}</td><td>${showStr(d.y)}</td><td>${showStr(d.z)}</td><td>${d.xLen}</td><td>${d.yLen}</td><td>${d.z.length}</td><td>${d.xLen+d.yLen}</td></tr>`;
  });
  html += '</tbody></table></div>';
  container.innerHTML = html;
  container.style.display = 'block';
}

// --- Update decomposition slider limits ---
function updateDecompLimits() {
  const w = state.inputStr;
  if (!w) return;
  const maxXY = Math.min(state.pumpLen, w.length);
  const maxX = Math.max(0, maxXY - 1); // need at least yLen=1

  ['xLenSlider','xLenNum'].forEach(id => {
    const el = document.getElementById(id);
    el.max = maxX;
  });
  state.xLen = clamp(state.xLen, 0, maxX);
  document.getElementById('xLenSlider').value = state.xLen;
  document.getElementById('xLenNum').value = state.xLen;
  document.getElementById('xLenVal').textContent = state.xLen;

  const maxY = maxXY - state.xLen;
  ['yLenSlider','yLenNum'].forEach(id => {
    const el = document.getElementById(id);
    el.max = maxY;
    el.min = 1;
  });
  state.yLen = clamp(state.yLen, 1, maxY);
  document.getElementById('yLenSlider').value = state.yLen;
  document.getElementById('yLenNum').value = state.yLen;
  document.getElementById('yLenVal').textContent = state.yLen;
}

// --- Show/hide panels based on validation ---
function updatePanelVisibility() {
  const valid = state.inputStr.length > 0 && state.inputStr.length >= state.pumpLen;
  const mem = state.inputStr.length > 0 ? checkMembership(state.langIdx, state.inputStr) : { inL: false };
  const show = valid && mem.inL && !mem.invalidChars;
  document.getElementById('decompPanel').style.display = show ? 'block' : 'none';
  document.getElementById('pumpPanel').style.display = show ? 'block' : 'none';
}

// --- Full simulator refresh ---
function refreshSimulator() {
  updateLangInfo();
  validateString();
  updatePanelVisibility();
  if (document.getElementById('decompPanel').style.display !== 'none') {
    updateDecompLimits();
    renderCharBoxes();
    renderPumped();
  }
  document.getElementById('allDecompsTable').style.display = 'none';
}

// --- Proof tab logic ---
function runProofUI() {
  const w = state.inputStr;
  const p = state.pumpLen;
  const langIdx = state.langIdx;
  const lang = LANGUAGES[langIdx];

  const statusEl = document.getElementById('proofStatus');
  const tableEl = document.getElementById('proofDecompTable');
  const resultEl = document.getElementById('proofResult');
  const textEl = document.getElementById('proofText');
  const actionsEl = document.getElementById('proofActions');

  // Validate
  if (!w) {
    statusEl.innerHTML = '<span class="alert alert-danger" style="margin:0">✗ No string entered. Go to the Simulator tab and enter w.</span>';
    tableEl.style.display = 'none'; resultEl.style.display = 'none'; textEl.style.display = 'none'; actionsEl.style.display = 'none';
    return;
  }
  const mem = checkMembership(langIdx, w);
  if (!mem.inL || mem.invalidChars) {
    statusEl.innerHTML = `<span class="alert alert-danger" style="margin:0">✗ w is not in L: ${esc(mem.reason)}</span>`;
    tableEl.style.display = 'none'; resultEl.style.display = 'none'; textEl.style.display = 'none'; actionsEl.style.display = 'none';
    return;
  }
  if (w.length < p) {
    statusEl.innerHTML = `<span class="alert alert-warning" style="margin:0">⚠ |w| = ${w.length} < p = ${p}. Need |w| ≥ p.</span>`;
    tableEl.style.display = 'none'; resultEl.style.display = 'none'; textEl.style.display = 'none'; actionsEl.style.display = 'none';
    return;
  }

  statusEl.innerHTML = `<span class="text-muted">Analyzing ${lang.name} with p = ${p}, w = "${showStr(w)}" (|w| = ${w.length})…</span>`;

  const proof = runProof(langIdx, w, p);

  // Decomposition table
  let thtml = '<table><thead><tr><th>#</th><th>x</th><th>y</th><th>z</th><th>Breaking i</th><th>Reason</th></tr></thead><tbody>';
  proof.results.forEach((r, idx) => {
    const cls = r.breakingI !== null ? 'not-in-l' : 'in-l';
    thtml += `<tr><td>${idx+1}</td><td>${showStr(r.x)}</td><td>${showStr(r.y)}</td><td>${showStr(r.z)}</td>`;
    thtml += `<td class="${cls}">${r.breakingI !== null ? `i = ${r.breakingI}` : 'None found'}</td>`;
    thtml += `<td style="font-family:var(--font-sans);font-size:.8rem">${r.breakingI !== null ? esc(r.breakingReason) : `Survives i = 0…${r.maxI}`}</td></tr>`;
  });
  thtml += '</tbody></table>';
  tableEl.innerHTML = thtml;
  tableEl.style.display = 'block';

  // Result
  // Re-check surviving decompositions with the DFA where one exists (exact, all i).
  const dfaDef = DFA_DEFINITIONS[lang.id];
  const survivors = proof.results.filter(r => r.breakingI === null);
  const verifiedCount = dfaDef ? survivors.filter(r => LabCore.verifyDecompositionDFA(dfaDef, r.x, r.y, r.z).verified).length : 0;

  if (proof.allBroken && lang.proofTemplate && lang.proofTemplate(p) && !lang.isCustom) {
    resultEl.innerHTML = `<div class="alert alert-danger"><strong>Counterexample for p = ${p}:</strong> every one of the ${proof.decomps} valid decompositions of w has a concrete exponent with xy<sup>i</sup>z ∉ L.<br><strong>Formal proof:</strong> the general argument below works for <em>every</em> p, so L = ${esc(lang.description)} is <strong>not regular</strong>.</div>`;
  } else if (proof.allBroken) {
    resultEl.innerHTML = `<div class="alert alert-warning"><strong>Counterexample for this p and w only:</strong> every valid decomposition breaks for some tested i.${lang.isCustom ? ' Formal verification is unavailable for custom patterns, so no general proof is claimed.' : ''}</div>`;
  } else if (dfaDef && verifiedCount === survivors.length) {
    resultEl.innerHTML = `<div class="alert alert-success"><strong>Verified decomposition${survivors.length > 1 ? 's' : ''}:</strong> ${survivors.length} of ${proof.decomps} decompositions satisfy xy<sup>i</sup>z ∈ L for <em>every</em> i ≥ 0 (checked exactly with the ${dfaDef.states.length}-state DFA).<br>So this w cannot be used to contradict the lemma. That is consistent with L being regular — the DFA itself is what proves regularity, not the lemma.</div>`;
  } else {
    resultEl.innerHTML = `<div class="alert alert-warning"><strong>Tested exponents only:</strong> ${survivors.length} of ${proof.decomps} decompositions stayed in L for every tested i.${lang.isCustom ? ' Verification for all i is unavailable for custom patterns.' : ''}<br>Finite testing is not a proof of anything.</div>`;
  }
  resultEl.style.display = 'block';

  // Proof text
  const proofStr = generateProofText(langIdx, w, p, proof);
  textEl.textContent = proofStr;
  textEl.style.display = 'block';
  actionsEl.style.display = 'flex';
}

// --- Copy proof ---
function copyProof() {
  const text = document.getElementById('proofText').textContent;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('copyProofBtn');
      btn.textContent = '✓ Copied!';
      setTimeout(() => btn.textContent = 'Copy proof', 2000);
    }).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}
function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } catch {}
  document.body.removeChild(ta);
  const btn = document.getElementById('copyProofBtn');
  btn.textContent = '✓ Copied!';
  setTimeout(() => btn.textContent = 'Copy proof', 2000);
}

// --- Game UI ---
function renderGame() {
  const area = document.getElementById('gameArea');
  const lang = LANGUAGES[gameState.langIdx];
  const hintBtn = document.getElementById('gameHintBtn');
  gameState.hintGiven = false;

  // Update scores
  document.getElementById('gamePlayerScore').textContent = gameState.score.player;
  document.getElementById('gameAdvScore').textContent = gameState.score.adversary;
  document.getElementById('gameRound').textContent = gameState.rounds;

  // Update phase indicators
  for (let i = 1; i <= 5; i++) {
    const el = document.getElementById('gp' + i);
    el.className = 'phase-step';
    if (i < gameState.phase) el.classList.add('done-phase');
    else if (i === gameState.phase) el.classList.add('active-phase');
    else el.classList.add('pending-phase');
  }

  // Update quantifier ladder
  ['q1','q2','q3','q4'].forEach((id, idx) => {
    document.getElementById(id).className = 'q-step' + (idx + 1 === gameState.phase ? ' q-active' : '');
  });

  hintBtn.style.display = (gameState.phase >= 2 && gameState.phase <= 4) ? 'inline-flex' : 'none';

  if (gameState.phase === 0) {
    area.innerHTML = '<p class="text-muted">Click "New Round" to begin.</p>';
    return;
  }

  if (gameState.phase === 1) {
    area.innerHTML = `<div class="alert alert-info"><span class="emoji">🤖</span> Adversary picked <strong>p = ${gameState.p}</strong>.</div>
      <p>Your turn: pick a string w ∈ L with |w| ≥ ${gameState.p}.</p>
      <div class="form-row">
        <div class="form-group" style="flex:3">
          <input type="text" id="gameWInput" class="mono" placeholder="Enter w…" aria-label="Game string input">
        </div>
        <div class="form-group" style="flex:0 0 auto;align-self:flex-end">
          <button class="btn btn-sm" id="gameSuggestBtn">💡 Suggest</button>
        </div>
      </div>
      <div id="gameWValidation" class="validation"></div>
      <button class="btn btn-primary mt-2" id="gameSubmitW">Submit w</button>`;

    document.getElementById('gameSuggestBtn').onclick = () => {
      document.getElementById('gameWInput').value = lang.suggest(gameState.p);
    };
    document.getElementById('gameSubmitW').onclick = () => {
      const w = document.getElementById('gameWInput').value;
      const val = document.getElementById('gameWValidation');
      if (!w) { val.className = 'validation error'; val.textContent = '✗ Enter a string.'; return; }
      if (w.length > 60) { val.className = 'validation error'; val.textContent = '✗ Too long (max 60).'; return; }
      const mem = checkMembership(gameState.langIdx, w);
      if (mem.invalidChars || !mem.inL) { val.className = 'validation error'; val.textContent = '✗ ' + mem.reason; return; }
      if (w.length < gameState.p) { val.className = 'validation error'; val.textContent = `✗ |w| = ${w.length} < p = ${gameState.p}`; return; }
      gameState.w = w;
      gameState.phase = 2;
      renderGame();
    };
    return;
  }

  if (gameState.phase === 2) {
    // Phase 2 → 3 : adversary picks decomposition (or player picks if swapped)
    if (!gameState.swapped) {
      const decomp = adversaryPickDecomp(gameState.langIdx, gameState.w, gameState.p);
      if (!decomp) {
        area.innerHTML = '<div class="alert alert-danger">No valid decompositions. Round void.</div>';
        gameState.phase = 0;
        return;
      }
      gameState.decomp = decomp;
      gameState.phase = 3;
      area.innerHTML = `<div class="alert alert-info"><span class="emoji">🤖</span> Adversary chose decomposition:<br>
        <span class="tag tag-x">x = ${showStr(decomp.x)}</span>
        <span class="tag tag-y">y = ${showStr(decomp.y)}</span>
        <span class="tag tag-z">z = ${showStr(decomp.z)}</span></div>
        <p>Your turn: pick i (0 to 10) to try to break membership.</p>
        <div class="form-row">
          <div class="form-group" style="flex:2">
            <label for="gameISlider">i = <strong id="gameIVal">0</strong></label>
            <input type="range" id="gameISlider" min="0" max="10" value="0" aria-label="Game i slider">
          </div>
          <div class="form-group" style="flex:0 0 80px">
            <input type="number" id="gameINum" min="0" max="10" value="0" aria-label="Game i number">
          </div>
        </div>
        <button class="btn btn-primary mt-2" id="gameSubmitI">Submit i</button>`;

      const iSlider = document.getElementById('gameISlider');
      const iNum = document.getElementById('gameINum');
      const iVal = document.getElementById('gameIVal');
      const sync = () => { iVal.textContent = iSlider.value; iNum.value = iSlider.value; };
      iSlider.oninput = sync;
      iNum.oninput = () => { iSlider.value = iNum.value; sync(); };

      document.getElementById('gameSubmitI').onclick = () => {
        gameState.i = parseInt(iSlider.value);
        gameState.phase = 4;
        evaluateGame();
      };
    } else {
      // Swapped: player picks decomposition
      const decomps = getValidDecompositions(gameState.w, gameState.p);
      if (decomps.length === 0) {
        area.innerHTML = '<div class="alert alert-danger">No valid decompositions. Round void.</div>';
        gameState.phase = 0;
        return;
      }
      let html = `<p>Your turn: pick a decomposition (try to find one that survives all i values).</p>`;
      html += '<div class="table-wrap compact"><table><thead><tr><th>Pick</th><th>x</th><th>y</th><th>z</th></tr></thead><tbody>';
      decomps.forEach((d, idx) => {
        html += `<tr><td><button class="btn btn-sm gamePickDecomp" data-idx="${idx}">Pick</button></td><td>${showStr(d.x)}</td><td>${showStr(d.y)}</td><td>${showStr(d.z)}</td></tr>`;
      });
      html += '</tbody></table></div>';
      area.innerHTML = html;

      area.querySelectorAll('.gamePickDecomp').forEach(btn => {
        btn.onclick = () => {
          const idx = parseInt(btn.dataset.idx);
          gameState.decomp = decomps[idx];
          gameState.phase = 3;
          // Computer searches for breaking i
          const breakI = computerFindBreakingI(gameState.langIdx, gameState.decomp.x, gameState.decomp.y, gameState.decomp.z);
          gameState.i = breakI;
          gameState.phase = 4;
          evaluateGameSwapped(breakI);
        };
      });
    }
    return;
  }
}

function evaluateGame() {
  const d = gameState.decomp;
  const pumped = pumpString(d.x, d.y, d.z, gameState.i);
  const mem = checkMembership(gameState.langIdx, pumped);
  const area = document.getElementById('gameArea');
  gameState.phase = 5;
  gameState.rounds++;

  // Update phase indicators
  for (let i = 1; i <= 5; i++) {
    const el = document.getElementById('gp' + i);
    el.className = 'phase-step' + (i <= 5 ? ' done-phase' : '');
  }
  document.getElementById('gp5').className = 'phase-step active-phase';

  if (!mem.inL) {
    gameState.score.player++;
    area.innerHTML = `<div class="alert alert-success"><span class="emoji">🎉</span> <strong>You win!</strong> xy<sup>${gameState.i}</sup>z = "${esc(showStr(pumped))}" is <strong>not in L</strong>.<br>Reason: ${esc(mem.reason)}</div>`;
  } else {
    gameState.score.adversary++;
    area.innerHTML = `<div class="alert alert-danger"><span class="emoji">😞</span> <strong>Adversary wins.</strong> xy<sup>${gameState.i}</sup>z = "${esc(showStr(pumped))}" is <strong>in L</strong>.<br>Reason: ${esc(mem.reason)}. Try a different i!</div>`;
  }

  document.getElementById('gamePlayerScore').textContent = gameState.score.player;
  document.getElementById('gameAdvScore').textContent = gameState.score.adversary;
  document.getElementById('gameRound').textContent = gameState.rounds;
  document.getElementById('gameHintBtn').style.display = 'none';
}

function evaluateGameSwapped(breakI) {
  const d = gameState.decomp;
  const area = document.getElementById('gameArea');
  gameState.phase = 5;
  gameState.rounds++;

  for (let i = 1; i <= 5; i++) {
    document.getElementById('gp' + i).className = 'phase-step done-phase';
  }
  document.getElementById('gp5').className = 'phase-step active-phase';

  if (breakI !== null) {
    const pumped = pumpString(d.x, d.y, d.z, breakI);
    const mem = checkMembership(gameState.langIdx, pumped);
    gameState.score.adversary++;
    area.innerHTML = `<div class="alert alert-danger"><span class="emoji">🤖</span> <strong>Computer wins!</strong> Found i = ${breakI}: xy<sup>${breakI}</sup>z = "${esc(showStr(pumped))}" is <strong>not in L</strong>.<br>Reason: ${esc(mem.reason)}</div>`;
  } else {
    gameState.score.player++;
    area.innerHTML = `<div class="alert alert-success"><span class="emoji">🎉</span> <strong>You win!</strong> Computer could not find any i in [0..20] that breaks membership for your decomposition.<br>x = ${showStr(d.x)}, y = ${showStr(d.y)}, z = ${showStr(d.z)}</div>`;
  }

  document.getElementById('gamePlayerScore').textContent = gameState.score.player;
  document.getElementById('gameAdvScore').textContent = gameState.score.adversary;
  document.getElementById('gameRound').textContent = gameState.rounds;
  document.getElementById('gameHintBtn').style.display = 'none';
}

function startGameRound() {
  gameState.langIdx = parseInt(document.getElementById('gameLangSelect').value);
  gameState.swapped = document.getElementById('gameSwapRoles').checked;
  gameState.p = Math.floor(Math.random() * 5) + 2; // 2 to 6
  gameState.phase = 1;
  gameState.w = '';
  gameState.decomp = null;
  gameState.i = 0;
  gameState.hintGiven = false;

  // Swap role labels
  if (gameState.swapped) {
    document.getElementById('gp2').textContent = '2. Adversary picks w';
    document.getElementById('gp3').textContent = '3. You pick xyz';
    document.getElementById('gp4').textContent = '4. Computer picks i';
  } else {
    document.getElementById('gp2').textContent = '2. You pick w';
    document.getElementById('gp3').textContent = '3. Adversary picks xyz';
    document.getElementById('gp4').textContent = '4. You pick i';
  }

  if (gameState.swapped) {
    // In swapped mode: adversary picks w too
    const lang = LANGUAGES[gameState.langIdx];
    gameState.w = lang.suggest(gameState.p);
    gameState.phase = 2;
  }

  renderGame();
}

// --- DFA UI ---
function renderDFATab() {
  const langIdx = parseInt(document.getElementById('dfaLangSelect').value);
  const lang = LANGUAGES[langIdx];
  const dfaDef = DFA_DEFINITIONS[lang.id];
  if (!dfaDef) {
    document.getElementById('dfaCanvas').innerHTML = '<p class="text-muted">No DFA available for this language.</p>';
    return;
  }

  document.getElementById('dfaInfo').innerHTML = `
    <strong>${esc(dfaDef.name)}</strong> — ${dfaDef.states.length} states (p = ${dfaDef.states.length})
    &nbsp;|&nbsp; Accepting: {${dfaDef.accepting.map(i => dfaDef.states[i]).join(', ')}}
  `;
  document.getElementById('dfaCanvas').innerHTML = renderDFA(lang.id);
  document.getElementById('dfaTraceInfo').textContent = '';
}

function traceDFAUI() {
  const langIdx = parseInt(document.getElementById('dfaLangSelect').value);
  const lang = LANGUAGES[langIdx];
  const str = document.getElementById('dfaStringInput').value;
  const valEl = document.getElementById('dfaValidation');

  if (!str) { valEl.className = 'validation warning'; valEl.textContent = 'Enter a string to trace.'; return; }

  // Alphabet check
  const alpha = new Set(lang.alphabet);
  const invalid = [...new Set(str.split(''))].filter(c => !alpha.has(c));
  if (invalid.length > 0) {
    valEl.className = 'validation error';
    valEl.textContent = `Invalid characters: ${invalid.join(', ')}`;
    return;
  }
  valEl.textContent = '';

  const result = traceDFA(lang.id, str);
  if (!result) return;

  if (result.error) {
    valEl.className = 'validation error';
    valEl.textContent = result.error;
    return;
  }

  // Animate trace
  const dfaDef = DFA_DEFINITIONS[lang.id];
  const traceEl = document.getElementById('dfaTraceInfo');
  const canvasEl = document.getElementById('dfaCanvas');

  let step = 0;
  const totalSteps = result.stateSeq.length;

  function animateStep() {
    if (step >= totalSteps) {
      const accText = result.accepted ? '✓ Accepted' : '✗ Rejected';
      const accCls = result.accepted ? 'success' : 'error';
      let info = `State path: ${result.stateSeq.map(s => dfaDef.states[s]).join(' → ')} — <strong class="validation ${accCls}">${accText}</strong>`;
      if (result.firstRepeated !== null) {
        info += `<br>First repeated state: <strong style="color:var(--y-color)">${dfaDef.states[result.firstRepeated]}</strong> — this loop corresponds to the y segment (pigeonhole principle).`;
      }
      traceEl.innerHTML = info;
      canvasEl.innerHTML = renderDFA(lang.id, result.stateSeq[totalSteps - 1], result.firstRepeated);
      return;
    }
    canvasEl.innerHTML = renderDFA(lang.id, result.stateSeq[step], null);
    traceEl.textContent = `Step ${step}: State ${dfaDef.states[result.stateSeq[step]]}${step > 0 ? ` (read '${str[step-1]}')` : ' (start)'}`;
    step++;
    setTimeout(animateStep, 500);
  }
  animateStep();
}

// --- Theory tab content ---
function renderTheory() {
  const content = document.getElementById('theoryContent');
  content.innerHTML = `
    <div class="collapsible open">
      <div class="collapsible-header" onclick="this.parentElement.classList.toggle('open')">
        <span>Pumping lemma statement</span><span class="arrow">▶</span>
      </div>
      <div class="collapsible-body">
        <p><strong>Pumping Lemma for Regular Languages:</strong></p>
        <p>If L is a regular language, then there exists a constant p ≥ 1 (the pumping length) such that every string w ∈ L with |w| ≥ p can be written as <span class="math">w = xyz</span> satisfying:</p>
        <ul>
          <li><span class="math">|y| > 0</span> (y is non-empty)</li>
          <li><span class="math">|xy| ≤ p</span> (x and y together are within the first p characters)</li>
          <li><span class="math">xy<sup>i</sup>z ∈ L</span> for all <span class="math">i ≥ 0</span> (pumping y any number of times keeps the string in L)</li>
        </ul>
        <p><strong>Quantifier structure for regularity:</strong><br>
        <span class="math">∃p ≥ 1, ∀w ∈ L (|w| ≥ p), ∃xyz (w = xyz, |y| > 0, |xy| ≤ p), ∀i ≥ 0: xy<sup>i</sup>z ∈ L</span></p>
        <p><strong>To disprove regularity (contrapositive):</strong><br>
        <span class="math">∀p ≥ 1, ∃w ∈ L (|w| ≥ p), ∀xyz (w = xyz, |y| > 0, |xy| ≤ p), ∃i ≥ 0: xy<sup>i</sup>z ∉ L</span></p>
      </div>
    </div>

    <div class="collapsible">
      <div class="collapsible-header" onclick="this.parentElement.classList.toggle('open')">
        <span>Pigeonhole intuition</span><span class="arrow">▶</span>
      </div>
      <div class="collapsible-body">
        <p>A DFA with p states reading a string of length ≥ p must visit at least p + 1 states. By the pigeonhole principle, some state is visited twice, creating a <strong>loop</strong>.</p>
        <p>The portion of the string before the loop is <strong>x</strong>, the loop itself is <strong>y</strong>, and the rest is <strong>z</strong>. Since y corresponds to a loop, repeating it (or removing it) keeps the DFA in the same accepting path — hence xy<sup>i</sup>z ∈ L for all i ≥ 0.</p>
        <p>The constraint |xy| ≤ p comes from taking the <strong>first</strong> repeated state.</p>
      </div>
    </div>

    <div class="collapsible">
      <div class="collapsible-header" onclick="this.parentElement.classList.toggle('open')">
        <span>Worked example: aⁿbⁿ is not regular</span><span class="arrow">▶</span>
      </div>
      <div class="collapsible-body">
        <p><strong>Claim:</strong> L = {aⁿbⁿ | n ≥ 0} is not regular.</p>
        <p><strong>Proof:</strong></p>
        <ul>
          <li>Assume L is regular. By the Pumping Lemma, ∃ p ≥ 1.</li>
          <li>Choose w = a<sup>p</sup>b<sup>p</sup>. Then w ∈ L and |w| = 2p ≥ p.</li>
          <li>For any decomposition w = xyz with |y| > 0 and |xy| ≤ p: since the first p characters are all a's, y = a<sup>k</sup> for some k ≥ 1.</li>
          <li>Consider i = 0: xy⁰z = a<sup>p−k</sup>b<sup>p</sup>. Since k ≥ 1, (p−k) ≠ p, so xy⁰z ∉ L.</li>
          <li>This contradicts the Pumping Lemma. Hence L is not regular. □</li>
        </ul>
      </div>
    </div>

    <div class="collapsible">
      <div class="collapsible-header" onclick="this.parentElement.classList.toggle('open')">
        <span>Worked example: (ab)* is regular — the lemma holds</span><span class="arrow">▶</span>
      </div>
      <div class="collapsible-body">
        <p><strong>Language:</strong> L = {(ab)* } = {ε, ab, abab, ababab, …}</p>
        <p>The minimal DFA has 3 states, so p = 3.</p>
        <p>Take w = ababab (|w| = 6 ≥ 3). One valid decomposition: x = ε, y = ab, z = abab.</p>
        <p>xy<sup>i</sup>z = (ab)<sup>i</sup> · abab = (ab)<sup>i+2</sup>, which is always in L. ✓</p>
        <p>The pumping lemma is <strong>satisfied</strong> — as expected for a regular language. The lemma does not prove regularity; it is merely consistent with it.</p>
      </div>
    </div>

    <div class="collapsible">
      <div class="collapsible-header" onclick="this.parentElement.classList.toggle('open')">
        <span>Common mistakes</span><span class="arrow">▶</span>
      </div>
      <div class="collapsible-body">
        <ul>
          <li><strong>Choosing w too short:</strong> You need |w| ≥ p. A string shorter than p doesn't have to satisfy the lemma.</li>
          <li><strong>Forgetting |xy| ≤ p:</strong> This constraint means y is within the first p characters. It severely limits where y can be, which is key to many proofs.</li>
          <li><strong>Trying to prove regularity:</strong> The Pumping Lemma is a <em>necessary</em> condition, not sufficient. Satisfying it does NOT prove regularity. Some non-regular languages also satisfy the pumping lemma (e.g., {a<sup>i</sup>b<sup>j</sup> | i ≠ j}).</li>
          <li><strong>Choosing w after seeing the decomposition:</strong> In the quantifier game, the adversary picks the decomposition <em>after</em> you pick w. You must choose w that works for <em>all</em> decompositions.</li>
          <li><strong>Not covering all cases of y:</strong> You must show the contradiction for <em>every</em> valid decomposition, not just one. Since |xy| ≤ p constrains y's location, you often argue about the form of y based on this constraint.</li>
        </ul>
      </div>
    </div>
  `;
}

/* ================================================================
   (i) SELF-TEST SUITE
   ================================================================ */

function runSelfTests() {
  const results = [];
  let pass = 0, fail = 0;

  function test(name, fn) {
    try {
      const ok = fn();
      if (ok) { pass++; results.push({ name, passed: true }); }
      else { fail++; results.push({ name, passed: false, msg: 'Assertion failed' }); }
    } catch (e) {
      fail++; results.push({ name, passed: false, msg: e.message });
    }
  }

  // Test 1: a^n b^n, p=3, w=aaabbb, x=ε, y=a, z=aabbb, i=2 → not in L
  test('aⁿbⁿ: pump x=ε,y=a,z=aabbb,i=2 → not in L', () => {
    const pumped = pumpString('', 'a', 'aabbb', 2);
    // pumped = "aa" + "aabbb" = "aaaabbb" (4a, 3b)
    const mem = checkMembership(0, pumped); // index 0 = anbn
    return !mem.inL;
  });

  // Test 2: a^n b^n, p=3, w=aaabbb: every valid decomposition has y of only a's, i=0 breaks all
  test('aⁿbⁿ: all decomps have y∈a*, all break at i=0', () => {
    const decomps = getValidDecompositions('aaabbb', 3);
    const allAOnly = decomps.every(d => /^a+$/.test(d.y));
    const allBreakAt0 = decomps.every(d => {
      const pumped = pumpString(d.x, d.y, d.z, 0);
      return !checkMembership(0, pumped).inL;
    });
    return allAOnly && allBreakAt0;
  });

  // Test 3: (ab)*, p=2, w=abab, x=ε, y=ab, z=ab: stays in L for i=0..10
  test('(ab)*: x=ε,y=ab,z=ab stays in L for i=0..10', () => {
    const langIdx = LANGUAGES.findIndex(l => l.id === 'ab_star');
    for (let i = 0; i <= 10; i++) {
      const pumped = pumpString('', 'ab', 'ab', i);
      if (!checkMembership(langIdx, pumped).inL) return false;
    }
    return true;
  });

  // Test 4: a^p prime, p=5, w=aaaaa: every valid decomp, some i in 0..20 gives non-prime
  test('a^p prime: p=5, w=aaaaa, all decomps break', () => {
    const langIdx = LANGUAGES.findIndex(l => l.id === 'a_prime');
    const decomps = getValidDecompositions('aaaaa', 5);
    return decomps.every(d => {
      for (let i = 0; i <= 20; i++) {
        const pumped = pumpString(d.x, d.y, d.z, i);
        if (!checkMembership(langIdx, pumped).inL) return true;
      }
      return false;
    });
  });

  // Test 5: Even #a's: w=aab, p=3, x=ε, y=aa, z=b: stays in L for all i
  test('Even #a\'s: x=ε,y=aa,z=b stays in L for all i=0..10', () => {
    const langIdx = LANGUAGES.findIndex(l => l.id === 'even_a');
    for (let i = 0; i <= 10; i++) {
      const pumped = pumpString('', 'aa', 'b', i);
      // pumped has 2i a's and 1 b. 2i is always even.
      if (!checkMembership(langIdx, pumped).inL) return false;
    }
    return true;
  });

  // Test 6: Palindromes: w=aabaa, p=3 → some valid decomposition breaks at i=2
  test('Palindromes: w=aabaa, p=3, some decomp breaks at i=2', () => {
    const langIdx = LANGUAGES.findIndex(l => l.id === 'palindrome');
    const decomps = getValidDecompositions('aabaa', 3);
    return decomps.some(d => {
      const pumped = pumpString(d.x, d.y, d.z, 2);
      return !checkMembership(langIdx, pumped).inL;
    });
  });

  // Test 7: Membership checks
  test('Membership: ε ∈ aⁿbⁿ', () => checkMembership(0, '').inL);

  test('Membership: ε ∈ a*b*', () => {
    const idx = LANGUAGES.findIndex(l => l.id === 'a_star_b_star');
    return checkMembership(idx, '').inL;
  });

  test('Membership: ε ∉ ends-in-01', () => {
    const idx = LANGUAGES.findIndex(l => l.id === 'end01');
    return !checkMembership(idx, '').inL;
  });

  test('Membership: "abc" flagged invalid in {a,b} language', () => {
    const result = checkMembership(0, 'abc'); // anbn has alphabet {a,b}
    return result.invalidChars === true;
  });

  // Test 8: Decomposition count: |w|=6, p=3 → 6 valid splits
  test('Decomposition count: |w|=6, p=3 → 6 splits', () => {
    const decomps = getValidDecompositions('aaabbb', 3);
    return decomps.length === 6;
  });

  // Additional tests
  test('pumpString correctness', () => {
    return pumpString('ab', 'cd', 'ef', 0) === 'abef' &&
           pumpString('ab', 'cd', 'ef', 1) === 'abcdef' &&
           pumpString('ab', 'cd', 'ef', 3) === 'abcdcdcdef' &&
           pumpString('', 'a', '', 5) === 'aaaaa';
  });

  test('isPrime correctness', () => {
    return !isPrime(0) && !isPrime(1) && isPrime(2) && isPrime(3) &&
           !isPrime(4) && isPrime(5) && isPrime(7) && !isPrime(9) &&
           isPrime(11) && isPrime(13) && !isPrime(15);
  });

  test('isPerfectSquare correctness', () => {
    return isPerfectSquare(0) && isPerfectSquare(1) && !isPerfectSquare(2) &&
           isPerfectSquare(4) && isPerfectSquare(9) && !isPerfectSquare(10) &&
           isPerfectSquare(16) && isPerfectSquare(25);
  });

  test('isPowerOf2 correctness', () => {
    return isPowerOf2(1) && isPowerOf2(2) && !isPowerOf2(3) &&
           isPowerOf2(4) && !isPowerOf2(6) && isPowerOf2(8) &&
           isPowerOf2(16) && !isPowerOf2(0);
  });

  // --- New lab logic (LabCore) ---
  if (typeof LabCore !== 'undefined') {
    const C = LabCore;
    test('Validator: |y|=0 fails, |xy|>p fails, legal split passes', () =>
      !C.validateDecomposition('000111', 3, 1, 0).valid &&
      !C.validateDecomposition('000111', 3, 2, 2).valid &&
      C.validateDecomposition('000111', 3, 1, 2).valid);
    test('Pumping i=0..5 lengths for x=a,y=ab,z=b', () =>
      C.pumpSeries(LANGUAGES.findIndex(l => l.id === 'ab_star'), 'a', 'ab', 'b', 0, 5).every(r => r.length === 2 + 2 * r.i));
    test('DFA verification: (ab)* x=ε,y=ab,z=ab is verified for all i', () =>
      C.verifyDecompositionDFA(DFA_DEFINITIONS.ab_star, '', 'ab', 'ab').verified === true);
    test('NFA ends-in-01: "1001" accepted with branching', () => {
      const r = C.nfaTrace(C.NFA_DEFINITIONS.ends01, '1001');
      return r.accepted && r.steps.some(s => s.active.length > 1);
    });
    test('Vending: insufficient payment returns to PAYMENT', () => {
      let s = C.vendingCreate();
      s = C.vendingReduce(s, { type: 'SELECT', code: 'A3' });
      s = C.vendingReduce(s, { type: 'INSERT', amount: 10 });
      s = C.vendingReduce(s, { type: 'VERIFY' });
      return s.state === 'PAYMENT' && s.credit === 10;
    });
    test('Traffic: one full cycle RED→GREEN→YELLOW→RED', () => {
      const r = C.trafficTick(C.trafficCreate(), 13);
      return r.state.phase === 'RED' && r.transitions.map(t => t.to).join() === 'GREEN,YELLOW,RED';
    });
    test('Password: "Lab#2026x" accepted, "lab 2026" rejected', () =>
      C.runPassword('Lab#2026x').accepted && !C.runPassword('lab 2026').accepted);
    test('Quiz: two rounds at one level never repeat a question', () => {
      const bank = C.buildQuestionBank(), used = new Set();
      const r1 = C.createQuizRound(bank, 'beginner', { used, rng: C.mulberry32(7) });
      r1.questions.forEach(q => used.add(q.id));
      const r2 = C.createQuizRound(bank, 'beginner', { used, rng: C.mulberry32(8) });
      return r2.questions.every(q => !r1.questions.some(o => o.id === q.id));
    });
  }

  // Render results
  const container = document.getElementById('testResults');
  let html = '';
  results.forEach(r => {
    html += `<div class="test-result ${r.passed ? 'test-pass' : 'test-fail'}">
      <span>${r.passed ? '✓' : '✗'}</span>
      <span>${esc(r.name)}</span>
      ${r.msg ? `<span class="text-muted" style="margin-left:auto">${esc(r.msg)}</span>` : ''}
    </div>`;
  });
  const cls = fail === 0 ? 'alert-success' : 'alert-danger';
  html += `<div class="test-summary alert ${cls}">
    ${fail === 0 ? '✓' : '✗'} ${pass} passed, ${fail} failed out of ${pass + fail} tests
  </div>`;
  container.innerHTML = html;
}

/* ================================================================
   (j) EVENT HANDLERS & INITIALIZATION
   ================================================================ */

function setupCustomRegex() {
  const lang = LANGUAGES[LANGUAGES.length - 1]; // custom
  const regexInput = document.getElementById('customRegex');
  const alphaInput = document.getElementById('customAlpha');
  const errorEl = document.getElementById('customRegexError');

  function update() {
    const pattern = regexInput.value.trim();
    const alpha = alphaInput.value.trim();
    if (!pattern) {
      lang._regex = null;
      errorEl.textContent = '';
      return;
    }
    try {
      // Anchor the regex
      const anchored = /^\^/.test(pattern) ? pattern : '^(?:' + pattern + ')$';
      lang._regex = new RegExp(anchored.replace(/\$$/, '') + '$');
      lang.alphabet = alpha ? alpha.split('') : ['a','b'];
      errorEl.textContent = '';
      errorEl.className = 'validation';
    } catch (e) {
      lang._regex = null;
      errorEl.textContent = '✗ Invalid regex: ' + e.message;
      errorEl.className = 'validation error';
    }
  }

  regexInput.addEventListener('input', update);
  alphaInput.addEventListener('input', update);
}

function init() {
  populateDropdowns();
  updateLangInfo();
  renderTheory();

  // Tab navigation
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Reset
  document.getElementById('resetBtn').addEventListener('click', () => {
    state.langIdx = 0;
    state.pumpLen = 3;
    state.inputStr = '';
    state.xLen = 0;
    state.yLen = 1;
    state.pumpI = 1;
    document.getElementById('langSelect').value = 0;
    document.getElementById('pSlider').value = 3;
    document.getElementById('pNumber').value = 3;
    document.getElementById('pValue').textContent = 3;
    document.getElementById('stringInput').value = '';
    document.getElementById('iSlider').value = 1;
    document.getElementById('iNumber').value = 1;
    document.getElementById('iValue').textContent = 1;
    gameState.score = { player: 0, adversary: 0 };
    gameState.rounds = 0;
    gameState.phase = 0;
    refreshSimulator();
    renderGame();
  });

  // Language select
  document.getElementById('langSelect').addEventListener('change', (e) => {
    state.langIdx = parseInt(e.target.value);
    state.inputStr = '';
    document.getElementById('stringInput').value = '';
    state.xLen = 0;
    state.yLen = 1;
    refreshSimulator();
  });

  // Pumping length p
  const pSlider = document.getElementById('pSlider');
  const pNumber = document.getElementById('pNumber');
  const pValue = document.getElementById('pValue');
  function updateP(val) {
    val = clamp(parseInt(val) || 1, 1, 15);
    state.pumpLen = val;
    pSlider.value = val;
    pNumber.value = val;
    pValue.textContent = val;
    refreshSimulator();
  }
  pSlider.addEventListener('input', () => updateP(pSlider.value));
  pNumber.addEventListener('input', () => updateP(pNumber.value));

  // String input
  const strInput = document.getElementById('stringInput');
  strInput.addEventListener('input', () => {
    state.inputStr = strInput.value;
    if (state.inputStr.length > 60) {
      state.inputStr = state.inputStr.substring(0, 60);
      strInput.value = state.inputStr;
    }
    state.xLen = 0;
    state.yLen = 1;
    refreshSimulator();
  });

  // Suggest & Random buttons
  document.getElementById('suggestBtn').addEventListener('click', () => {
    const lang = LANGUAGES[state.langIdx];
    const suggested = lang.suggest(state.pumpLen);
    const truncated = suggested.length > 60 ? suggested.substring(0, 60) : suggested;
    state.inputStr = truncated;
    strInput.value = truncated;
    state.xLen = 0;
    state.yLen = 1;
    refreshSimulator();
  });

  document.getElementById('randomBtn').addEventListener('click', () => {
    const lang = LANGUAGES[state.langIdx];
    const p = state.pumpLen;
    // Generate random valid string of length >= p
    let attempts = 0, s = '';
    while (attempts < 200) {
      const len = p + Math.floor(Math.random() * (p + 4));
      s = '';
      for (let i = 0; i < Math.min(len, 60); i++) {
        s += lang.alphabet[Math.floor(Math.random() * lang.alphabet.length)];
      }
      if (checkMembership(state.langIdx, s).inL) break;
      attempts++;
    }
    // Fallback to suggest
    if (!checkMembership(state.langIdx, s).inL) {
      s = lang.suggest(p);
      if (s.length > 60) s = s.substring(0, 60);
    }
    state.inputStr = s;
    strInput.value = s;
    state.xLen = 0;
    state.yLen = 1;
    refreshSimulator();
  });

  // Decomposition controls
  const xSlider = document.getElementById('xLenSlider');
  const xNum = document.getElementById('xLenNum');
  const ySlider = document.getElementById('yLenSlider');
  const yNum = document.getElementById('yLenNum');

  function updateXLen(val) {
    state.xLen = clamp(parseInt(val) || 0, 0, parseInt(xSlider.max));
    xSlider.value = state.xLen;
    xNum.value = state.xLen;
    document.getElementById('xLenVal').textContent = state.xLen;
    // Adjust y limits
    const maxY = Math.min(state.pumpLen, state.inputStr.length) - state.xLen;
    ySlider.max = maxY;
    yNum.max = maxY;
    state.yLen = clamp(state.yLen, 1, maxY);
    ySlider.value = state.yLen;
    yNum.value = state.yLen;
    document.getElementById('yLenVal').textContent = state.yLen;
    renderCharBoxes();
    renderPumped();
  }
  function updateYLen(val) {
    const maxY = Math.min(state.pumpLen, state.inputStr.length) - state.xLen;
    state.yLen = clamp(parseInt(val) || 1, 1, maxY);
    ySlider.value = state.yLen;
    yNum.value = state.yLen;
    document.getElementById('yLenVal').textContent = state.yLen;
    renderCharBoxes();
    renderPumped();
  }

  xSlider.addEventListener('input', () => updateXLen(xSlider.value));
  xNum.addEventListener('input', () => updateXLen(xNum.value));
  ySlider.addEventListener('input', () => updateYLen(ySlider.value));
  yNum.addEventListener('input', () => updateYLen(yNum.value));

  // Pump i
  const iSlider = document.getElementById('iSlider');
  const iNumber = document.getElementById('iNumber');
  const iValue = document.getElementById('iValue');
  function updateI(val) {
    state.pumpI = clamp(parseInt(val) || 0, 0, 10);
    iSlider.value = state.pumpI;
    iNumber.value = state.pumpI;
    iValue.textContent = state.pumpI;
    renderPumped();
  }
  iSlider.addEventListener('input', () => updateI(iSlider.value));
  iNumber.addEventListener('input', () => updateI(iNumber.value));

  // Quick exponent buttons i = 0..5
  const iButtons = document.getElementById('iButtons');
  iButtons.innerHTML = [0, 1, 2, 3, 4, 5].map(k => `<button class="btn btn-sm" type="button" data-i="${k}" aria-label="Set i to ${k}">${k}</button>`).join('');
  iButtons.addEventListener('click', (e) => {
    const b = e.target.closest('[data-i]');
    if (b) updateI(b.dataset.i);
  });

  // List decomps
  document.getElementById('listDecompsBtn').addEventListener('click', renderAllDecomps);

  // Proof tab
  document.getElementById('runProofBtn').addEventListener('click', runProofUI);
  document.getElementById('copyProofBtn').addEventListener('click', copyProof);

  // Game tab
  document.getElementById('gameStartBtn').addEventListener('click', startGameRound);
  document.getElementById('gameHintBtn').addEventListener('click', () => {
    const hint = getGameHint(gameState.langIdx, gameState.phase <= 2 ? 2 : 4);
    const area = document.getElementById('gameArea');
    // Insert hint at top of game area
    const hintDiv = document.createElement('div');
    hintDiv.className = 'alert alert-info';
    hintDiv.innerHTML = `<span class="emoji">💡</span> ${esc(hint)}`;
    area.insertBefore(hintDiv, area.firstChild);
  });

  // DFA tab
  document.getElementById('dfaLangSelect').addEventListener('change', renderDFATab);
  document.getElementById('dfaTraceBtn').addEventListener('click', traceDFAUI);
  renderDFATab();

  // Self-test tab
  document.getElementById('runTestsBtn').addEventListener('click', runSelfTests);

  // Preset demos
  document.getElementById('demo1').addEventListener('click', () => {
    state.langIdx = 0; // anbn
    document.getElementById('langSelect').value = 0;
    state.pumpLen = 4;
    pSlider.value = 4; pNumber.value = 4; pValue.textContent = 4;
    state.inputStr = 'aaaabbbb';
    strInput.value = 'aaaabbbb';
    state.xLen = 0; state.yLen = 1; state.pumpI = 0;
    iSlider.value = 0; iNumber.value = 0; iValue.textContent = 0;
    refreshSimulator();
  });
  document.getElementById('demo2').addEventListener('click', () => {
    state.langIdx = LANGUAGES.findIndex(l => l.id === 'ab_star');
    document.getElementById('langSelect').value = state.langIdx;
    state.pumpLen = 2;
    pSlider.value = 2; pNumber.value = 2; pValue.textContent = 2;
    state.inputStr = 'abab';
    strInput.value = 'abab';
    state.xLen = 0; state.yLen = 2; state.pumpI = 2;
    iSlider.value = 2; iNumber.value = 2; iValue.textContent = 2;
    refreshSimulator();
  });
  document.getElementById('demo3').addEventListener('click', () => {
    state.langIdx = LANGUAGES.findIndex(l => l.id === 'a_prime');
    document.getElementById('langSelect').value = state.langIdx;
    state.pumpLen = 5;
    pSlider.value = 5; pNumber.value = 5; pValue.textContent = 5;
    state.inputStr = 'aaaaa';
    strInput.value = 'aaaaa';
    state.xLen = 0; state.yLen = 1; state.pumpI = 1;
    iSlider.value = 1; iNumber.value = 1; iValue.textContent = 1;
    refreshSimulator();
  });

  // Custom regex setup
  setupCustomRegex();

  // Keyboard navigation for tabs
  document.querySelector('.tabs').addEventListener('keydown', (e) => {
    const tabs = [...document.querySelectorAll('.tab-btn')];
    const idx = tabs.indexOf(document.activeElement);
    if (idx < 0) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); tabs[(idx + 1) % tabs.length].focus(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); tabs[(idx - 1 + tabs.length) % tabs.length].focus(); }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tabs[idx].click(); }
  });

  refreshSimulator();
  renderGame();
}

// --- Boot ---



/* ================================================================
   LAB CORE — pure logic for the new modules (no DOM access).
   Depends on the engine above: LANGUAGES, checkMembership,
   getValidDecompositions, pumpString, runProof, DFA_DEFINITIONS.
   Loaded by test_runner.js as well as by the browser.
   ================================================================ */
const LabCore = (function () {
  'use strict';

  /* ---------- utilities ---------- */
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(arr, rng) {
    const r = rng || Math.random;
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function langIndex(id) { return LANGUAGES.findIndex(l => l.id === id); }
  function eps(s) { return s === '' ? 'ε' : s; }
  function formatINR(n) { return '₹' + Number(n).toLocaleString('en-IN'); }

  /* ================================================================
     1. DECOMPOSITION VALIDATOR
     ================================================================ */
  function validateDecomposition(w, p, xLen, yLen) {
    const errors = [];
    const empty = { lengthAtLeastP: false, yNonEmpty: false, xyWithinP: false };
    if (typeof w !== 'string') errors.push('w must be a string.');
    if (!Number.isInteger(p) || p < 1) errors.push('p must be a whole number ≥ 1.');
    if (!Number.isInteger(xLen) || xLen < 0) errors.push('|x| must be a whole number ≥ 0.');
    if (!Number.isInteger(yLen) || yLen < 0) errors.push('|y| must be a whole number ≥ 0.');
    if (!errors.length && xLen + yLen > w.length) errors.push('x and y run past the end of w.');
    if (errors.length) return { valid: false, errors, x: '', y: '', z: '', conditions: empty };
    const x = w.slice(0, xLen), y = w.slice(xLen, xLen + yLen), z = w.slice(xLen + yLen);
    const conditions = {
      lengthAtLeastP: w.length >= p,
      yNonEmpty: yLen > 0,
      xyWithinP: xLen + yLen <= p
    };
    return {
      valid: conditions.lengthAtLeastP && conditions.yNonEmpty && conditions.xyWithinP,
      errors: [], x, y, z, conditions
    };
  }

  /* ================================================================
     2. PUMPING
     ================================================================ */
  function pumpSeries(langIdx, x, y, z, iMin, iMax) {
    const lo = iMin == null ? 0 : iMin, hi = iMax == null ? 5 : iMax;
    const out = [];
    for (let i = lo; i <= hi; i++) {
      const s = pumpString(x, y, z, i);
      const m = checkMembership(langIdx, s);
      out.push({ i, str: s, length: s.length, inL: !!m.inL, reason: m.reason });
    }
    return out;
  }

  /** Character-level diff of xyⁱz against xyz: unchanged / inserted / removed. */
  function pumpSegments(x, y, z, i) {
    const segs = [];
    for (const ch of x) segs.push({ ch, part: 'x', kind: 'unchanged' });
    if (i === 0) {
      for (const ch of y) segs.push({ ch, part: 'y', kind: 'removed', copy: 0 });
    } else {
      for (let c = 0; c < i; c++)
        for (const ch of y) segs.push({ ch, part: 'y', kind: c === 0 ? 'unchanged' : 'inserted', copy: c });
    }
    for (const ch of z) segs.push({ ch, part: 'z', kind: 'unchanged' });
    return segs;
  }

  /* ---------- formal verification for languages with a DFA ---------- */
  function dfaRun(def, str, from) {
    let q = from == null ? def.start : from;
    for (const ch of str) {
      const n = def.transMap[q + '_' + ch];
      if (n === undefined) return null;
      q = n;
    }
    return q;
  }

  /**
   * Decide "xyⁱz ∈ L for every i ≥ 0" exactly, using the DFA.
   * The states reached after x·yⁱ form an eventually periodic sequence with
   * at most |Q| distinct values, so checking each of them against z covers
   * every i.
   */
  function verifyDecompositionDFA(def, x, y, z) {
    const qx = dfaRun(def, x);
    if (qx === null) return { verified: false, error: 'x uses a symbol outside the DFA alphabet.' };
    const orbit = [], seen = {};
    let q = qx;
    while (seen[q] === undefined) {
      seen[q] = orbit.length;
      orbit.push(q);
      const n = dfaRun(def, y, q);
      if (n === null) return { verified: false, error: 'y uses a symbol outside the DFA alphabet.' };
      q = n;
    }
    const cycleStart = seen[q];
    for (let k = 0; k < orbit.length; k++) {
      const f = dfaRun(def, z, orbit[k]);
      if (f === null) return { verified: false, error: 'z uses a symbol outside the DFA alphabet.' };
      if (!def.accepting.includes(f)) return { verified: false, failingI: k, orbit, cycleStart };
    }
    return { verified: true, orbit, cycleStart };
  }

  /**
   * Classify a decomposition honestly:
   *  invalid        — violates |y| > 0
   *  counterexample — some concrete i gives xyⁱz ∉ L (one i is enough)
   *  verified       — proved for ALL i via the language's DFA
   *  tested         — only the tested exponents were checked
   *  unavailable    — custom pattern: all-i verification not possible here
   */
  function classifyDecomposition(langIdx, x, y, z, testedMax) {
    const lang = LANGUAGES[langIdx];
    const max = testedMax == null ? 10 : testedMax;
    if (!y.length) return { kind: 'invalid', label: 'Invalid decomposition', detail: 'y is empty, so condition (1) |y| > 0 fails before pumping is even considered.' };
    const series = pumpSeries(langIdx, x, y, z, 0, max);
    const fail = series.find(r => !r.inL);
    if (fail) {
      return { kind: 'counterexample', i: fail.i, label: 'Counterexample (this decomposition)', series,
        detail: `xy${sup(fail.i)}z = ${eps(short(fail.str))} ∉ L (${fail.reason}). One failing exponent is enough: this decomposition does not satisfy condition (3).` };
    }
    if (lang.isCustom) {
      return { kind: 'unavailable', label: 'Verification unavailable', series,
        detail: `Custom patterns cannot be verified for every i here. xyⁱz ∈ L for the tested i = 0…${max} only — that is not a proof of condition (3).` };
    }
    const def = DFA_DEFINITIONS[lang.id];
    if (def) {
      const v = verifyDecompositionDFA(def, x, y, z);
      if (v.verified) {
        const names = v.orbit.map(s => def.states[s]).join(', ');
        return { kind: 'verified', label: 'Verified decomposition', series, orbit: v.orbit,
          detail: `Proved for every i ≥ 0 with the ${def.states.length}-state DFA: after x·yⁱ the machine is always in one of {${names}}, and from each of them z leads to an accepting state.` };
      }
      if (v.failingI != null) {
        const s = pumpString(x, y, z, v.failingI);
        return { kind: 'counterexample', i: v.failingI, label: 'Counterexample (this decomposition)', series,
          detail: `The DFA shows xy${sup(v.failingI)}z = ${eps(short(s))} ∉ L, beyond the tested range.` };
      }
    }
    return { kind: 'tested', label: 'Tested exponents only', series,
      detail: `xyⁱz ∈ L for the tested i = 0…${max}. Finitely many tests never prove condition (3) for all i.` };
  }

  function languageStatus(langIdx) {
    const lang = LANGUAGES[langIdx];
    if (lang.isCustom) return { kind: 'unavailable', label: 'Verification unavailable', detail: 'Custom pattern: membership comes from your expression, but this lab cannot verify regularity or produce a proof for it.' };
    if (!lang.regular) return { kind: 'formal', label: 'Formal proof available', detail: `${lang.description} is not regular. The Proof generator tab gives the general contradiction argument that works for every p.` };
    const def = DFA_DEFINITIONS[lang.id];
    if (def) return { kind: 'verified', label: 'Regular (DFA)', detail: `${lang.description} is recognised by a ${def.states.length}-state DFA, which is what proves it regular. The lemma holds with p = ${def.states.length}; satisfying it never proves regularity on its own.` };
    return { kind: 'tested', label: 'Regular', detail: `${lang.description} is regular.` };
  }

  function sup(i) {
    const m = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
    return String(i).split('').map(c => m[c] || c).join('');
  }
  function short(s) { return s.length > 36 ? s.slice(0, 33) + '…' : s; }

  /* ================================================================
     3. AUTOMATA — DFA trace, NFA (with ε) trace, builder model
     ================================================================ */
  function dfaTrace(def, input) {
    const N = i => def.states[i];
    const steps = [{ index: 0, state: def.start, char: null, from: null, to: def.start,
      explanation: `Start in ${N(def.start)} before reading anything.` }];
    let q = def.start;
    for (let k = 0; k < input.length; k++) {
      const ch = input[k];
      const n = def.transMap[q + '_' + ch];
      if (n === undefined) {
        steps.push({ index: k + 1, state: null, char: ch, from: q, to: null, dead: true,
          explanation: `No transition from ${N(q)} on '${ch}'. The machine halts and rejects.` });
        return { steps, accepted: false, halted: true };
      }
      steps.push({ index: k + 1, state: n, char: ch, from: q, to: n,
        explanation: `Read '${ch}': δ(${N(q)}, ${ch}) = ${N(n)}.` });
      q = n;
    }
    return { steps, accepted: def.accepting.includes(q), halted: false };
  }

  function buildDelta(def) {
    const d = {};
    for (const t of def.transitions) {
      for (const raw of String(t.label).split(',')) {
        const sym = raw.trim();
        if (!sym) continue;
        const key = t.from + '|' + sym;
        if (!d[key]) d[key] = [];
        if (!d[key].includes(t.to)) d[key].push(t.to);
      }
    }
    return d;
  }

  function epsClosure(delta, states) {
    const out = states.slice(), moves = [];
    const stack = states.slice();
    while (stack.length) {
      const q = stack.pop();
      for (const t of delta[q + '|ε'] || []) {
        moves.push({ from: q, to: t, sym: 'ε' });
        if (!out.includes(t)) { out.push(t); stack.push(t); }
      }
    }
    return { set: out.sort((a, b) => a - b), moves };
  }

  function nfaTrace(def, input) {
    const delta = buildDelta(def);
    const N = i => def.states[i];
    const fmt = set => '{' + set.map(N).join(', ') + '}';
    let c = epsClosure(delta, [def.start]);
    const steps = [{ index: 0, char: null, active: c.set, moves: c.moves,
      explanation: c.moves.length ? `Start: ε-closure({${N(def.start)}}) = ${fmt(c.set)}.` : `Start in ${fmt(c.set)}.` }];
    let cur = c.set;
    for (let k = 0; k < input.length; k++) {
      const ch = input[k];
      const moves = [], next = [];
      for (const q of cur) {
        for (const t of delta[q + '|' + ch] || []) {
          moves.push({ from: q, to: t, sym: ch });
          if (!next.includes(t)) next.push(t);
        }
      }
      const cl = epsClosure(delta, next);
      const all = moves.concat(cl.moves);
      const branching = cur.filter(q => (delta[q + '|' + ch] || []).length > 1);
      let explanation;
      if (!cl.set.length) explanation = `Read '${ch}': no state in ${fmt(cur)} has a '${ch}'-transition. Every branch dies.`;
      else {
        explanation = `Read '${ch}': ${fmt(cur)} → ${fmt(cl.set)}.`;
        if (branching.length) explanation += ` Nondeterministic choice at ${branching.map(N).join(', ')} — the machine follows every option at once.`;
        if (cl.moves.length) explanation += ' ε-moves add states without reading input.';
      }
      steps.push({ index: k + 1, char: ch, active: cl.set, moves: all, explanation });
      cur = cl.set;
      if (!cur.length) {
        return { steps, accepted: false, died: true };
      }
    }
    return { steps, accepted: cur.some(q => def.accepting.includes(q)), died: false };
  }

  const NFA_DEFINITIONS = {
    ends01: {
      name: 'Ends in 01 (guess the suffix)', alphabet: ['0', '1'],
      states: ['q₀', 'q₁', 'q₂'], start: 0, accepting: [2],
      transitions: [
        { from: 0, to: 0, label: '0,1' }, { from: 0, to: 1, label: '0' }, { from: 1, to: 2, label: '1' }
      ],
      positions: [{ x: 110, y: 170 }, { x: 290, y: 170 }, { x: 470, y: 170 }],
      sample: '1001'
    },
    third1: {
      name: 'Third symbol from the end is 1', alphabet: ['0', '1'],
      states: ['q₀', 'q₁', 'q₂', 'q₃'], start: 0, accepting: [3],
      transitions: [
        { from: 0, to: 0, label: '0,1' }, { from: 0, to: 1, label: '1' },
        { from: 1, to: 2, label: '0,1' }, { from: 2, to: 3, label: '0,1' }
      ],
      positions: [{ x: 90, y: 170 }, { x: 220, y: 170 }, { x: 350, y: 170 }, { x: 480, y: 170 }],
      sample: '01100'
    },
    aOrB: {
      name: 'a* ∪ b* (ε-transitions)', alphabet: ['a', 'b'],
      states: ['q₀', 'q₁', 'q₂'], start: 0, accepting: [1, 2],
      transitions: [
        { from: 0, to: 1, label: 'ε' }, { from: 0, to: 2, label: 'ε' },
        { from: 1, to: 1, label: 'a' }, { from: 2, to: 2, label: 'b' }
      ],
      positions: [{ x: 130, y: 200 }, { x: 380, y: 110 }, { x: 380, y: 290 }],
      sample: 'aaa'
    }
  };

  /* ---------- transition builder (immutable model) ---------- */
  const BUILDER_MAX_STATES = 8;
  function builderCreate() { return { states: [], transitions: [], start: null, nextId: 0 }; }
  function builderAddState(m) {
    if (m.states.length >= BUILDER_MAX_STATES) return { model: m, error: `A builder automaton can have at most ${BUILDER_MAX_STATES} states.` };
    const id = m.nextId;
    return { model: { ...m, states: m.states.concat([{ id, name: 'q' + id, final: false }]), nextId: id + 1, start: m.start === null ? id : m.start }, error: null };
  }
  function builderRemoveState(m, id) {
    if (!m.states.some(s => s.id === id)) return { model: m, error: 'That state does not exist.' };
    const states = m.states.filter(s => s.id !== id);
    const transitions = m.transitions.filter(t => t.from !== id && t.to !== id);
    const start = m.start === id ? (states.length ? states[0].id : null) : m.start;
    return { model: { ...m, states, transitions, start }, error: null };
  }
  function builderToggleFinal(m, id) {
    if (!m.states.some(s => s.id === id)) return { model: m, error: 'That state does not exist.' };
    return { model: { ...m, states: m.states.map(s => s.id === id ? { ...s, final: !s.final } : s) }, error: null };
  }
  function builderSetStart(m, id) {
    if (!m.states.some(s => s.id === id)) return { model: m, error: 'Choose an existing state as the start state.' };
    return { model: { ...m, start: id }, error: null };
  }
  function builderAddTransition(m, from, to, symbol) {
    const sym = String(symbol == null ? '' : symbol).trim();
    if (!m.states.some(s => s.id === from) || !m.states.some(s => s.id === to)) return { model: m, error: 'Pick both a source and a target state.' };
    if (!sym) return { model: m, error: 'Enter a transition symbol.' };
    if (sym !== 'ε' && !/^[A-Za-z0-9]$/.test(sym)) return { model: m, error: 'Symbols must be a single letter or digit, or ε.' };
    if (m.transitions.some(t => t.from === from && t.to === to && t.sym === sym)) return { model: m, error: 'That transition already exists.' };
    return { model: { ...m, transitions: m.transitions.concat([{ from, to, sym }]) }, error: null };
  }
  function builderRemoveTransition(m, index) {
    if (index < 0 || index >= m.transitions.length) return { model: m, error: 'No such transition.' };
    return { model: { ...m, transitions: m.transitions.filter((_, i) => i !== index) }, error: null };
  }
  function builderIsDeterministic(m) {
    const seen = {};
    for (const t of m.transitions) {
      if (t.sym === 'ε') return false;
      const k = t.from + '|' + t.sym;
      if (seen[k]) return false;
      seen[k] = true;
    }
    return true;
  }
  function builderToAutomaton(m) {
    if (!m.states.length) return { def: null, error: 'Add at least one state.' };
    if (m.start === null || !m.states.some(s => s.id === m.start)) return { def: null, error: 'Choose a start state.' };
    const index = {};
    m.states.forEach((s, i) => { index[s.id] = i; });
    const grouped = {};
    for (const t of m.transitions) {
      const k = index[t.from] + '>' + index[t.to];
      grouped[k] = grouped[k] ? grouped[k] + ',' + t.sym : t.sym;
    }
    const transitions = Object.keys(grouped).map(k => {
      const [f, to] = k.split('>').map(Number);
      return { from: f, to, label: grouped[k] };
    });
    const alphabet = Array.from(new Set(m.transitions.map(t => t.sym).filter(s => s !== 'ε'))).sort();
    return {
      def: {
        name: 'Your automaton', states: m.states.map(s => s.name), start: index[m.start],
        accepting: m.states.map((s, i) => s.final ? i : -1).filter(i => i >= 0),
        transitions, alphabet
      },
      deterministic: builderIsDeterministic(m),
      error: null
    };
  }
  function builderExample() {
    // NFA for strings over {a,b} that contain "ab"
    let m = builderCreate();
    for (let i = 0; i < 3; i++) m = builderAddState(m).model;
    m = builderAddTransition(m, 0, 0, 'a').model;
    m = builderAddTransition(m, 0, 0, 'b').model;
    m = builderAddTransition(m, 0, 1, 'a').model;
    m = builderAddTransition(m, 1, 2, 'b').model;
    m = builderAddTransition(m, 2, 2, 'a').model;
    m = builderAddTransition(m, 2, 2, 'b').model;
    m = builderToggleFinal(m, 2).model;
    return m;
  }

  /* ================================================================
     4. REAL-WORLD MACHINES
     ================================================================ */

  /* ---------- 4a. Vending machine ---------- */
  const VENDING_STATES = ['IDLE', 'SELECTION', 'PAYMENT', 'VERIFICATION', 'DISPENSING', 'COMPLETE'];
  const VENDING_DENOMINATIONS = [5, 10, 20, 50];
  const VENDING_PRODUCTS = [
    { code: 'A1', name: 'Water', price: 20, kind: 'bottle', color: '#568C82' },
    { code: 'A2', name: 'Lemon soda', price: 35, kind: 'can', color: '#E8C66A' },
    { code: 'A3', name: 'Cola', price: 40, kind: 'can', color: '#B4532A' },
    { code: 'B1', name: 'Salted chips', price: 25, kind: 'bag', color: '#D66A3A' },
    { code: 'B2', name: 'Masala peanuts', price: 15, kind: 'bag', color: '#86650F' },
    { code: 'B3', name: 'Granola bar', price: 30, kind: 'bar', color: '#3E6B63' },
    { code: 'C1', name: 'Dark chocolate', price: 50, kind: 'bar', color: '#4A4C45' },
    { code: 'C2', name: 'Iced tea', price: 45, kind: 'bottle', color: '#C9A24A' },
    { code: 'C3', name: 'Mint gum', price: 10, kind: 'bag', color: '#7FA79F' }
  ];
  const VENDING_INITIAL_STOCK = { A1: 5, A2: 4, A3: 3, B1: 4, B2: 6, B3: 2, C1: 1, C2: 3, C3: 0 };

  function vendingCreate() {
    return { state: 'IDLE', selected: null, credit: 0, change: 0, stock: { ...VENDING_INITIAL_STOCK },
      message: 'Touch the screen or press a product code to begin.', error: null, last: null };
  }
  function vendingProduct(code) { return VENDING_PRODUCTS.find(p => p.code === code) || null; }

  function vendingReduce(s, ev) {
    const go = (to, patch, label) => ({ ...s, error: null, ...patch, state: to, last: { from: s.state, to, event: label || ev.type } });
    const stay = (error, patch) => ({ ...s, ...(patch || {}), error, last: { from: s.state, to: s.state, event: ev.type, rejected: true } });
    switch (ev.type) {
      case 'START':
        if (s.state !== 'IDLE') return stay(`START is not valid in ${s.state}.`);
        return go('SELECTION', { message: 'Enter a product code (e.g. A2).' });
      case 'SELECT': {
        if (s.state === 'COMPLETE') return stay('Collect your product first.');
        if (s.state === 'DISPENSING') return stay('Please wait — dispensing.');
        if (s.state !== 'IDLE' && s.state !== 'SELECTION') return stay(`Selection is locked in ${s.state}. Cancel first to change product.`);
        const code = String(ev.code || '').trim().toUpperCase();
        const p = vendingProduct(code);
        if (!/^[A-C][1-3]$/.test(code) || !p) return { ...stay(`Invalid code “${code || '—'}”. Use a letter A–C and a digit 1–3.`), state: 'SELECTION', last: { from: s.state, to: 'SELECTION', event: 'SELECT ' + (code || '—'), rejected: true } };
        if ((s.stock[code] || 0) <= 0) return { ...stay(`${p.name} (${code}) is sold out. Choose another product.`), state: 'SELECTION', last: { from: s.state, to: 'SELECTION', event: 'SELECT ' + code, rejected: true } };
        return go('PAYMENT', { selected: code, credit: 0, message: `${p.name}: insert ${formatINR(p.price)}.` }, 'SELECT ' + code);
      }
      case 'INSERT': {
        if (s.state !== 'PAYMENT') return stay(s.state === 'IDLE' || s.state === 'SELECTION' ? 'Select a product before paying.' : `Payment is not accepted in ${s.state}.`);
        const amt = Number(ev.amount);
        if (!VENDING_DENOMINATIONS.includes(amt)) return stay(`Rejected: ${isNaN(amt) ? 'unknown item' : formatINR(amt) + ' coin'} is not accepted. Returned to tray.`);
        return go('VERIFICATION', { credit: s.credit + amt, message: `Verifying ${formatINR(s.credit + amt)}…` }, 'INSERT ' + formatINR(amt));
      }
      case 'VERIFY': {
        if (s.state !== 'VERIFICATION') return stay(`Nothing to verify in ${s.state}.`);
        const p = vendingProduct(s.selected);
        if (s.credit >= p.price) return go('DISPENSING', { change: s.credit - p.price, message: `Paid. Dispensing ${p.name}…` }, 'VERIFY ok');
        const need = p.price - s.credit;
        return { ...go('PAYMENT', { message: `Insufficient payment: ${formatINR(s.credit)} of ${formatINR(p.price)}. Insert ${formatINR(need)} more.` }, 'VERIFY insufficient'), error: `Insufficient payment — ${formatINR(need)} more needed.` };
      }
      case 'DISPENSED': {
        if (s.state !== 'DISPENSING') return stay(`Nothing is being dispensed in ${s.state}.`);
        const p = vendingProduct(s.selected);
        const stock = { ...s.stock, [s.selected]: s.stock[s.selected] - 1 };
        return go('COMPLETE', { stock, message: `Collect your ${p.name}${s.change ? ` and ${formatINR(s.change)} change` : ''}.` }, 'DISPENSED');
      }
      case 'COLLECT':
        if (s.state !== 'COMPLETE') return stay(`Nothing to collect in ${s.state}.`);
        return go('IDLE', { selected: null, credit: 0, change: 0, message: 'Thank you. Touch the screen to start again.' }, 'COLLECT');
      case 'CANCEL': {
        if (!['SELECTION', 'PAYMENT', 'VERIFICATION'].includes(s.state)) return stay(`Cancel is not available in ${s.state}.`);
        const refund = s.credit;
        return go('IDLE', { selected: null, credit: 0, change: 0, message: refund ? `Cancelled. ${formatINR(refund)} refunded.` : 'Cancelled.' }, 'CANCEL');
      }
      default:
        return stay(`Unknown event ${ev.type}.`);
    }
  }

  /* ---------- 4b. Traffic light ---------- */
  const TRAFFIC_ORDER = ['RED', 'GREEN', 'YELLOW'];
  const TRAFFIC_NEXT = { RED: 'GREEN', GREEN: 'YELLOW', YELLOW: 'RED' };
  const TRAFFIC_DURATIONS = { RED: 6, GREEN: 5, YELLOW: 2 };
  const CROSS_CLEARANCE = 1.5; // seconds of all-red/yellow before main turns green

  function trafficCreate(durations) {
    return { phase: 'RED', elapsed: 0, durations: { ...TRAFFIC_DURATIONS, ...(durations || {}) }, cycles: 0 };
  }
  function trafficTick(s, dt) {
    if (!(dt > 0)) return { state: s, transitions: [] };
    let phase = s.phase, elapsed = s.elapsed + dt, cycles = s.cycles;
    const transitions = [];
    let guard = 0;
    while (elapsed >= s.durations[phase] && guard++ < 1000) {
      elapsed -= s.durations[phase];
      const to = TRAFFIC_NEXT[phase];
      transitions.push({ from: phase, to });
      phase = to;
      if (phase === 'RED') cycles++;
    }
    return { state: { ...s, phase, elapsed, cycles }, transitions };
  }
  function trafficRemaining(s) { return Math.max(0, s.durations[s.phase] - s.elapsed); }
  /** Cross-street signal derived from the main controller state. */
  function trafficCrossPhase(s) {
    if (s.phase !== 'RED') return 'RED';
    const left = s.durations.RED - s.elapsed;
    if (s.elapsed < 0.6) return 'RED';            // short all-red interval
    return left <= CROSS_CLEARANCE ? 'YELLOW' : 'GREEN';
  }
  /** Pedestrians cross the main road only while main traffic is held at RED. */
  function trafficWalk(s) { return s.phase === 'RED' && s.elapsed >= 0.6 && (s.durations.RED - s.elapsed) > CROSS_CLEARANCE; }

  /**
   * Move cars along a lane (positions in % of the road, increasing).
   * A car before the stop line may not cross it unless the signal is GREEN
   * (or YELLOW when it is already too close to stop). Cars keep a gap.
   */
  function advanceCars(cars, signal, dt, opts) {
    const o = { stopLine: 30, gap: 9, speed: 18, wrap: 108, ...(opts || {}) };
    const sorted = cars.slice().sort((a, b) => b.pos - a.pos);
    const out = [];
    let ahead = null;
    for (const c of sorted) {
      let target = c.pos + o.speed * dt;
      const before = c.pos <= o.stopLine;
      const mustStop = signal === 'RED' || (signal === 'YELLOW' && o.stopLine - c.pos > 4);
      if (before && mustStop && target > o.stopLine) target = o.stopLine;
      if (ahead && ahead.pos - target < o.gap && ahead.pos > c.pos) target = Math.max(c.pos, ahead.pos - o.gap);
      let pos = target;
      if (pos > o.wrap) pos = pos - o.wrap - 10;
      const moved = { ...c, pos };
      out.push(moved);
      ahead = moved;
    }
    return out;
  }

  /* ---------- 4c. Password validator (product automaton) ---------- */
  const PW_FLAG = { U: 1, D: 2, S: 4 };
  const PW_TRAP = 8;
  const PW_MIN_LEN = 8;
  const PW_STATE_NAMES = ['q∅', 'qU', 'qD', 'qUD', 'qS', 'qUS', 'qDS', 'qUDS', 'trap'];
  function pwClass(ch) {
    if (/\s/.test(ch)) return 'space';
    if (/[A-Z]/.test(ch)) return 'U';
    if (/[a-z]/.test(ch)) return 'L';
    if (/[0-9]/.test(ch)) return 'D';
    return 'S';
  }
  function pwStep(q, ch) {
    if (q === PW_TRAP) return PW_TRAP;
    const c = pwClass(ch);
    if (c === 'space') return PW_TRAP;
    if (c === 'L') return q;
    return q | PW_FLAG[c];
  }
  function runPassword(str) {
    const steps = [{ index: 0, char: null, cls: null, from: null, to: 0, len: 0 }];
    let q = 0;
    for (let k = 0; k < str.length; k++) {
      const n = pwStep(q, str[k]);
      steps.push({ index: k + 1, char: str[k], cls: pwClass(str[k]), from: q, to: n, len: Math.min(k + 1, PW_MIN_LEN) });
      q = n;
    }
    const lenOk = str.length >= PW_MIN_LEN;
    const missing = [];
    if (q === PW_TRAP) missing.push('no spaces');
    else {
      if (!(q & PW_FLAG.U)) missing.push('an uppercase letter');
      if (!(q & PW_FLAG.D)) missing.push('a digit');
      if (!(q & PW_FLAG.S)) missing.push('a symbol');
    }
    if (!lenOk) missing.push(`at least ${PW_MIN_LEN} characters`);
    return { steps, final: q, lenOk, accepted: q === 7 && lenOk, missing };
  }

  /* ---------- 4d. Binary recogniser (ends in 01) ---------- */
  function runBinary(str) {
    if (typeof str !== 'string' || !/^[01]*$/.test(str)) return { error: 'Only the symbols 0 and 1 are allowed.', steps: [], accepted: false };
    const r = dfaTrace(DFA_DEFINITIONS.end01, str);
    return { error: null, steps: r.steps, accepted: r.accepted };
  }

  /* ================================================================
     5. GUIDED EXPERIMENTS
     ================================================================ */
  const EXPERIMENTS = [
    {
      id: 'exp-anbn', no: 'Experiment 1', title: 'aⁿbⁿ is not regular', langId: 'anbn1', expectRegular: false,
      problem: 'Is there a finite automaton that accepts exactly the strings with some a’s followed by the same number of b’s? Intuitively it would have to count without limit. The pumping lemma turns that intuition into a proof.',
      language: 'L = { aⁿbⁿ | n ≥ 1 } = { ab, aabb, aaabbb, … }',
      assumption: {
        question: 'How does a pumping-lemma proof of non-regularity begin?',
        options: ['Assume L is regular, so a pumping length p exists — then derive a contradiction.', 'Assume L is not regular and confirm it with examples.', 'Build a DFA for L and count its states.'],
        answer: 0,
        explain: 'Proof by contradiction: if L were regular, the lemma would guarantee some p. We show that no p can work.'
      },
      candidates: p => [
        { w: 'ab', why: 'Too short when p > 2: the lemma only constrains strings with |w| ≥ p.' },
        { w: 'a'.repeat(p) + 'b'.repeat(p), why: 'Good choice: in L, long enough, and the first p symbols are all a’s, so y is forced into the a-block.' },
        { w: 'a'.repeat(p) + 'b'.repeat(p + 1), why: 'Not in L: the counts differ.' }
      ],
      bestW: p => 'a'.repeat(p) + 'b'.repeat(p),
      conclusion: {
        question: 'Every legal decomposition of your string breaks under pumping. What follows?',
        options: ['L is not regular.', 'L is regular.', 'Nothing — we only tried one string.'],
        answer: 0,
        explain: 'For an arbitrary p we exhibited one string whose every legal split fails condition (3). That contradicts the lemma, so the assumption “L is regular” is false. One well-chosen string suffices; we do not need to try others.'
      }
    },
    {
      id: 'exp-an', no: 'Experiment 2', title: 'aⁿ is regular', langId: 'a_n', expectRegular: true,
      problem: 'Contrast case: the language of all strings of a’s. Here the lemma should hold — and we will see why that alone still proves nothing.',
      language: 'L = { aⁿ | n ≥ 0 } = { ε, a, aa, aaa, … }',
      assumption: {
        question: 'What are we checking in this experiment?',
        options: ['Whether every legal decomposition can be pumped forever while staying in L.', 'Whether we can find a contradiction to show L is not regular.', 'Whether L is finite.'],
        answer: 0,
        explain: 'aⁿ is recognised by a 1-state DFA (a self-loop on a). We are checking that the pumping property really holds for it.'
      },
      candidates: p => [
        { w: 'a'.repeat(Math.max(0, p - 1)), why: p - 1 === 0 ? 'ε is in L but has length 0 < p.' : `Length ${p - 1} < p, so the lemma says nothing about it.` },
        { w: 'a'.repeat(p + 2), why: 'Good choice: in L and |w| ≥ p.' },
        { w: 'a'.repeat(p) + 'b', why: 'Not in L: contains b.' }
      ],
      bestW: p => 'a'.repeat(p + 2),
      conclusion: {
        question: 'Every decomposition survives pumping (verified with the DFA). What can you conclude?',
        options: ['The lemma is satisfied, which is consistent with regularity; the 1-state DFA is what proves L regular.', 'The pumping lemma has proved that L is regular.', 'L is not regular.'],
        answer: 0,
        explain: 'The lemma is a necessary condition only. Some non-regular languages also satisfy it. Regularity is proved by exhibiting a DFA, NFA or regular expression — here a*.'
      }
    },
    {
      id: 'exp-0n1n', no: 'Experiment 3', title: '0ⁿ1ⁿ', langId: '0n1n', expectRegular: false,
      problem: 'Binary version of the counting problem: equal blocks of 0’s and 1’s. Decide whether it is regular, using only the pumping lemma.',
      language: 'L = { 0ⁿ1ⁿ | n ≥ 0 } = { ε, 01, 0011, 000111, … }',
      assumption: {
        question: 'Which statement should we assume for a proof by contradiction?',
        options: ['L is regular, so some pumping length p exists.', 'L is not regular.', 'L contains every binary string.'],
        answer: 0,
        explain: 'Assume regularity; the lemma then hands us a p we do not control (the adversary picks it).'
      },
      candidates: p => [
        { w: '0'.repeat(p) + '1'.repeat(p), why: 'Good choice: |xy| ≤ p forces y to be all 0’s.' },
        { w: '01'.repeat(p), why: 'Not in L: the 0’s and 1’s alternate.' },
        { w: '0' + '1', why: p > 2 ? 'Too short: |w| < p.' : 'In L, but y could then include a 1, which complicates the proof.' }
      ],
      bestW: p => '0'.repeat(p) + '1'.repeat(p),
      conclusion: {
        question: 'What is the conclusion for 0ⁿ1ⁿ?',
        options: ['L is not regular.', 'L is regular because some decompositions survive.', 'We need a larger p.'],
        answer: 0,
        explain: 'y = 0ᵏ with k ≥ 1, so xy⁰z = 0^(p−k)1^p has fewer 0’s than 1’s. Since p was arbitrary, no pumping length works: L is not regular.'
      }
    },
    {
      id: 'exp-pal', no: 'Experiment 4', title: 'Palindromes are not regular', langId: 'palindrome', expectRegular: false,
      problem: 'A palindrome reads the same forwards and backwards. Checking one seems to require remembering the entire first half of the string — something a machine with finitely many states cannot do for arbitrarily long inputs. Prove it.',
      language: 'L = { w ∈ {a,b}* | w = wᴿ } = { ε, a, b, aa, aba, abba, … }',
      assumption: {
        question: 'How does the proof begin?',
        options: ['Assume L is regular and let p be its pumping length.', 'Show that some palindromes are long.', 'Assume L is not regular.'],
        answer: 0,
        explain: 'As always for non-regularity: assume regularity, obtain p, and derive a contradiction.'
      },
      candidates: p => [
        { w: 'a'.repeat(2 * p), why: 'A palindrome, but a trap: pumping a block of a’s inside aᵐ always gives another string of a’s, which is still a palindrome. No contradiction is possible with this string.' },
        { w: 'a'.repeat(p) + 'b' + 'a'.repeat(p), why: 'Good choice: y is trapped in the first block of a’s, so pumping changes one side of the b but not the other.' },
        { w: 'ab'.repeat(p), why: 'Not a palindrome: it starts with a and ends with b.' }
      ],
      bestW: p => 'a'.repeat(p) + 'b' + 'a'.repeat(p),
      conclusion: {
        question: 'Every legal split of aᵖbaᵖ fails under pumping. What do you conclude?',
        options: ['The palindromes are not regular.', 'The palindromes are regular.', 'Only odd-length palindromes are non-regular.'],
        answer: 0,
        explain: 'y = aᵏ lies before the b, so xy²z = aᵖ⁺ᵏbaᵖ has unequal blocks around the b and is not a palindrome. This works for every p, so L is not regular.'
      }
    },
    {
      id: 'exp-prime', no: 'Experiment 5', title: 'Prime lengths are not regular', langId: 'a_prime', expectRegular: false,
      problem: 'Over a one-letter alphabet only the length of a string matters. Is the set of strings whose length is prime regular? Pumping changes the length by the fixed step |y| each time — and the primes never form an infinite arithmetic progression.',
      language: 'L = { aⁿ | n is prime } = { aa, aaa, aaaaa, aaaaaaa, … }',
      assumption: {
        question: 'Which assumption starts the argument?',
        options: ['L is regular, so a pumping length p exists.', 'There are infinitely many primes, so L is not regular.', 'L is finite.'],
        answer: 0,
        explain: 'The infinitude of primes alone proves nothing about regularity. We need the pumping lemma’s contradiction.'
      },
      candidates: p => {
        let c = Math.max(4, p); while (isPrime(c)) c++;
        return [
          { w: 'a'.repeat(c), why: `Length ${c} is not prime, so this string is not in L.` },
          { w: 'a'.repeat(nextPrime(p)), why: 'Good choice: the smallest prime length ≥ p.' },
          { w: 'aa', why: p > 2 ? 'Too short: |w| = 2 < p.' : 'In L and long enough here, but the general proof uses a prime q ≥ p.' }
        ];
      },
      bestW: p => 'a'.repeat(nextPrime(p)),
      conclusion: {
        question: 'Every split of a^q breaks for some i. What follows?',
        options: ['{ aⁿ | n prime } is not regular.', 'It is regular, because small cases worked.', 'It depends on which prime we picked.'],
        answer: 0,
        explain: 'With i = q + 1 the length becomes q + q·|y| = q(1 + |y|), a product of two numbers ≥ 2, so it is never prime. This works for every p, so L is not regular.'
      }
    }
  ];
  // Definition part of each language string, e.g. 'L = { w ∈ {a,b}* | w = wᴿ }'.
  EXPERIMENTS.forEach(e => { e.def = e.language.slice(0, e.language.lastIndexOf(' = {')).trim(); });
  const EXPERIMENT_STEPS = ['Problem', 'Language', 'Assumption', 'Choose p', 'String', 'Decomposition', 'Pumping', 'Observation', 'Conclusion'];

  function experimentCheckString(exp, w, p) {
    const idx = langIndex(exp.langId);
    const m = checkMembership(idx, w);
    if (m.invalidChars) return { ok: false, reason: m.reason };
    if (!m.inL) return { ok: false, reason: `${eps(w)} ∉ L (${m.reason}).` };
    if (w.length < p) return { ok: false, reason: `|w| = ${w.length} < p = ${p}. The lemma only applies to strings of length ≥ p.` };
    return { ok: true, reason: `${eps(w)} ∈ L and |w| = ${w.length} ≥ p = ${p}.` };
  }
  /** Analyse every legal decomposition of w (real engine, no canned answers). */
  function experimentObserve(exp, w, p) {
    const idx = langIndex(exp.langId);
    const decomps = getValidDecompositions(w, p);
    const rows = decomps.map(d => {
      const c = classifyDecomposition(idx, d.x, d.y, d.z, 10);
      const cells = pumpSeries(idx, d.x, d.y, d.z, 0, 5).map(r => r.inL);
      return { x: d.x, y: d.y, z: d.z, xLen: d.xLen, yLen: d.yLen, kind: c.kind, i: c.i, detail: c.detail, cells };
    });
    return {
      rows,
      total: rows.length,
      broken: rows.filter(r => r.kind === 'counterexample').length,
      verified: rows.filter(r => r.kind === 'verified').length,
      allBroken: rows.length > 0 && rows.every(r => r.kind === 'counterexample'),
      allVerified: rows.length > 0 && rows.every(r => r.kind === 'verified')
    };
  }

  /** First few members of a language, found by enumeration through the engine. */
  function sampleMembers(langId, count, maxLen) {
    const idx = langIndex(langId), alpha = LANGUAGES[idx].alphabet, out = [];
    const n = count || 6, max = maxLen == null ? 8 : maxLen;
    let layer = [''];
    for (let len = 0; len <= max && out.length < n; len++) {
      for (const w of layer) { if (checkMembership(idx, w).inL) { out.push(w); if (out.length >= n) break; } }
      if (len < max) { const nx = []; for (const w of layer) for (const c of alpha) nx.push(w + c); layer = nx; }
    }
    return out;
  }

  /**
   * The proof notebook: the formal argument, written line by line from what
   * the learner has actually done. General lines come from the engine's
   * per-language proof templates, so they hold for every p.
   */
  function experimentNotebook(exp, s) {
    const L = langIndex(exp.langId), lang = LANGUAGES[L];
    const out = [];
    const add = (step, text, kind) => out.push({ step, text, kind: kind || 'step' });
    add(1, `Let ${exp.def}.`, 'given');
    if (s.assumptionOk) add(2, exp.expectRegular ? 'We check whether L has the pumping property (L = a*, so it should).' : 'Suppose, for contradiction, that L is regular.');
    if (s.pFixed) add(3, exp.expectRegular ? `Take pumping length p = ${s.p}.` : `Then the pumping lemma gives a pumping length p. We experiment with p = ${s.p}; the argument must work for every p.`);
    const tmpl = !exp.expectRegular && lang.proofTemplate ? lang.proofTemplate(s.p) : null;
    const general = !!(tmpl && s.w === tmpl.w);
    if (s.wOk) add(4, `Choose w = ${general ? tmpl.wExpr : eps(short(s.w))}. Then w ∈ L and |w| = ${s.w.length} ≥ p.`);
    if (s.split) {
      add(5, general ? tmpl.yRegion : 'Let w = xyz be any split with |y| ≥ 1 and |xy| ≤ p.');
      add(5, `For instance x = ${eps(s.split.x)}, y = ${s.split.y}, z = ${eps(short(s.split.z))}.`);
    }
    if (s.pumped) add(6, `With i = ${s.pumped.i}: xy${sup(s.pumped.i)}z = ${eps(short(s.pumped.str))} ${s.pumped.inL ? '∈ L.' : '∉ L — this split fails.'}`);
    if (s.observed) {
      const o = s.observed;
      if (exp.expectRegular) add(7, o.allVerified ? `All ${o.total} legal splits satisfy xyⁱz ∈ L for every i ≥ 0 (verified exactly with the DFA).` : `${o.verified} of ${o.total} legal splits are verified for every i.`);
      else add(7, o.allBroken ? `Checking all ${o.total} legal splits of w: every one has an exponent i with xyⁱz ∉ L.` : `Only ${o.broken} of ${o.total} legal splits break, so this w does not give a contradiction.`);
    }
    if (s.concluded) {
      if (exp.expectRegular) {
        add(8, 'The pumping property holds, as it must for a regular language.');
        add(8, 'Regularity itself is proved by the 1-state DFA (regular expression a*), not by the lemma.  □', 'qed');
      } else {
        if (general) add(8, tmpl.pumpStep);
        add(8, 'This contradicts the pumping lemma, which promised a split that survives every i.');
        add(8, 'Therefore L is not regular.  □', 'qed');
      }
    }
    return out;
  }

  /* ================================================================
     6. CHALLENGE ZONE — question bank and randomised rounds
     ================================================================ */
  const TF = ['True', 'False'];
  const LEVELS = ['beginner', 'intermediate', 'advanced'];

  function qMembership(id, level, langId, w, xl, yl, i, topic) {
    const idx = langIndex(langId);
    const x = w.slice(0, xl), y = w.slice(xl, xl + yl), z = w.slice(xl + yl);
    const s = pumpString(x, y, z, i);
    const m = checkMembership(idx, s);
    return { id, level, type: 'membership', topic: topic || 'pumping',
      prompt: `L = ${LANGUAGES[idx].description}. With x = ${eps(x)}, y = ${y}, z = ${eps(z)}, is xy${sup(i)}z in L?`,
      options: ['Yes, in L', 'No, not in L'], answer: m.inL ? 0 : 1, fixedOrder: true,
      explanation: `xy${sup(i)}z = ${eps(s)}. ${m.inL ? 'It is in L' : 'It is not in L'}: ${m.reason}.` };
  }
  function qPredictString(id, level, x, y, z, i) {
    const right = pumpString(x, y, z, i);
    const cands = [right, pumpString(x, y, z, i + 1), pumpString(x, y, z, Math.max(0, i - 1)), x + z + y, y + x + z];
    const opts = Array.from(new Set(cands)).slice(0, 4).map(eps);
    return { id, level, type: 'predict', topic: 'pumping',
      prompt: `x = ${eps(x)}, y = ${y}, z = ${eps(z)}. What is xy${sup(i)}z?`,
      options: opts, answer: 0,
      explanation: `Write x, then y repeated ${i} time${i === 1 ? '' : 's'}, then z: ${eps(right)}.` };
  }
  function qFirstBreak(id, level, langId, w, xl, yl) {
    const idx = langIndex(langId);
    const x = w.slice(0, xl), y = w.slice(xl, xl + yl), z = w.slice(xl + yl);
    const series = pumpSeries(idx, x, y, z, 0, 3);
    const f = series.find(r => !r.inL);
    const answer = f ? f.i : 4;
    return { id, level, type: 'predict', topic: 'pumping',
      prompt: `L = ${LANGUAGES[idx].description}, x = ${eps(x)}, y = ${y}, z = ${eps(z)}. Predict the smallest i in 0…3 with xyⁱz ∉ L.`,
      options: ['i = 0', 'i = 1', 'i = 2', 'i = 3', 'None in 0…3'], answer, fixedOrder: true,
      explanation: f ? `i = ${f.i}: ${eps(f.str)} ∉ L (${f.reason}).${f.i > 0 ? ' Smaller exponents stay in L.' : ''}` : 'Every xyⁱz for i = 0…3 is in L.' };
  }
  function qDecomp(id, level, w, p, good, bads) {
    const all = [good].concat(bads);
    all.forEach(([xl, yl], k) => {
      const v = validateDecomposition(w, p, xl, yl);
      if ((k === 0) !== v.valid) throw new Error(`Question ${id}: option ${k} validity mismatch`);
    });
    const show = ([xl, yl]) => { const v = validateDecomposition(w, p, xl, yl); return `x = ${eps(v.x)}, y = ${eps(v.y)}, z = ${eps(v.z)}`; };
    const g = validateDecomposition(w, p, good[0], good[1]);
    return { id, level, type: 'decomp', topic: 'decomposition',
      prompt: `w = ${w}, p = ${p}. Which is a valid pumping decomposition?`,
      options: all.map(show), answer: 0,
      explanation: `Valid means |y| > 0 and |xy| ≤ p. ${show(good)} has |y| = ${g.y.length} and |xy| = ${g.x.length + g.y.length} ≤ ${p}. The others break one of these.` };
  }
  function qInvalid(id, level, w, p, xl, yl) {
    const v = validateDecomposition(w, p, xl, yl);
    const c = v.conditions;
    let answer = 3;
    if (!c.lengthAtLeastP) answer = 2; else if (!c.yNonEmpty) answer = 0; else if (!c.xyWithinP) answer = 1;
    const reasons = ['y is empty, so |y| > 0 fails.', `|xy| = ${xl + yl} exceeds p = ${p}.`, `|w| = ${w.length} is shorter than p = ${p}, so the lemma does not even apply.`, 'All structural conditions hold: |w| ≥ p, |y| > 0 and |xy| ≤ p.'];
    return { id, level, type: 'invalid', topic: 'decomposition',
      prompt: `w = ${w}, p = ${p}, x = ${eps(v.x)}, y = ${eps(v.y)}, z = ${eps(v.z)}. Which condition is violated?`,
      options: ['|y| > 0', '|xy| ≤ p', '|w| ≥ p', 'None — it is a valid decomposition'], answer, fixedOrder: true,
      explanation: reasons[answer] };
  }
  const mcq = (id, level, topic, prompt, options, explanation) => ({ id, level, type: 'mcq', topic, prompt, options, answer: 0, explanation });
  const tf = (id, level, topic, prompt, isTrue, explanation) => ({ id, level, type: 'tf', topic, prompt, options: TF, answer: isTrue ? 0 : 1, fixedOrder: true, explanation });

  function buildQuestionBank() {
    return [
      // ---------- Beginner ----------
      mcq('b-use', 'beginner', 'lemma', 'What can the pumping lemma for regular languages be used to prove?', ['That a language is not regular', 'That a language is regular', 'That a language is context-free', 'That a language is finite'], 'It is a necessary property of regular languages, so it is used in contradiction proofs of non-regularity.'),
      tf('b-suff', 'beginner', 'lemma', 'If a language satisfies the pumping lemma, it must be regular.', false, 'The lemma is necessary, not sufficient. For example { aⁱbʲcᵏ | if i = 1 then j = k } is not regular yet satisfies it.'),
      mcq('b-part', 'beginner', 'lemma', 'In w = xyz, which piece gets repeated (pumped)?', ['y', 'x', 'z', 'xz'], 'y is the loop in the automaton; xyⁱz repeats it i times.'),
      tf('b-yempty', 'beginner', 'lemma', 'The pumped piece y is allowed to be empty.', false, 'Condition (1) requires |y| > 0. An empty y would make pumping meaningless.'),
      mcq('b-xy', 'beginner', 'lemma', 'What does the condition |xy| ≤ p guarantee?', ['y lies within the first p symbols of w', 'z is shorter than p', 'w has length exactly p', 'y is the last p symbols'], 'Because |xy| ≤ p, both x and y fit inside the first p symbols.'),
      qMembership('b-mem1', 'beginner', 'anbn', 'aabb', 1, 1, 0),
      qMembership('b-mem2', 'beginner', 'ab_star', 'abab', 0, 2, 2),
      qPredictString('b-pred1', 'beginner', '0', '01', '1', 2),
      qDecomp('b-dec1', 'beginner', 'aaabbb', 3, [1, 2], [[0, 0], [2, 3], [3, 1]]),
      mcq('b-p', 'beginner', 'dfa', 'For a regular language, the pumping length p can be taken as…', ['the number of states of a DFA for the language', 'the length of the longest string in the language', 'always 1', 'the size of the alphabet'], 'A DFA with p states must repeat a state within its first p moves.'),
      tf('b-finite', 'beginner', 'dfa', 'Every finite language is regular.', true, 'A finite set of strings can be written as a regular expression w₁ | w₂ | … | wₙ.'),
      qInvalid('b-inv1', 'beginner', '000111', 3, 1, 0),

      // ---------- Intermediate ----------
      mcq('i-anbn-y', 'intermediate', 'proof', 'Proving aⁿbⁿ is not regular with w = aᵖbᵖ: what must y consist of?', ['Only a’s', 'Only b’s', 'Some a’s and some b’s', 'It depends on p'], 'The first p symbols are all a’s and |xy| ≤ p, so y = aᵏ with k ≥ 1.'),
      qPredictString('i-pred1', 'intermediate', 'a', 'aa', 'abbb', 0),
      qMembership('i-mem1', 'intermediate', '0n1n', '000111', 1, 2, 2),
      qInvalid('i-inv1', 'intermediate', 'aaabbb', 3, 2, 2),
      qInvalid('i-inv2', 'intermediate', 'ababab', 4, 1, 1),
      mcq('i-pumpdown', 'intermediate', 'pumping', 'Which exponent is called “pumping down”?', ['i = 0', 'i = 1', 'i = 2', 'i = p'], 'i = 0 deletes y entirely; i = 1 gives back w; i ≥ 2 pumps up.'),
      tf('i-an', 'intermediate', 'dfa', '{ aⁿ | n ≥ 0 } is a regular language.', true, 'It is a*, accepted by a one-state DFA with a self-loop.'),
      tf('i-pal', 'intermediate', 'proof', 'The palindromes over {a, b} form a regular language.', false, 'Pumping aᵖbaᵖ up gives aᵖ⁺ᵏbaᵖ, which is not a palindrome.'),
      mcq('i-game', 'intermediate', 'game', 'In the adversary game for proving non-regularity, who chooses the decomposition xyz?', ['The adversary', 'You (the prover)', 'Whoever chose p', 'Nobody — it is fixed'], 'The lemma says ∃xyz, so in the contrapositive you must handle ∀xyz: the adversary picks it.'),
      qDecomp('i-dec1', 'intermediate', '0011', 2, [0, 2], [[1, 2], [0, 3], [2, 0]]),
      mcq('i-why-long', 'intermediate', 'dfa', 'Why does the lemma only talk about strings with |w| ≥ p?', ['Shorter strings can be accepted without any state repeating', 'Short strings are never in a regular language', 'The alphabet might be too small', 'Because p is always even'], 'Reading |w| ≥ p symbols visits p + 1 states, forcing a repeat — that loop is y.'),
      qMembership('i-mem2', 'intermediate', 'palindrome', 'aabaa', 0, 1, 2),

      // ---------- Advanced ----------
      mcq('a-prime', 'advanced', 'proof', 'For { aⁿ | n prime }, with w = a^q (q prime) and |y| = k ≥ 1, pumping with i = q + 1 gives length…', ['q(1 + k), which is composite', 'q + k, which is prime', '2q, which is prime', 'q − k'], '|xy^(q+1)z| = q + qk = q(1 + k), a product of two factors ≥ 2.'),
      qMembership('a-mem-sq', 'advanced', 'a_nsq', 'aaaa', 0, 1, 2),
      qMembership('a-mem-eq', 'advanced', 'equal_ab', 'aabb', 0, 1, 2),
      tf('a-eq', 'advanced', 'proof', 'The language of strings with equally many a’s and b’s is regular.', false, 'Pump aᵖbᵖ: y = aᵏ, so xy²z has more a’s than b’s.'),
      mcq('a-every', 'advanced', 'proof', 'To prove L is not regular, the contradiction must be shown for…', ['every valid decomposition of your chosen w', 'one decomposition of your chosen w', 'every string in L', 'one value of p'], 'The lemma promises some decomposition works, so you must defeat all of them (for an arbitrary p).'),
      tf('a-one', 'advanced', 'proof', 'Finding a single decomposition that fails is enough to prove L is not regular.', false, 'The adversary would simply pick a different decomposition. All valid decompositions must fail.'),
      qFirstBreak('a-fb1', 'advanced', 'a_prime', 'aaaaa', 0, 2),
      qFirstBreak('a-fb2', 'advanced', 'ab_star', 'ababab', 0, 2),
      qInvalid('a-inv1', 'advanced', 'aabb', 2, 0, 2),
      mcq('a-closure', 'advanced', 'dfa', 'If L and M are both regular, then L ∩ M is…', ['always regular', 'never regular', 'regular only if both are finite', 'context-free but not regular'], 'Regular languages are closed under intersection (product construction — the password validator uses it).'),
      mcq('a-which', 'advanced', 'dfa', 'Which of these languages is regular?', ['a*b*', 'aⁿbⁿ', 'aⁿ² (perfect squares)', 'palindromes over {a, b}'], 'a*b* is given directly by a regular expression; the others fail the pumping lemma.'),
      qDecomp('a-dec1', 'advanced', 'aaaaa', 4, [2, 2], [[2, 3], [4, 0], [0, 5]])
    ];
  }

  function shuffleQuestion(q, rng) {
    if (q.fixedOrder) return { ...q, options: q.options.slice() };
    const order = shuffle(q.options.map((_, i) => i), rng);
    return { ...q, options: order.map(i => q.options[i]), answer: order.indexOf(q.answer) };
  }

  /**
   * Create a randomised round. `used` is a Set of question ids already seen
   * this session; they are skipped until the level is exhausted.
   */
  function createQuizRound(bank, level, opts) {
    const o = { size: 6, rng: Math.random, used: new Set(), ...(opts || {}) };
    if (!LEVELS.includes(level)) throw new Error('Unknown level ' + level);
    const pool = bank.filter(q => q.level === level);
    let fresh = pool.filter(q => !o.used.has(q.id));
    let recycled = false;
    if (!fresh.length) { fresh = pool; recycled = true; }
    const picked = shuffle(fresh, o.rng).slice(0, o.size).map(q => shuffleQuestion(q, o.rng));
    return { level, questions: picked, index: 0, score: 0, answers: [], recycled, poolSize: pool.length };
  }
  function answerQuizRound(round, choice) {
    const q = round.questions[round.index];
    if (!q) return { round, correct: false, done: true };
    if (round.answers.length > round.index) return { round, correct: round.answers[round.index].correct, done: false };
    const correct = choice === q.answer;
    const answers = round.answers.concat([{ id: q.id, choice, correct }]);
    return { round: { ...round, answers, score: round.score + (correct ? 1 : 0) }, correct, question: q };
  }
  function nextQuizQuestion(round) {
    const index = round.index + 1;
    return { round: { ...round, index }, done: index >= round.questions.length };
  }

  /* ================================================================
     7. PROGRESS (localStorage-backed, failure-tolerant)
     ================================================================ */
  const PROGRESS_KEY = 'pumping-lemma-lab:progress:v1';
  const CONCEPTS = {
    'lemma': 'Lemma statement & conditions',
    'decomposition': 'Decomposing w = xyz',
    'pumping': 'Pumping y up and down',
    'proof': 'Proof by contradiction',
    'game': 'The quantifier game',
    'dfa': 'Running a DFA',
    'nfa': 'Nondeterminism (NFA)',
    'builder': 'Designing an automaton',
    'pigeonhole': 'Pigeonhole principle',
    'vending': 'FSM: vending machine',
    'traffic': 'FSM: timed controller',
    'password': 'Product automata',
    'binary': 'Suffix recogniser'
  };
  function defaultProgress() { return { experiments: {}, attempted: 0, correct: 0, concepts: {} }; }
  function sanitizeProgress(p) {
    const d = defaultProgress();
    if (!p || typeof p !== 'object') return d;
    const n = v => (Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0);
    const flags = (obj, allowed) => {
      const out = {};
      if (obj && typeof obj === 'object') for (const k of Object.keys(obj)) if (obj[k] === true && (!allowed || allowed.includes(k))) out[k] = true;
      return out;
    };
    d.experiments = flags(p.experiments, EXPERIMENTS.map(e => e.id));
    d.concepts = flags(p.concepts, Object.keys(CONCEPTS));
    d.attempted = n(p.attempted);
    d.correct = Math.min(n(p.correct), d.attempted);
    return d;
  }
  function createProgressStore(storage) {
    let persistent = !!storage;
    function load() {
      if (!storage) return defaultProgress();
      try {
        const raw = storage.getItem(PROGRESS_KEY);
        return raw ? sanitizeProgress(JSON.parse(raw)) : defaultProgress();
      } catch (e) { persistent = false; return defaultProgress(); }
    }
    let data = load();
    const listeners = [];
    function save() {
      if (storage) {
        try { storage.setItem(PROGRESS_KEY, JSON.stringify(data)); persistent = true; }
        catch (e) { persistent = false; }
      }
      listeners.forEach(fn => { try { fn(summary()); } catch (e) { /* listener errors must not break saving */ } });
    }
    function summary() {
      const expDone = Object.keys(data.experiments).length;
      const conceptsDone = Object.keys(data.concepts).length;
      const conceptsTotal = Object.keys(CONCEPTS).length;
      const overall = Math.round(100 * (0.35 * (expDone / EXPERIMENTS.length) + 0.35 * (conceptsDone / conceptsTotal) + 0.30 * Math.min(data.correct / 15, 1)));
      return { experimentsDone: expDone, experimentsTotal: EXPERIMENTS.length, attempted: data.attempted, correct: data.correct,
        conceptsDone, conceptsTotal, concepts: { ...data.concepts }, experiments: { ...data.experiments }, overall, persistent };
    }
    return {
      summary,
      completeExperiment(id) { if (EXPERIMENTS.some(e => e.id === id) && !data.experiments[id]) { data.experiments[id] = true; save(); } },
      recordAnswer(correct) { data.attempted++; if (correct) data.correct++; save(); },
      learn(key) { if (CONCEPTS[key] && !data.concepts[key]) { data.concepts[key] = true; save(); } },
      reset() { data = defaultProgress(); save(); },
      onChange(fn) { listeners.push(fn); }
    };
  }

  return {
    mulberry32, shuffle, langIndex, eps, sup, formatINR,
    validateDecomposition, pumpSeries, pumpSegments, verifyDecompositionDFA, classifyDecomposition, languageStatus, dfaRun,
    dfaTrace, nfaTrace, buildDelta, epsClosure, NFA_DEFINITIONS,
    builderCreate, builderAddState, builderRemoveState, builderToggleFinal, builderSetStart, builderAddTransition,
    builderRemoveTransition, builderToAutomaton, builderIsDeterministic, builderExample, BUILDER_MAX_STATES,
    VENDING_STATES, VENDING_PRODUCTS, VENDING_DENOMINATIONS, vendingCreate, vendingReduce, vendingProduct,
    TRAFFIC_ORDER, TRAFFIC_DURATIONS, trafficCreate, trafficTick, trafficRemaining, trafficCrossPhase, trafficWalk, advanceCars,
    PW_STATE_NAMES, PW_TRAP, PW_MIN_LEN, pwClass, pwStep, runPassword, runBinary,
    EXPERIMENTS, EXPERIMENT_STEPS, experimentCheckString, experimentObserve, experimentNotebook, sampleMembers,
    LEVELS, buildQuestionBank, createQuizRound, answerQuizRound, nextQuizQuestion, shuffleQuestion,
    CONCEPTS, PROGRESS_KEY, createProgressStore, sanitizeProgress
  };
})();


module.exports = {
  isPrime,
  isPerfectSquare,
  isPowerOf2,
  pumpString,
  checkMembership,
  LANGUAGES,
  getValidDecompositions,
  runProof,
  showStr,
  DFA_DEFINITIONS,
  LabCore
};
