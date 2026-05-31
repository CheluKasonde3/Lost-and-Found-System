const pool = require('./db');
pool.query("UPDATE items SET category='bags' WHERE LOWER(category)='bag'")
  .then(res => {
    console.log('updated', res.rowCount);
    return pool.query("SELECT category, COUNT(*) FROM items GROUP BY category ORDER BY category");
  })
  .then(res => {
    console.log(JSON.stringify(res.rows));
    pool.end();
  })
  .catch(err => {
    console.error(err);
    pool.end();
    process.exit(1);
  });
