import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HolidayPlanner from "./HolidayPlanner";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HolidayPlanner />} />
        // Tabs
<Route path="/" element={<HolidayPlanner />} />
<Route path="/destinations" element={<HolidayPlanner />} />
<Route path="/destinations/:slug" element={<HolidayPlanner />} /> {/* ✅ ADD THIS */}
<Route path="/map" element={<HolidayPlanner />} />
<Route path="/saved" element={<HolidayPlanner />} />


        <Route path="/about" element={<HolidayPlanner />} />
        <Route path="/contact" element={<HolidayPlanner />} />
        <Route path="/advertise" element={<HolidayPlanner />} />
        <Route path="/privacy" element={<HolidayPlanner />} />
        <Route path="/terms" element={<HolidayPlanner />} />

        <Route path="/planner/dates" element={<HolidayPlanner />} />
        <Route path="/planner/itinerary" element={<HolidayPlanner />} />
        <Route path="/planner/itinerary/:slug" element={<HolidayPlanner />} />



        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
