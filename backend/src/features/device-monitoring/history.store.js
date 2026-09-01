// In-memory rolling history of online node count.
// Takes a snapshot every 5 seconds, keeps last 60 (5 minutes of data).

const MAX_SNAPSHOTS = 60;
const history = [];

function recordSnapshot(onlineCount, totalCount) {
  history.push({
    time: new Date().toISOString(),
    online: onlineCount,
    total: totalCount,
  });
  if (history.length > MAX_SNAPSHOTS) {
    history.shift();
  }
}

function getHistory() {
  return [...history];
}

module.exports = { recordSnapshot, getHistory };
