import { useState } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router";
import Menu from "../components/Menu";
import Home from "../pages/Home";
import AboutUs from "../pages/AboutUs";
import FoodNearMe from "../pages/FoodNearMe";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
import MyFood from "../pages/MyFood";
import MyRequests from "../pages/MyRequests";

const FoodNearMePlaceholder = () => <main style={{ padding: '20px' }}><h1>Food Near Me Page (Próximamente)</h1></main>;
//const AboutPlaceholder = () => <main style={{ padding: '20px' }}><h1>About Us Page (Próximamente)</h1></main>;
const LoginPlaceholder = () => <main style={{ padding: '20px' }}><h1>Login Page (Próximamente)</h1></main>;


export default function AppRouter() {

  const [user, setUser] = useState(null);

 
  const MainLayout = () => (
    <>
      <Menu user={user} setUser={setUser} />
      <Outlet />
    </>
  );

return (
    <BrowserRouter>
      <Routes>
        {/*With menu */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/food-near-me" element={<FoodNearMe user={user} />} />
          <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
          <Route path="/my-food" element={<MyFood user={user} />} />
          <Route path="/my-requests" element={<MyRequests user={user} />} />
        </Route>

        {/* Without Menu */}
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}