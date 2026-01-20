import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HolidayPlanner from "./HolidayPlanner";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Tabs */}
        <Route path="/" element={<HolidayPlanner />} />
        <Route path="/destinations" element={<HolidayPlanner />} />
        <Route path="/map" element={<HolidayPlanner />} />
        <Route path="/saved" element={<HolidayPlanner />} />

        {/* Footer pages */}
        <Route path="/about" element={<HolidayPlanner />} />
        <Route path="/contact" element={<HolidayPlanner />} />
        <Route path="/advertise" element={<HolidayPlanner />} />
        <Route path="/privacy" element={<HolidayPlanner />} />
        <Route path="/terms" element={<HolidayPlanner />} />

        {/* Planner flow */}
        <Route path="/planner/dates" element={<HolidayPlanner />} />
        <Route path="/planner/itinerary" element={<HolidayPlanner />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
