const twilio = require('twilio');

function getClient() {
  return twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

async function sendWhatsApp(to, message) {
  if (!to) return;
  try {
    await getClient().messages.create({
      from: 'whatsapp:' + process.env.TWILIO_WHATSAPP_FROM,
      to:   'whatsapp:' + to,
      body: message,
    });
    console.log('WhatsApp sent to ' + to);
  } catch (err) {
    console.error('WhatsApp failed:', err.message);
  }
}

function morningMessage(hunterName, quests) {
  const lines = quests.map(q =>
    '  - ' + q.name + ' [' + q.domain.toUpperCase() + '] - ' + q.baseXp + ' XP'
  ).join('\n');
  return 'GOOD MORNING ' + hunterName + '!\n\nYour quests for today:\n' + lines +
    '\n\nComplete early for +25% XP\nAfter cutoff = 50% XP\nMiss all = PENALTY ZONE\n\nRise and grind, Hunter.';
}

function questReminderMessage(hunterName, questName, domain, xp, minutesLeft) {
  const warning = minutesLeft <= 15
    ? 'WARNING: Cutoff approaching! XP will be halved.'
    : 'Complete before your cutoff for full XP.';
  return 'SYSTEM REMINDER\n\nHunter ' + hunterName + ',\nYour quest is waiting:\n\n"' +
    questName + '"\nDomain: ' + domain.toUpperCase() +
    '\nXP: ' + xp + ' | Time left: ' + minutesLeft + ' min\n\n' + warning;
}

function penaltyMessage(hunterName, missedQuests) {
  const lines = missedQuests.map(q => '  - ' + q.name).join('\n');
  return 'PENALTY ZONE ACTIVATED\n\nHunter ' + hunterName + ', you failed yesterday:\n' + lines +
    '\n\nConsequences:\n  - All stats -3\n  - Streaks reset\n  - Penalty quests assigned\n\nDo not let this happen again.';
}

function weeklyReportMessage(hunterName, rank, personal, fitness, academic) {
  const comment = rank === 'S' ? 'Exceptional week. S-Rank maintained!'
    : rank === 'A' ? 'Strong week. Push harder for S-Rank.'
    : rank === 'B' ? 'Decent week. Consistency needs work.'
    : 'Poor performance detected. The System demands more.';
  return 'WEEKLY PERFORMANCE REPORT\n\nHunter: ' + hunterName +
    '\nOverall Rank: ' + rank + '-RANK\n\nDomain Scores:\n' +
    '  Personal:  ' + personal + '%\n' +
    '  Fitness:   ' + fitness + '%\n' +
    '  Academic:  ' + academic + '%\n\n' + comment;
}

module.exports = {
  sendWhatsApp,
  morningMessage,
  questReminderMessage,
  penaltyMessage,
  weeklyReportMessage,
};