const cron = require('node-cron');
const Hunter = require('./models/Hunter');
const {
  sendWhatsApp,
  morningMessage,
  questReminderMessage,
  penaltyMessage,
  weeklyReportMessage,
} = require('./notifications');

function getDomainScore(quests, domain) {
  const qs = quests.filter(q => q.domain === domain && !q.isPenalty);
  if (!qs.length) return 0;
  const done = qs.filter(q => q.done).length;
  return Math.round((done / qs.length) * 100);
}

function getOverallRank(personal, fitness, academic) {
  const avg = Math.round((personal + fitness + academic) / 3);
  if (avg >= 90) return 'S';
  if (avg >= 75) return 'A';
  if (avg >= 55) return 'B';
  if (avg >= 35) return 'C';
  if (avg >= 15) return 'D';
  return 'E';
}

function startScheduler() {

  // ── 1. MORNING REMINDER — every day at 6:00 AM ──────────────
  cron.schedule('0 6 * * *', async () => {
    console.log('◈ Running 6AM morning reminders...');
    try {
      const hunters = await Hunter.find({ phone: { $exists: true, $ne: '' } });
      for (const hunter of hunters) {
        const pendingQuests = (hunter.quests || []).filter(q => !q.done && !q.isPenalty);
        if (!pendingQuests.length) continue;
        const msg = morningMessage(hunter.hunterName, pendingQuests);
        await sendWhatsApp(hunter.phone, msg);
      }
    } catch (err) {
      console.error('◈ Morning reminder error:', err.message);
    }
  }, { timezone: 'Asia/Kolkata' }); // change to your timezone


  // ── 2. PER-QUEST REMINDERS — check every minute ──────────────
  // Fires for any quest whose reminderTime matches current time
  cron.schedule('* * * * *', async () => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    try {
      const hunters = await Hunter.find({ phone: { $exists: true, $ne: '' } });
      for (const hunter of hunters) {
        const pendingQuests = (hunter.quests || []).filter(q =>
          !q.done && !q.isPenalty && q.reminderTime === currentTime
        );
        for (const quest of pendingQuests) {
          // Calculate minutes left until cutoff
          const [ch, cm] = (hunter.cutoff || '22:00').split(':').map(Number);
          const cutoffTotal = ch * 60 + cm;
          const nowTotal = now.getHours() * 60 + now.getMinutes();
          const minsLeft = cutoffTotal - nowTotal;
          const msg = questReminderMessage(
            hunter.hunterName,
            quest.name,
            quest.domain,
            quest.baseXp,
            minsLeft
          );
          await sendWhatsApp(hunter.phone, msg);
        }
      }
    } catch (err) {
      console.error('◈ Quest reminder error:', err.message);
    }
  });


  // ── 3. PENALTY CHECK — every day at 11:59 PM ─────────────────
  cron.schedule('59 23 * * *', async () => {
    console.log('◈ Running end-of-day penalty check...');
    try {
      const hunters = await Hunter.find({ phone: { $exists: true, $ne: '' } });
      const today = new Date().toDateString();
      for (const hunter of hunters) {
        if (hunter.lastQuestDate === today) {
          const missed = (hunter.quests || []).filter(q => !q.done && !q.isPenalty);
          if (missed.length > 0) {
            const msg = penaltyMessage(hunter.hunterName, missed);
            await sendWhatsApp(hunter.phone, msg);
          }
        }
      }
    } catch (err) {
      console.error('◈ Penalty check error:', err.message);
    }
  }, { timezone: 'Asia/Kolkata' });


  // ── 4. WEEKLY REPORT — every Sunday at 8:00 PM ───────────────
  cron.schedule('0 20 * * 0', async () => {
    console.log('◈ Running weekly performance reports...');
    try {
      const hunters = await Hunter.find({ phone: { $exists: true, $ne: '' } });
      for (const hunter of hunters) {
        const quests = hunter.quests || [];
        const personal  = getDomainScore(quests, 'personal');
        const fitness   = getDomainScore(quests, 'fitness');
        const academic  = getDomainScore(quests, 'academic');
        const rank = getOverallRank(personal, fitness, academic);
        const msg = weeklyReportMessage(
          hunter.hunterName, rank, personal, fitness, academic
        );
        await sendWhatsApp(hunter.phone, msg);
      }
    } catch (err) {
      console.error('◈ Weekly report error:', err.message);
    }
  }, { timezone: 'Asia/Kolkata' });

  console.log('◈ Scheduler started — all cron jobs active');
}

module.exports = { startScheduler };