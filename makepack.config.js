import express from "./express.js"
const c = (config) => {
   config.start.express = express
   return config
}

export default c