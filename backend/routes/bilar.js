import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  console.log('GET /bilar träffad');
  res.json([
    { _id: "1", brand: "Volvo", model: "XC60", year: 2020, price: 350000 },
    { _id: "2", brand: "BMW", model: "320i", year: 2019, price: 290000 },
    { _id: "3", brand: "Audi", model: "A4", year: 2021, price: 330000 }
  ]);
});

export default router;
