import { BrowserRouter as Router,Routes,Route } from "react-router-dom";
import Home from "./Components/Home";
import Exchanges from "./Components/Exchanges";
import Coins from "./Components/Coins";
import CoinDetails from "./Components/CoinDetails";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
function App(){
  return (
    <>

    <Router>
     <Header/>

      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/Coins" element={<Coins/>}/>
        <Route path="/Exchanges" element={<Exchanges/>}/>
        <Route path="/Coins/:id" element={<CoinDetails/>}/>
      </Routes>

      <Footer />
    </Router>
    </>
  )
}

export default App;