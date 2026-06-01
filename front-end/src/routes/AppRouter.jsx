import { BrowserRouter, Routes, Route } from "react-router";
import Menu from "../components/Menu";
//import Home from "../pages/Home";

const FoodNearMePlaceholder = () => <main style={{ padding: '20px' }}><h1>Food Near Me Page (Próximamente)</h1></main>;
const AboutPlaceholder = () => <main style={{ padding: '20px' }}><h1>About Us Page (Próximamente)</h1></main>;
const LoginPlaceholder = () => <main style={{ padding: '20px' }}><h1>Login Page (Próximamente)</h1></main>;

export default function AppRouter() {
  return (
    <BrowserRouter>
      {}
      <Menu />

      {}
      {/*}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/food-near-me" element={<FoodNearMePlaceholder />} />
        <Route path="/about" element={<AboutPlaceholder />} />
        <Route path="/login" element={<LoginPlaceholder />} />
      </Routes>*/}
    </BrowserRouter>
  );
}