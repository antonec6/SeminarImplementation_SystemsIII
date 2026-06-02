import { BrowserRouter, Routes, Route, Outlet } from "react-router";
import Menu from "../components/Menu";
import Home from "../pages/Home";
import AboutUs from "../pages/AboutUs";
import Login from "../pages/Login";

const FoodNearMePlaceholder = () => <main style={{ padding: '20px' }}><h1>Food Near Me Page (Próximamente)</h1></main>;
//const AboutPlaceholder = () => <main style={{ padding: '20px' }}><h1>About Us Page (Próximamente)</h1></main>;
const LoginPlaceholder = () => <main style={{ padding: '20px' }}><h1>Login Page (Próximamente)</h1></main>;


const MainLayout = () => {
  return (
    <>
      <Menu />
      <Outlet />
    </>
  );
};

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* With menu */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/food-near-me" element={<FoodNearMePlaceholder />} />
          <Route path="/aboutus" element={<AboutUs />} />
        </Route>

        {/* Without menu*/}
        <Route path="/login" element={<Login />} />

      </Routes>
    </BrowserRouter>
  );
}