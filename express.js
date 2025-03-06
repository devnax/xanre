const express = (app) => {
   app.use('/api/*', (req, res) => {
      res.json({ message: 'Hello World' });
   });
}


export default express