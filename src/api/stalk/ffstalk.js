async function ffStalk(id) {
  // Ini dummy Free Fire
  return {
    id,
    nickname: "DummyFFPlayer",
    level: 85,
    rank: "Heroic",
    battlePoints: 5321,
    avatar: "https://example.com/avatar-ff.png"
  };
}

module.exports = function(app) {
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
};
