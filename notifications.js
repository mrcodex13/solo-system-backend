const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendWhatsApp(to, message) {
  if (!to) return;
  try {
    await client.messages.create({
      from: 'whatsapp:' + process.env.TWILIO_WHATSAPP_FROM,
      to:   'whatsapp:' + to,
      body: message,
    });
    console.log(`◈ WhatsApp sent to ${to}`);
  } catch (err) {
    console.error(`◈ WhatsApp failed:`, err.message);
  }
}

function morningMessage(hunterName, quests) {
  const lines = quests.map(q =>
    `  • ${q.name} [${q.domain.toUpperCase()}] — ${q.baseXp} XP`
  ).join('\n');
  return `◈ SYSTEM — GOOD MORNING *${hunterName}*!

Your quests for today:
${lines}

⚡ Complete 1hr early = +25% XP
⚠ After cutoff = 50% XP only
☠ Miss all = PENALTY ZONE

Rise and grind, Hunter.`;
}

function questReminderMessage(hunterName, questName, domain, xp, minutesLeft) {
  return `🔔 SYSTEM REMINDER

Hunter *${hunterName}*,
Your quest is waiting:

*"${questName}"*
Domain: ${domain.toUpperCase()}
XP: ${xp} | Time left: *${minutesLeft} min*

${minutesLeft <= 15
  ? '⚠ WARNING: Cutoff approaching! XP will be halved if not completed in time.'
  : 'Complete before your cutoff for full XP.'}`;
}

function penaltyMessage(hunterName, missedQuests) {
  const lines = missedQuests.map(q => `  ☠ ${q.name}`).join('\n');
  return `☠ PENALTY ZONE ACTIVATED

Hunter *${hunterName}*, you failed yesterday:
${lines}

Consequences:
  • All stats -3
  • Streaks reset for missed domains
  • Penalty quests assigned

Do not let this happen again.`;
}

function weeklyReportMessage(hunterName, rank, personal, fitness, academic) {
  return `◈ WEEKLY PERFORMANCE REPORT

Hunter: *${hunterName}*
Overall Rank: *${rank}-RANK*

📊 Domain Scores:
  🔵 Personal:  ${personal}%
  🟢 Fitness:   ${fitness}%
  🟣 Academic:  ${academic}%

${rank === 'S' ? '🏆 Exceptional week, Hunter. S-Rank maintained!'
  : rank === 'A' ? '⭐ Strong week. Push harder for S-Rank.'
  : rank === 'B' ? '📈 Decent week. Consistency needs work.'
  : '⚠ Poor performance detected. The System demands more.'}

Review your quests and set goals for next week.`;
}

module.exports = {
  sendWhatsApp,
  morningMessage,
  questReminderMessage,
  penaltyMessage,
  weeklyReportMessage,
};