import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FileText,
  Settings,
  Sparkles,
  PanelLeft,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Menu,
  X,
  Loader2,
} from "lucide-react";

import "./Home.css";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api";

function formatFileSize(bytes) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024))
      .toFixed(1)
      .replace(/\.0$/, "")}MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

function estimatePageCount(bytes) {
  return Math.max(
    1,
    Math.round(bytes / (150 * 1024))
  );
}

function Home() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [questionFile, setQuestionFile] = useState(null);
  const [answerFile, setAnswerFile] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const questionInputRef = useRef(null);
  const answerInputRef = useRef(null);

  const bothUploaded =
    Boolean(questionFile && answerFile);

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

  // =====================================================
  // FILE SELECT
  // =====================================================

  const handleFileSelect = (type, e) => {
    const file =
      e.target.files &&
      e.target.files[0];

    if (!file) return;

    setUploadError("");

    // Allowed file types
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setUploadError(
        "Please upload a PDF or image file (JPG, JPEG, PNG, WEBP)."
      );

      e.target.value = "";
      return;
    }

    // Maximum 10MB
    if (file.size > 10 * 1024 * 1024) {
      setUploadError(
        "File must be smaller than 10MB."
      );

      e.target.value = "";
      return;
    }

    const isPdf =
      file.type === "application/pdf";

    const record = {
      file,
      name: file.name,
      size: formatFileSize(file.size),
      pages: isPdf
        ? estimatePageCount(file.size)
        : null,
      type: file.type,
      isPdf,
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
    };

    if (type === "question") {
      setQuestionFile(record);
    } else {
      setAnswerFile(record);
    }

    e.target.value = "";
  };

  // =====================================================
  // REMOVE FILE
  // =====================================================

  const removeFile = (type, e) => {
    e.stopPropagation();

    if (uploading) return;

    if (type === "question") {
      if (questionFile?.preview) {
        URL.revokeObjectURL(questionFile.preview);
      }

      setQuestionFile(null);
    } else {
      if (answerFile?.preview) {
        URL.revokeObjectURL(answerFile.preview);
      }

      setAnswerFile(null);
    }

    setUploadError("");
  };

  // =====================================================
  // START MAPPING
  // =====================================================

  const handleStartMapping = async () => {
    if (
      !questionFile ||
      !answerFile ||
      uploading
    ) {
      return;
    }

    setUploadError("");
    setUploading(true);

    try {
      const formData = new FormData();

      formData.append(
        "question_paper",
        questionFile.file
      );

      formData.append(
        "answer_sheet",
        answerFile.file
      );

      const response = await fetch(
        `${API_BASE}/upload/`,
        {
          method: "POST",
          body: formData,
        }
      );

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Invalid response from Django server."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
          "Upload failed."
        );
      }

      if (!data?.session_id) {
        throw new Error(
          "Django did not return a session ID."
        );
      }

      /*
       * Django returns session_id immediately.
       *
       * Loading page will poll:
       *
       * GET /api/status/<session_id>/
       *
       * and then redirect to:
       *
       * /mappings/<session_id>
       */

      navigate(
        `/mappings/${data.session_id}`,
        {
          replace: true,
        }
      );
    } catch (error) {
      console.error(
        "Upload error:",
        error
      );

      setUploadError(
        error.message ||
        "Could not start mapping."
      );

      setUploading(false);
    }
  };

  // =====================================================
  // FILE CARD
  // =====================================================

  const renderFileCard = (fileRecord, type) => {
    if (!fileRecord) {
      return (
        <>
          <div className="kil">
            <img
              src="/assets/images/arrowup.png"
              alt="Upload"
            />
          </div>

          <p className="blk">
            Upload{" "}
            <span className="orr">
              {type === "question"
                ? "Question Paper"
                : "Answer Sheet"}
            </span>
          </p>

          <span className="max-size">
            Max 10MB
          </span>
        </>
      );
    }

    return (
      <div className="file-card">

        {fileRecord.isPdf ? (
          <div className="pdf-icon">
            PDF
          </div>
        ) : (
          <div className="image-preview">

            <img
              src={fileRecord.preview}
              alt={fileRecord.name}
            />

          </div>
        )}

        <div className="file-info">

          <p className="file-name">
            {fileRecord.name}
          </p>

          <span className="file-meta">

            {fileRecord.size}

            {fileRecord.isPdf && (
              <>
                {" • "}
                {fileRecord.pages}
                {" Pages"}
              </>
            )}

            {!fileRecord.isPdf && (
              <>
                {" • "}
                Image
              </>
            )}

          </span>

        </div>

        <button
          className="remove-btn"
          aria-label={
            type === "question"
              ? "Remove question paper"
              : "Remove answer sheet"
          }
          onClick={(e) =>
            removeFile(type, e)
          }
        >
          <X size={14} />
        </button>

      </div>
    );
  };

  return (
    <div className="app">

      {/* =================================================
          SIDEBAR BACKDROP
      ================================================= */}

      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`sidebar ${
          sidebarOpen ? "open" : ""
        }`}
      >

        <div className="logo-row">

          <img
            src="/assets/images/logo.png"
            alt="VedaAI"
            className="logo"
          />

          <PanelLeft
            className="collapse-icon"
            size={20}
            onClick={() =>
              setSidebarOpen(true)
            }
          />

        </div>

        <button className="toolkit-btn">
          <Sparkles size={18.32} />

          <span className="tot">
            AI Teacher's Toolkit
          </span>
        </button>

        <nav className="navigation">

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className={`nav-item ${
                  item.active
                    ? "active"
                    : ""
                }`}
              >

                {item.type === "image" ? (
                  <img
                    src={item.icon}
                    alt=""
                    className="nav-icon"
                  />
                ) : (
                  <Icon
                    size={20}
                    strokeWidth={1.8}
                  />
                )}

                <span>
                  {item.label}
                </span>

              </div>
            );
          })}

        </nav>

        <div className="sidebar-bottom">

          <div className="nav-item settings">

            <Settings
              size={20}
              strokeWidth={1.8}
            />

            <span className="too">
              Settings
            </span>

          </div>

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
          MAIN COLUMN
      ================================================= */}

      <div className="main-column">

        {/* =================================================
            NAVBAR
        ================================================= */}

        <header className="navbar">

          <div className="navbar-left">

            <button
              className="back-btn"
              onClick={() =>
                navigate(-1)
              }
            >
              <ArrowLeft size={24} />
            </button>

            <div className="navbar-title">

              <img
                src="/assets/images/Ic.png"
                className="exam"
                alt="Exams"
              />

              <span className="title-desktop">
                Exams
              </span>

              <span className="title-mobile">
                VedaAI
              </span>

            </div>

          </div>

          <div className="navbar-right">

            <button className="navbar-icon">
              <img
                src="/assets/images/q.png"
                alt="Help"
                className="ii"
              />
            </button>

            <button className="navbar-icon">
              <img
                src="/assets/images/bell.png"
                alt="Notifications"
                className="ii"
              />
            </button>

            <button className="navbar-icon">
              <img
                src="/assets/images/gem.png"
                alt="Premium"
                className="ii"
              />
            </button>

            <div className="profile">

              <img
                src="/assets/images/prof.png"
                alt="Madhur Rastogi"
                className="profile-img"
              />

              <p>
                Madhur Rastogi
              </p>

              <ChevronDown
                size={18}
                className="profile-chevron"
              />

            </div>

            <button
              className="menu-btn"
              onClick={() =>
                setSidebarOpen(true)
              }
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

          </div>

        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <main className="center">

          <div className="kk">

            <div className="cword">

              <p className="blck">

                Upload{" "}

                <span className="ornge">
                  Question Paper & Answer Sheets
                </span>

              </p>

              <p className="subtitle">
                Upload both files to get started
              </p>

            </div>

            <div className="lady">

              <img
                src="/assets/images/lady.png"
                alt="Upload illustration"
              />

            </div>

            <div className="king">

              {/* =================================================
                  QUESTION PAPER
              ================================================= */}

              <div
                className={`questions ${
                  questionFile
                    ? "filled"
                    : ""
                }`}
                onClick={() =>
                  !questionFile &&
                  !uploading &&
                  questionInputRef.current?.click()
                }
              >

                <input
                  ref={questionInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                  className="hidden-input"
                  onChange={(e) =>
                    handleFileSelect(
                      "question",
                      e
                    )
                  }
                />

                {renderFileCard(
                  questionFile,
                  "question"
                )}

              </div>

              {/* =================================================
                  ANSWER SHEET
              ================================================= */}

              <div
                className={`questionss ${
                  answerFile
                    ? "filled"
                    : ""
                }`}
                onClick={() =>
                  !answerFile &&
                  !uploading &&
                  answerInputRef.current?.click()
                }
              >

                <input
                  ref={answerInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                  className="hidden-input"
                  onChange={(e) =>
                    handleFileSelect(
                      "answer",
                      e
                    )
                  }
                />

                {renderFileCard(
                  answerFile,
                  "answer"
                )}

              </div>

            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {uploadError && (
              <p
                style={{
                  color: "#d32f2f",
                  marginTop: "12px",
                  textAlign: "center",
                }}
              >
                {uploadError}
              </p>
            )}

            {/* =================================================
                START MAPPING
            ================================================= */}

            <div className="map">

              <button
                className={`mapp ${
                  bothUploaded &&
                  !uploading
                    ? "enabled"
                    : ""
                }`}
                disabled={
                  !bothUploaded ||
                  uploading
                }
                onClick={
                  handleStartMapping
                }
              >

                {uploading ? (
                  <>
                    <Loader2
                      size={16}
                      className="spin"
                    />

                    Uploading...
                  </>
                ) : (
                  <>
                    Start Mapping

                    <ArrowRight
                      size={16}
                    />
                  </>
                )}

              </button>

              <p>
                Once both files are uploaded,
                you'll able to map answer
                with questions
              </p>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}

export default Home;