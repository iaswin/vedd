import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from "./components/Home/Home";
import Loading from "./components/Loading/Loading";
import AssessmentUpload from "./components/AnswerMapping/Answer";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Upload */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* Django/Gemini processing */}
        <Route
          path="/mappings/:sessionId"
          element={<Loading />}
        />

        {/* Final answer mapping */}
        <Route
          path="/mapp/:sessionId"
          element={<AssessmentUpload />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;