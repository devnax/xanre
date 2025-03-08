import React from 'react';
import XanreqClient from './client';
import crypto from './client/crypto';


const client = new XanreqClient({
  path: '/api',
  secret: "985jkhfgu85kjnfouir",
  cache: true
})

const c = async () => {
  await client.get('/testasdasd')
}
c()

const App: React.FC = () => {
  return (
    <div >
      <button
        onClick={() => {
          client.post('/welcome/1?id=1&email=2', { name: 'test' })
        }}
      >Send</button>
    </div>
  );
};


export default App;
