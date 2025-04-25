const axios = require('axios')

async function pubgStalk(id) {
  try {
    const res = await axios.get(`https://api.lolhuman.xyz/api/stalk/pubg?id=${id}&apikey=b0fc710213e294feaea4873c`)
    return res.data
  } catch (e) {
    throw new Error('Gagal mengambil data PUBG')
  }
}

module.exports = function (app) {
  app.get('/stalk/pubg', async (req, res) => {
    const { id } = req.query
    if (!id) return res.json({ status: false, message: 'Masukkan ID PUBG' })
    try {
      const data = await pubgStalk(id)
      res.json({ status: true, result: data })
    } catch (err) {
      res.status(500).json({ status: false, message: err.message })
    }
  })
}