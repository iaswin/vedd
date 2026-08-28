import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  FileText,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  ChevronsRight,
  Menu,
  PanelLeft,
  Settings,
} from "lucide-react";

import "./Loading.css";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api";

function LoadingState() {
  const navigate = useNavigate();
  const { sessionId } = useParams();

  const [sidebarExpanded, setSidebarExpanded] =
    useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(
    "Starting..."
  );

  const [error, setError] = useState("");

  

  const expandSidebar = () => {
    setSidebarExpanded(true);
  };

  const collapseSidebar = () => {
    setSidebarExpanded(false);
    setMobileSidebarOpen(false);
  };

  const openMobileSidebar = () => {
    setMobileSidebarOpen(true);
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

 

  const menuItems = [
    {
      label: "Home",
      icon: "/assets/images/Icon.png",
      type: "image",
    },
    {
      label: "My Classroom",
      icon: "/assets/images/Vector.png",
      type: "image",
    },
    {
      label: "Assignments",
      icon: FileText,
      type: "lucide",
    },
    {
      label: "Exams",
      icon: "/assets/images/Ic.png",
      type: "image",
      active: true,
    },
    {
      label: "My Library",
      icon: "/assets/images/Icc.png",
      type: "image",
    },
  ];

  const renderMenuIcon = (item) => {
    if (item.type === "image") {
      return (
        <img
          src={item.icon}
          alt=""
          className="menu-icon"
        />
      );
    }

    const Icon = item.icon;

    return (
      <Icon
        size={20}
        strokeWidth={1.8}
      />
    );
  };

  

  useEffect(() => {
    if (!sessionId) {
      setError(
        "No assessment session was provided."
      );
      return;
    }

    let cancelled = false;
    let timer = null;

    const checkStatus = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/status/${sessionId}/`
        );

        const data = await response.json();

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          throw new Error(
            data?.error ||
            "Could not get processing status."
          );
        }

        // -----------------------------------------------
        // PROGRESS
        // -----------------------------------------------

        if (data.progress) {
          setProgress(
            Number(
              data.progress.percent || 0
            )
          );

          setStage(
            data.progress.stage ||
            "Processing..."
          );
        }

        // -----------------------------------------------
        // COMPLETED
        // -----------------------------------------------

        if (
          data.status === "completed" ||
          data.status === "complete" ||
          data.status === "done"
        ) {
          setProgress(100);
          setStage("Completed");

          /*
           * Give React a moment to render 100%.
           * Then move to answer mapping page.
           */

          setTimeout(() => {
            if (!cancelled) {
              navigate(
                `/mapp/${sessionId}`,
                {
                  replace: true,
                }
              );
            }
          }, 400);

          return;
        }

        // -----------------------------------------------
        // FAILED
        // -----------------------------------------------

        if (
          data.status === "failed" ||
          data.status === "error"
        ) {
          setError(
            data.error ||
            "Assessment processing failed."
          );

          return;
        }

        // -----------------------------------------------
        // STILL PROCESSING
        // -----------------------------------------------

        timer = setTimeout(
          checkStatus,
          1500
        );

      } catch (err) {
        if (cancelled) return;

        console.error(
          "Status polling error:",
          err
        );

        setError(
          err.message ||
          "Unable to communicate with Django."
        );

        /*
         * Retry because Django may temporarily
         * be unavailable.
         */

        timer = setTimeout(
          checkStatus,
          3000
        );
      }
    };

    checkStatus();

    return () => {
      cancelled = true;

      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [sessionId, navigate]);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div
      className={`loading-page ${
        sidebarExpanded
          ? "sidebar-expanded"
          : ""
      }`}
    >

      {/* MOBILE BACKDROP */}

      {mobileSidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={
            closeMobileSidebar
          }
        />
      )}

      {/* =================================================
          COLLAPSED SIDEBAR
      ================================================= */}

      <aside className="collapsed-sidebar">

        <div className="collapsed-logo">

          <img
            src="/assets/images/loog.png"
            alt="VedaAI"
          />

        </div>

        <button
          className="collapsedaitoolkit"
          aria-label="AI Teacher's Toolkit"
        >
          <Sparkles size={20} />
        </button>

        <nav className="collapsed-navigation">

          {menuItems.map((item) => (
            <button
              key={item.label}
              className={`collapsed-navigation-item ${
                item.active
                  ? "active"
                  : ""
              }`}
              aria-label={item.label}
              title={item.label}
            >
              {renderMenuIcon(item)}
            </button>
          ))}

        </nav>

        <div className="collapsed-bottom">

          <div className="collapsed-school-logo">

            <img
              src="/assets/images/schoollogo.png"
              alt="Delhi Public School"
            />

          </div>

          <button
            className="expand-sidebar-button"
            onClick={
              expandSidebar
            }
            aria-label="Expand sidebar"
          >
            <ChevronsRight
              size={18}
            />
          </button>

        </div>

      </aside>

      {/* =================================================
          EXPANDED SIDEBAR
      ================================================= */}

      <aside
        className={`sidebar ${
          mobileSidebarOpen
            ? "mobile-open"
            : ""
        }`}
      >

        <div className="sidebar-header">

          <img
            src="/assets/images/logo.png"
            alt="VedaAI"
            className="sidebar-logo"
          />

          <button
            className="collapse-sidebar-button"
            onClick={
              collapseSidebar
            }
            aria-label="Collapse sidebar"
          >
            <PanelLeft size={20} />
          </button>

        </div>

        <button className="toolkit-button">

          <Sparkles size={18} />

          <span>
            AI Teacher's Toolkit
          </span>

        </button>

        <nav className="navigation">

          {menuItems.map((item) => (
            <button
              key={item.label}
              className={`navigation-item ${
                item.active
                  ? "active"
                  : ""
              }`}
            >

              {renderMenuIcon(item)}

              <span>
                {item.label}
              </span>

            </button>
          ))}

        </nav>

        <div className="sidebar-bottom">

          <button className="navigation-item">

            <Settings
              size={20}
              strokeWidth={1.8}
            />

            <span>
              Settings
            </span>

          </button>

          <div className="school-card">

            <div className="school-logo">

              <img
                src="/assets/images/schoollogo.png"
                alt="Delhi Public School"
              />

            </div>

            <div className="school-info">

              <strong>
                Delhi Public School
              </strong>

              <span>
                Bokaro Steel City
              </span>

            </div>

          </div>

        </div>

      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <div className="main-content">

        <header className="navbar">

          <div className="navbar-left">

            <button
              className="back-button"
              onClick={() =>
                navigate("/")
              }
            >
              <ArrowLeft size={24} />
            </button>

            <div className="page-title">

              <img
                src="/assets/images/Ic.png"
                alt="Exams"
                className="page-title-icon"
              />

              <span className="desktop-title">
                Exams
              </span>

              <span className="mobile-title">
                VedaAI
              </span>

            </div>

          </div>

          <div className="navbar-right">

            <button className="navbar-icon">

              <img
                src="/assets/images/q.png"
                alt="Help"
              />

            </button>

            <button className="navbar-icon">

              <img
                src="/assets/images/bell.png"
                alt="Notifications"
              />

            </button>

            <button className="navbar-icon">

              <img
                src="/assets/images/gem.png"
                alt="Premium"
              />

            </button>

            <div className="profile">

              <img
                src="/assets/images/prof.png"
                alt="Madhur Rastogi"
                className="profile-image"
              />

              <p>
                Madhur Rastogi
              </p>

              <ChevronDown
                size={18}
              />

            </div>

            <button
              className="mobile-menu-button"
              onClick={
                openMobileSidebar
              }
            >
              <Menu size={22} />
            </button>

          </div>

        </header>

        {/* =================================================
            LOADING
        ================================================= */}

        <div className="loading-card">

          <main className="loading-container">

            <div className="loading-content">

              <img
                src="/assets/images/Container.png"
                className="loading-icon"
                alt="Processing"
              />

              <h2 className="loading-title">

                {error
                  ? "Processing Failed"
                  : "Extracting..."}

              </h2>

              <p className="loading-message">

                {error
                  ? error
                  : stage}

              </p>

              {!error && (
                <>
                  <div
                    style={{
                      width: "260px",
                      height: "6px",
                      background:
                        "#eeeeee",
                      borderRadius:
                        "10px",
                      overflow: "hidden",
                      marginTop:
                        "20px",
                    }}
                  >

                    <div
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            progress
                          )
                        )}%`,
                        height: "100%",
                        background:
                          "#f47b20",
                        transition:
                          "width 0.4s ease",
                      }}
                    />

                  </div>

                  <p
                    style={{
                      marginTop: "8px",
                      fontSize: "13px",
                    }}
                  >
                    {progress}% completed
                  </p>
                </>
              )}

              {error && (
                <button
                  onClick={() =>
                    navigate("/")
                  }
                  style={{
                    marginTop: "20px",
                    padding:
                      "10px 20px",
                    border: "none",
                    borderRadius:
                      "8px",
                    cursor:
                      "pointer",
                  }}
                >
                  Back to Upload
                </button>
              )}

            </div>

          </main>

        </div>

      </div>

    </div>
  );
}

export default LoadingState;