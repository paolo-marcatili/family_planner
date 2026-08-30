/** Family Planner Apps Script ingestion bridge. Public repository: no secrets here. */
const FP_MARKER = 'X-FAMILY-PLANNER-PROPOSAL';
const SCHEMA_VERSION = '1.0';
const MAX_BODY_BYTES = 200000;
const MAX_PROPOSALS = 200;

function setupFamilyPlannerBridge() {
  const properties = PropertiesService.getScriptProperties();
  if (!properties.getProperty('FP_INGEST_TOKEN')) properties.setProperty('FP_INGEST_TOKEN', Utilities.getUuid() + Utilities.getUuid());
  if (!properties.getProperty('FP_PROPOSAL_CALENDAR_ID')) {
    const calendar = CalendarApp.createCalendar('Family Planner Proposal Inbox', { summary: 'Unapproved proposals from the Family Planner ingestion bridge.' });
    properties.setProperty('FP_PROPOSAL_CALENDAR_ID', calendar.getId());
  }
  return { proposal_calendar_id: properties.getProperty('FP_PROPOSAL_CALENDAR_ID'), token: properties.getProperty('FP_INGEST_TOKEN') };
}

function rotateFamilyPlannerToken() {
  const token = Utilities.getUuid() + Utilities.getUuid();
  PropertiesService.getScriptProperties().setProperty('FP_INGEST_TOKEN', token);
  return token;
}

function doGet() {
  return jsonResponse_({ ok: true, service: 'family-planner-ingestion', schema_version: SCHEMA_VERSION });
}

function doPost(event) {
  try {
    const body = event && event.postData && event.postData.contents;
    if (!body || body.length > MAX_BODY_BYTES) throw new Error('Missing or oversized request body.');
    const request = JSON.parse(body);
    authenticate_(request.auth);
    validateRequestId_(request.request_id);
    const payload = validatePayload_(request.payload);
    const calendar = CalendarApp.getCalendarById(PropertiesService.getScriptProperties().getProperty('FP_PROPOSAL_CALENDAR_ID'));
    if (!calendar) throw new Error('Proposal calendar is not configured. Run setupFamilyPlannerBridge().');
    const result = payload.proposals.map(function (proposal) { return stageProposal_(calendar, request.request_id, payload, proposal); });
    return jsonResponse_({ ok: true, request_id: request.request_id, schema_version: SCHEMA_VERSION, staged: result.filter(function (item) { return item.status === 'created'; }).length, duplicates: result.filter(function (item) { return item.status === 'duplicate'; }).length, proposals: result });
  } catch (error) {
    return jsonResponse_({ ok: false, error: String(error && error.message ? error.message : error) });
  }
}

function authenticate_(auth) {
  const expected = PropertiesService.getScriptProperties().getProperty('FP_INGEST_TOKEN');
  if (!expected || !auth || !auth.token || !constantTimeEqual_(String(auth.token), expected)) throw new Error('Unauthorized.');
}

function constantTimeEqual_(provided, expected) {
  if (provided.length !== expected.length) return false;
  let result = 0;
  for (let i = 0; i < provided.length; i += 1) result |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  return result === 0;
}

function validateRequestId_(requestId) {
  if (typeof requestId !== 'string' || !/^[A-Za-z0-9._:-]{8,128}$/.test(requestId)) throw new Error('Invalid request_id.');
}

function validatePayload_(payload) {
  if (!payload || payload.schema_version !== SCHEMA_VERSION) throw new Error('Unsupported schema_version.');
  if (payload.timezone !== 'Europe/Copenhagen') throw new Error('Unsupported timezone.');
  if (!Array.isArray(payload.proposals) || payload.proposals.length > MAX_PROPOSALS) throw new Error('Invalid proposal list.');
  const ids = {};
  payload.proposals.forEach(function (proposal, index) {
    if (!proposal || typeof proposal.external_id !== 'string' || !/^[A-Za-z0-9._:-]+$/.test(proposal.external_id)) throw new Error('Invalid external_id at proposal ' + index + '.');
    if (ids[proposal.external_id]) throw new Error('Duplicate external_id: ' + proposal.external_id);
    ids[proposal.external_id] = true;
    if (proposal.status !== 'proposed') throw new Error('Every imported item must be proposed.');
    if (['event', 'task', 'work_day', 'work_block'].indexOf(proposal.type) < 0) throw new Error('Invalid proposal type.');
  });
  return payload;
}

function stageProposal_(calendar, requestId, payload, proposal) {
  const fingerprint = [requestId, proposal.external_id, proposal.type, proposal.date || '', proposal.start || '', proposal.end || ''].join('|');
  const marker = JSON.stringify({ marker: FP_MARKER, version: SCHEMA_VERSION, request_id: requestId, external_id: proposal.external_id, fingerprint: fingerprint, proposal: proposal });
  const weekStart = new Date(payload.week_start + 'T00:00:00');
  const rangeEnd = new Date(weekStart.getTime() + 35 * 24 * 60 * 60 * 1000);
  const duplicate = calendar.getEvents(weekStart, rangeEnd).some(function (event) { return event.getDescription().indexOf('"fingerprint":"' + fingerprint + '"') >= 0; });
  if (duplicate) return { external_id: proposal.external_id, status: 'duplicate' };
  const title = '[PROPOSAL] ' + (proposal.title || proposal.type);
  const description = 'Unapproved Family Planner proposal. Review in the app before promotion.\n\n--- FAMILY PLANNER PROPOSAL ---\n' + marker + '\n--- END FAMILY PLANNER PROPOSAL ---';
  let event;
  if (proposal.start && proposal.end) event = calendar.createEvent(title, new Date(proposal.start), new Date(proposal.end), { description: description });
  else event = calendar.createAllDayEvent(title, proposal.date ? new Date(proposal.date + 'T12:00:00') : weekStart, { description: description });
  return { external_id: proposal.external_id, status: 'created', proposal_event_id: event.getId() };
}

function jsonResponse_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
