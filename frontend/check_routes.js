(async ()=>{
  const routes = ['/', '/login', '/signup', '/dashboard', '/analytics/test'];
  for (const p of routes) {
    try {
      const res = await fetch('http://localhost:5174' + p);
      console.log(p, res.status);
    } catch (e) {
      console.log(p, 'ERROR', e.message);
    }
  }
})();
