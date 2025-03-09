import XanreqServer from "./src/server";

const xanserver = new XanreqServer({
   secret: "secret",
});

xanserver.get('/api/hello', (req, res) => {
   res.json({ message: 'Hello World' });
})

const express = (app) => {
   app.use('/api/*', async (req, res) => {
      const response = await xanserver.listen(req.path, req.method, req.body);
      res.status(response.status).json(response);
   });
}

export default express