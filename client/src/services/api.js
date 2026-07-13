import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export async function generateParser(grammar, type = 'slr1') {
  const { data } = await api.post('/generate', { grammar, type });
  return data;
}

export async function parseString(input, actionTable, gotoTable, numberedProductions, terminals, extra = {}) {
  const payload = {
    input,
    actionTable,
    gotoTable,
    numberedProductions,
    terminals,
    ...extra,
    type: extra.type || 'slr1',
  };
  const { data } = await api.post('/parse', payload);
  return data;
}
