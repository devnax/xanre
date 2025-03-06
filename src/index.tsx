import React from 'react';
import XanreqClient from './client';


const client = new XanreqClient({
  path: '/api',
  secret: "my-secret"
})

const App: React.FC = () => {
  return (
    <div >
      Hello as
    </div>
  );
};


export default App;
