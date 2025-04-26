async function pubgStalk(id) {
  try {
    if (!id) throw new Error('ID tidak ditemukan.');

    const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Crown', 'Ace', 'Conqueror'];

    const data = {
      nickname: `PUBG_Player_${id}`,
      level: Math.floor(Math.random() * 100) + 1,
      tier: tiers[Math.floor(Math.random() * tiers.length)],
      matchesPlayed: Math.floor(Math.random() * 10000),
      kdRatio: (Math.random() * 5).toFixed(2),
      winRate: `${Math.floor(Math.random() * 100)}%`,
      server: "Asia",
      message: "Data ini hanya dummy PUBG!"
    };

    return data;
  } catch (e) {
    throw new Error('Gagal mengambil data PUBG');
  }
}

module.exports = function (app) {
  app.get('/stalk/pubg', async (req, res) => {
    const { id } = req.query;
    if (!id) return res.json({ status: false, message: 'Masukkan ID PUBG');

    try {
      const data = await pubgStalk(id);
      res.json({ status: true, result: data });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  });
}
