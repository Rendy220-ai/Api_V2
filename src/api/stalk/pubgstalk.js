async function pubgStalk(id) {
  // Ini dummy PUBG
  return {
    id,
    nickname: "DummyPUBGPlayer",
    level: 60,
    tier: "Ace",
    kdRatio: 4.2,
    avatar: "https://example.com/avatar-pubg.png"
  };
}

module.exports = function(app) {
  app.get('/stalk/pubg', async (req, res) => {
    const { id } = req.query;
    if (!id) return res.json({ status: false, message: 'Masukkan ID PUBG' });
    try {
      const data = await pubgStalk(id);
      res.json({ status: true, result: data });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  });
};
