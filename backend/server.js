const express = require('express');
const cors = require('cors');
const engine = require('./engine');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Helper to resolve language by id or index
function findLanguageIndex(langIdOrIndex) {
  if (typeof langIdOrIndex === 'number' && langIdOrIndex >= 0 && langIdOrIndex < engine.LANGUAGES.length) {
    return langIdOrIndex;
  }
  const idx = engine.LANGUAGES.findIndex(l => l.id === String(langIdOrIndex));
  return idx !== -1 ? idx : 0;
}

// 1. Health check & metadata
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'Automata Theory & Pumping Lemma Lab Backend API',
    version: '1.0.0',
    documentation: {
      health: 'GET /api/health',
      languages: 'GET /api/languages',
      checkMembership: 'POST /api/check-membership',
      decompositions: 'POST /api/decompositions',
      pump: 'POST /api/pump',
      validateDecomposition: 'POST /api/validate-decomposition',
      dfaTrace: 'POST /api/dfa-trace',
      nfaTrace: 'POST /api/nfa-trace',
      quizRound: 'GET /api/quiz-round'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    languagesLoaded: engine.LANGUAGES.length
  });
});

// 2. Language list
app.get('/api/languages', (req, res) => {
  const list = engine.LANGUAGES.map((l, index) => ({
    index,
    id: l.id,
    name: l.name,
    desc: l.desc,
    alphabet: l.alphabet,
    isRegular: l.isRegular,
    pSuggested: l.pSuggested,
    exampleW: l.exampleW,
    proofStrategy: l.proofStrategy
  }));
  res.json({ languages: list });
});

// 3. Check language membership
app.post('/api/check-membership', (req, res) => {
  const { lang, w } = req.body;
  if (typeof w !== 'string') {
    return res.status(400).json({ error: 'String "w" is required' });
  }
  const langIndex = findLanguageIndex(lang);
  const result = engine.checkMembership(langIndex, w);
  res.json({
    language: engine.LANGUAGES[langIndex].name,
    langId: engine.LANGUAGES[langIndex].id,
    w,
    ...result
  });
});

// 4. Valid decompositions
app.post('/api/decompositions', (req, res) => {
  const { w, p } = req.body;
  if (!w || !p) {
    return res.status(400).json({ error: 'String "w" and integer "p" are required' });
  }
  const decomps = engine.getValidDecompositions(String(w), parseInt(p, 10));
  res.json({
    w,
    p: parseInt(p, 10),
    count: decomps.length,
    decompositions: decomps
  });
});

// 5. Pumping series
app.post('/api/pump', (req, res) => {
  const { lang, x = '', y = '', z = '', maxI = 5 } = req.body;
  const langIndex = findLanguageIndex(lang);
  const series = engine.LabCore.pumpSeries(langIndex, String(x), String(y), String(z), 0, parseInt(maxI, 10));
  const classification = engine.LabCore.classifyDecomposition(langIndex, String(x), String(y), String(z), parseInt(maxI, 10));
  res.json({
    langId: engine.LANGUAGES[langIndex].id,
    decomposition: { x, y, z },
    classification,
    series
  });
});

// 6. Decomposition validation
app.post('/api/validate-decomposition', (req, res) => {
  const { w, p, xLen, yLen } = req.body;
  if (w === undefined || p === undefined || xLen === undefined || yLen === undefined) {
    return res.status(400).json({ error: 'w, p, xLen, and yLen are required' });
  }
  const validation = engine.LabCore.validateDecomposition(String(w), parseInt(p, 10), parseInt(xLen, 10), parseInt(yLen, 10));
  res.json(validation);
});

// 7. DFA trace
app.post('/api/dfa-trace', (req, res) => {
  const { dfaId, input = '' } = req.body;
  const dfa = engine.DFA_DEFINITIONS[dfaId];
  if (!dfa) {
    return res.status(404).json({ error: `DFA "${dfaId}" not found. Available: ${Object.keys(engine.DFA_DEFINITIONS).join(', ')}` });
  }
  const trace = engine.LabCore.dfaTrace(dfa, String(input));
  res.json(trace);
});

// 8. NFA trace
app.post('/api/nfa-trace', (req, res) => {
  const { nfaId, input = '' } = req.body;
  const nfa = engine.LabCore.NFA_DEFINITIONS[nfaId];
  if (!nfa) {
    return res.status(404).json({ error: `NFA "${nfaId}" not found. Available: ${Object.keys(engine.LabCore.NFA_DEFINITIONS).join(', ')}` });
  }
  const trace = engine.LabCore.nfaTrace(nfa, String(input));
  res.json(trace);
});

// 9. Challenge zone quiz round
const BANK = engine.LabCore.buildQuestionBank();
app.get('/api/quiz-round', (req, res) => {
  const level = req.query.level || 'intermediate';
  const round = engine.LabCore.createQuizRound(BANK, level);
  res.json(round);
});

app.listen(PORT, () => {
  console.log(`Automata API server running on port ${PORT}`);
});

