import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
// import Home from '@/page/Home';
//  import Pay from '@/page/Pay';
import LensLogin from '@/page/LensLogin';
// import Choose from '@/page/choose';

function Routers() {
  return (
    <BrowserRouter>
      <Routes>
{/*         <Route path="/"
          element={<Choose />}
        /> 
        <Route path="/"
          element={<Home />}
        />
        <Route path="/Pay"
          element={<Pay />}
        />
        */}
        <Route path="/"
          element={<LensLogin />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default Routers;
