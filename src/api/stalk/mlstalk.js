const axios = require('axios')

async function mlStalk(id) {
  try {
    if (!id) throw new Error('ID tidak ditemukan.');

    const tiers = ['Warrior', 'Elite', 'Master', 'Grandmaster', 'Epic', 'Legend', 'Mythic', 'Mythical Glory'];
    const heroes = ['Alucard', 'Fanny', 'Gusion', 'Lancelot', 'Ling', 'Hayabusa', 'Lesley', 'Granger'];

    const data = {
      nickname: `ML_Player_${id}`,
      level: Math.floor(Math.random() * 100) + 1,
      tier: tiers[Math.floor(Math.random() * tiers.length)],
      favoriteHero: heroes[Math.floor(Math.random() * heroes.length)],
      matchesPlayed: Math.floor(Math.random() * 5000),
      winRate: `${Math.floor(Math.random() * 100)}%`,
      server: "SEA",
      message: "Data ini hanya dummy Mobile Legends!"
    };

    return data;
  } catch (e) {
    throw new Error('Gagal mengambil data Mobile Legends');
  }
}

module.exports = function (app) {
  app.get('/stalk/ml', async (req, res) => {
    const { id } = req.query;
    if (!id) return res.json({ status: false, message: 'Masukkan ID Mobile Legends' });

    try {
      const data = await mlStalk(id);
      res.json({ status: true, result: data });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  });
}
