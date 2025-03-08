import XanreqServer from "./src/server";

const xanserver = new XanreqServer();

const express = (app) => {
   app.use('/api/*', (req, res) => {
      const response = xanserver.handleRequest(req.path, req.method, req.body);
      res.json({ message: 'Hello World' });
   });
}

export default express