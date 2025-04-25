const axios = require('axios')

async function mlStalk(id, zone) {
  try {
    const res = await axios.get(`https://api.lolhuman.xyz/api/stalk/ml?id=${id}&zone=${zone}&apikey=b0fc710213e294feaea4873c`)
    return res.data
  } catch (e) {
    throw new Error('Gagal mengambil data Mobile Legends')
  }
}

module.exports = function (app) {
  app.get('/stalk/ml', async (req, res) => {
    const { id, zone } = req.query
    if (!id || !zone) return res.json({ status: false, message: 'Masukkan ID dan Zone ML' })
    try {
      const data = await mlStalk(id, zone)
      res.json({ status: true, result: data })
    } catch (err) {
      res.status(500).json({ status: false, message: err.message })
    }
  })
}