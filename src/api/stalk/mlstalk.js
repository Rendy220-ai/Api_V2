async function mlStalk(id) {
  // Ini dummy Mobile Legends
  return {
    id,
    nickname: "DummyMLPlayer",
    level: 69,
    rank: "Mythic",
    stars: 23,
    avatar: "https://example.com/avatar-ml.png"
  };
}

module.exports = function(app) {
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
};
