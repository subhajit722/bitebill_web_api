import mysql from 'mysql';
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Deadpool6@',
    database: 'bytebill'
  });

  db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Database connection successful!');
});


  export default db