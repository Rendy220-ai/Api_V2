async function ffStalk(id) {
  try {
    if (!id) throw new Error('ID tidak ditemukan.');

    // data generator
    const levels = [45, 50, 60, 75, 80];
    const ranks = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Heroic', 'Grandmaster'];

    const data = {
      nickname: `Player_${id}`,
      level: levels[Math.floor(Math.random() * levels.length)],
      rank: ranks[Math.floor(Math.random() * ranks.length)],
      kdRatio: (Math.random() * 5).toFixed(2),
      matchesPlayed: Math.floor(Math.random() * 10000),
      winRate: `${Math.floor(Math.random() * 100)}%`,
      server: "SEA",
      message: "Data ini hanya dummy Free Fire!"
    };

    return data;
  } catch (e) {
    throw new Error('Gagal mengambil data Free Fire');
  }
}

module.exports = function (app) {
  app.get('/stalk/ff', async (req, res) => {
    const { id } = req.query;
    if (!id) return res.json({ status: false, message: 'Masukkan ID Free Fire' });

    try {
      const data = await ffStalk(id);
      res.json({ status: true, result: data });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  });
                              }
