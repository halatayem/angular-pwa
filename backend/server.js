import express from 'express';
import cors from 'cors';

import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import bilarRouter from './routes/bilar.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/bilar', bilarRouter);

app.listen(PORT, () => {
  console.log(`Server körs på http://localhost:${PORT}`);
});