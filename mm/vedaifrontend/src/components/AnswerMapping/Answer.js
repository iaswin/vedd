import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsRight,
  FileText,
  Loader2,
  Menu,
  Minus,
  PanelLeft,
  Plus,
  Settings,
  Sparkles,
} from "lucide-react";

import "./Answer.css";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

function parseQuestionNumber(raw) {
  const value = String(raw ?? "").trim();
  const match = value.match(/^(.*\S)\s*\(\s*([a-zA-Z])\s*\)$/);

  if (match) {
    return { base: match[1].trim(), letter: match[2].toLowerCase() };
  }

  return { base: value, letter: null };
}

function getScoreBand(score, maxScore) {
  if (score == null || maxScore == null || maxScore === 0) {
    return "unknown";
  }

  if (score === 0) {
    return "zero";
  }

  return score / maxScore >= 0.7 ? "full" : "partial";
}

function ScorePill({ answered, score, maxScore }) {
  if (!answered) {
    return (
      <span className="score-pill score-pill--unknown">
        Not answered
      </span>
    );
  }

  const band = getScoreBand(score, maxScore);

  return (
    <span className={`score-pill score-pill--${band}`}>
      {score}/{maxScore}
    </span>
  );
}


function normalizeQuestion(item, index) {
  const rawNumber = String(
    item.number ?? index + 1
  ).trim();

  const { base, letter } = parseQuestionNumber(rawNumber);

  const regions = Array.isArray(item.answer_regions)
    ? item.answer_regions
    : [];

  return {
    id: `q-${rawNumber}`,
    rawNumber,
    number: base,
    letter,
    text: item.text || `Question ${rawNumber}`,
    score: item.marks ?? null,
    maxScore: item.max_marks ?? null,
    feedback: item.feedback || "",
    answered: Boolean(item.answered),
    answerText: item.answer_text || "",
    continues: Boolean(item.continues),
    regions,
  };
}


const menuItems = [
  { label: "Home", icon: "/assets/images/Icon.png", type: "image" },
  {
    label: "My Classroom",
    icon: "/assets/images/Vector.png",
    type: "image",
  },
  { label: "Assignments", icon: FileText, type: "lucide" },
  {
    label: "Exams",
    icon: "/assets/images/Ic.png",
    type: "image",
    active: true,
  },
  { label: "My Library", icon: "/assets/images/Icc.png", type: "image" },
];

function NavigationItems({ collapsed = false }) {
  const className = collapsed
    ? "collapsed-navigation-item"
    : "navigation-item";

  return (
    <>
      {menuItems.map((item) => {
        const { label, icon, type, active } = item;
        const Icon = type === "lucide" ? icon : null;

        return (
          <button
            key={label}
            className={`${className} ${active ? "active" : ""}`}
            aria-label={collapsed ? label : undefined}
            title={collapsed ? label : undefined}
          >
            {type === "image" ? (
              <img src={icon} alt="" className="nav-icon" />
            ) : (
              <Icon size={20} strokeWidth={1.8} />
            )}

            {!collapsed && <span>{label}</span>}
          </button>
        );
      })}
    </>
  );
}

function CollapsedSidebar({ onExpand }) {
  return (
    <aside className="collapsed-sidebar">
      <div className="collapsed-logo">
        {/* Same VedaAI logo asset as Home.js's logo-row, scaled down to
            fit the collapsed rail instead of the fake "V" mark. */}
        <img
          src="/assets/images/loog.png"
          alt="VedaAI"
          className="logo-mark-image"
        />
      </div>

      <button
        className="collapsedaitoolkit"
        aria-label="AI Teacher's Toolkit"
      >
        <Sparkles size={20} />
      </button>

      <nav className="collapsed-navigation">
        <NavigationItems collapsed />
      </nav>

      <div className="collapsed-bottom">
        <div className="collapsed-school-logo">
          <img
            src="/assets/images/schoollogo.png"
            alt="Delhi Public School"
            className="collapsed-school-logo-image"
          />
        </div>

        <button
          className="expand-sidebar-button"
          onClick={onExpand}
          aria-label="Expand sidebar"
        >
          <ChevronsRight size={18} />
        </button>
      </div>
    </aside>
  );
}

function ExpandedSidebar({ isMobileOpen, onCollapse }) {
  return (
    <aside
      className={`sidebar ${
        isMobileOpen ? "mobile-open" : ""
      }`}
    >
      <div className="sidebar-header">
        {/* Same logo asset + className as Home.js's logo-row, instead
            of a plain "VedaAI" text label. */}
        <img
          src="/assets/images/logo.png"
          alt="VedaAI"
          className="logo"
        />

        <button
          className="collapse-sidebar-button"
          onClick={onCollapse}
          aria-label="Collapse sidebar"
        >
          <PanelLeft size={20} />
        </button>
      </div>

      <button className="toolkit-button">
        <Sparkles size={18.32} />
        <span>AI Teacher's Toolkit</span>
      </button>

      <nav className="navigation">
        <NavigationItems />
      </nav>

      <div className="sidebar-bottom">
        <button className="navigation-item">
          <Settings size={20} strokeWidth={1.8} />
          <span>Settings</span>
        </button>

        <div className="school-card">
          <div className="school-logo">
            <img
              src="/assets/images/schoollogo.png"
              alt="Delhi Public School"
              className="school-logo-image"
            />
          </div>

          <div className="school-info">
            <strong>Delhi Public School</strong>
            <span>Bokaro Steel City</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/* Navbar                                                                     */
/* -------------------------------------------------------------------------- */

function Navbar({ onBack, onOpenMenu }) {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          className="back-button"
          onClick={onBack}
          aria-label="Go back"
        >
          {/* Home.js's back button uses size 24 */}
          <ArrowLeft size={24} />
        </button>

        <div className="page-title">
          {/* Same "Ic.png" icon (and "exam" className) as Home.js's
              navbar-title - it's the same image used for the Exams
              nav item too. */}
          <img
            src="/assets/images/Ic.png"
            className="exam"
            alt="Exams"
          />

          <span className="desktop-title">Exams</span>
          <span className="mobile-title">VedaAI</span>
        </div>
      </div>

      <div className="navbar-right">
        <button className="navbar-icon" aria-label="Help">
          <img
            src="/assets/images/q.png"
            alt="Help"
            className="ii"
          />
        </button>

        <button
          className="navbar-icon"
          aria-label="Notifications"
        >
          <img
            src="/assets/images/bell.png"
            alt="Notifications"
            className="ii"
          />
          <span className="navbar-icon-dot" />
        </button>

        <button className="navbar-icon" aria-label="Premium">
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
            className="profile-image"
          />
          <p>Madhur Rastogi</p>
          {/* Home.js's profile chevron is size 18 */}
          <ChevronDown size={18} className="profile-chevron" />
        </div>

        <button
          className="mobile-menu-button"
          onClick={onOpenMenu}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* Mobile Questions / Answer Sheet toggle                                     */
/* -------------------------------------------------------------------------- */

function MobileViewToggle({ view, onChange }) {
  return (
    <div
      className="mobile-view-toggle"
      role="tablist"
      aria-label="Switch between questions and answer sheet"
    >
      <button
        role="tab"
        aria-selected={view === "questions"}
        className={`mobile-view-toggle-button ${
          view === "questions" ? "active" : ""
        }`}
        onClick={() => onChange("questions")}
      >
        Questions
      </button>

      <button
        role="tab"
        aria-selected={view === "answer-sheet"}
        className={`mobile-view-toggle-button ${
          view === "answer-sheet" ? "active" : ""
        }`}
        onClick={() => onChange("answer-sheet")}
      >
        Answer Sheet
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Loading / Error                                                            */
/* -------------------------------------------------------------------------- */

function LoadingState({ percent, stage }) {
  return (
    <div className="state-panel">
      <Loader2 size={36} className="spin" />
      <h2>{stage || "Loading assessment..."}</h2>
      {typeof percent === "number" && (
        <p>{percent}% complete</p>
      )}
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="state-panel state-panel--error">
      <AlertCircle size={40} />

      <h2>Something went wrong</h2>

      <p>{message}</p>

      <button className="primary-button" onClick={onRetry}>
        Upload again
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Questions                                                                  */
/* -------------------------------------------------------------------------- */

function QuestionCard({
  question,
  expandedIds,
  activeQuestionId,
  onToggle,
}) {
  const isExpanded = expandedIds.has(question.id);
  const isActive = activeQuestionId === question.id;

  const feedbackText =
    question.feedback ||
    (!question.answered
      ? "This question was not answered."
      : "");

  return (
    <li
      className={`question-card ${
        isActive ? "is-active" : ""
      }`}
    >
      <button
        className="question-card-header"
        onClick={() => onToggle(question.id)}
        aria-expanded={isExpanded}
      >
        <span className="question-number">
          {question.number}
        </span>

        {question.letter && (
          <span className="question-letter-badge">
            {question.letter}.
          </span>
        )}

        <span className="question-text">
          {question.text}
        </span>

        {question.continues && (
          <span className="continues-tag">continued</span>
        )}

        <ScorePill
          answered={question.answered}
          score={question.score}
          maxScore={question.maxScore}
        />

        {isExpanded ? (
          <ChevronUp className="question-chevron" size={18} />
        ) : (
          <ChevronDown
            className="question-chevron"
            size={18}
          />
        )}
      </button>

      {isExpanded && feedbackText && (
        <Feedback text={feedbackText} />
      )}
    </li>
  );
}

function Feedback({ text }) {
  return (
    <div className="ai-feedback">
      <h4>AI Feedback</h4>
      <p>{text}</p>
    </div>
  );
}

function UnmatchedPanel({ items }) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="unmatched-panel">
      <h3>
        Unmatched answers ({items.length})
      </h3>
      <p>
        These handwritten labels were detected on the answer
        sheet but couldn't be confidently matched to a
        question.
      </p>

      <ul>
        {items.map((item, index) => (
          <li key={index} className="unmatched-item">
            <span className="unmatched-item-label">
              "{item.detected_number || "unlabeled"}"
            </span>
            <span className="unmatched-item-meta">
              Page {item.page}
              {item.reason ? ` · ${item.reason}` : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function QuestionsPane({
  questions,
  unmatched,
  summary,
  expandedIds,
  allExpanded,
  activeQuestionId,
  onToggleQuestion,
  onToggleAll,
  result,
}) {
  return (
    <section
      className="questions-pane"
      aria-label="Extracted questions"
    >
      <div className="questions-pane-header">
        <h1>Extracted Questions (from question paper)</h1>

        <button
          className="expand-all-button"
          onClick={onToggleAll}
        >
          {allExpanded ? "Collapse All" : "Expand All"}
        </button>
      </div>

      <div className="status-banner">
        <CheckCircle2 size={18} />
        <span>
          {summary
            ? `${summary.answered}/${summary.total_questions} answered · ${summary.total_marks}/${summary.maximum_marks} marks`
            : "Assessment processed successfully"}
        </span>
      </div>

      {questions.length === 0 ? (
        <div className="empty-state">
          <h3>Processing completed</h3>
          <p>
            No questions were returned by the backend.
          </p>

          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      ) : (
        <>
          <ol className="question-list">
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                expandedIds={expandedIds}
                activeQuestionId={activeQuestionId}
                onToggle={onToggleQuestion}
              />
            ))}
          </ol>

          <UnmatchedPanel items={unmatched} />
        </>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Answer sheet                                                               */
/* -------------------------------------------------------------------------- */

function ZoomControl({ zoom, onZoom }) {
  return (
    <div className="zoom-control">
      <button
        onClick={() => onZoom(-10)}
        aria-label="Zoom out"
      >
        <Minus size={16} />
      </button>

      <span>{zoom}%</span>

      <button
        onClick={() => onZoom(10)}
        aria-label="Zoom in"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}

function PageControl({ page, totalPages, onPageChange }) {
  if (!totalPages) {
    return null;
  }

  return (
    <div className="page-control">
      <button
        onClick={() =>
          onPageChange(Math.max(1, page - 1))
        }
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      <span>
        Page {page} of {totalPages}
      </span>

      <button
        onClick={() =>
          onPageChange(Math.min(totalPages, page + 1))
        }
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

function AnswerSheet({
  pages,
  page,
  zoom,
  activeRegions,
  activeQuestion,
  onZoom,
  onPageChange,
}) {
  const currentPage = pages[page - 1] || null;

  // Track image load failures per URL so a broken route shows a real
  // error instead of the browser's silent broken-image icon.
  const [failedUrl, setFailedUrl] = useState(null);

  const imageFailed =
    currentPage && failedUrl === currentPage.image_url;

  return (
    <section
      className="answer-sheet-pane"
      aria-label="Answer sheet"
    >
      <div className="answer-sheet-toolbar">
        <span className="answer-sheet-title">
          Answer Sheet
        </span>

        <div className="answer-sheet-controls">
          <ZoomControl zoom={zoom} onZoom={onZoom} />

          <PageControl
            page={page}
            totalPages={pages.length}
            onPageChange={onPageChange}
          />
        </div>
      </div>

      <div className="answer-sheet-viewport">
        {!currentPage && (
          <div className="answer-sheet-empty">
            <p>
              No answer sheet pages available for this
              session.
            </p>
          </div>
        )}

        {currentPage && imageFailed && (
          <div className="answer-sheet-empty">
            <p>
              Couldn't load this page's image.
              <br />
              <code>{currentPage.image_url}</code>
              <br />
              Check that this route matches your Django
              urls.py (PageImageView) and that the session
              hasn't expired from cache.
            </p>
          </div>
        )}

        {currentPage && !imageFailed && (
          <div
            className="answer-sheet-page"
            style={{ width: `${zoom}%` }}
          >
            <img
              src={currentPage.image_url}
              alt={`Answer sheet page ${page}`}
              onError={() =>
                setFailedUrl(currentPage.image_url)
              }
            />

            {/* A question can have several boxes on this page
                (e.g. an answer that spans multiple lines/regions). */}
            {activeRegions.map((region, index) => (
              <div
                key={index}
                className="answer-highlight"
                style={{
                  top: `${region.y * 100}%`,
                  left: `${region.x * 100}%`,
                  width: `${region.w * 100}%`,
                  height: `${region.h * 100}%`,
                }}
              >
                {index === 0 && (
                  <span className="answer-highlight-tag">
                    Q{activeQuestion.rawNumber}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

function AssessmentUpload() {
  const navigate = useNavigate();
  const { sessionId } = useParams();

  const [sidebarExpanded, setSidebarExpanded] =
    useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  // Which pane is shown on narrow / mobile viewports.
  const [mobileView, setMobileView] = useState("questions");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [expandedIds, setExpandedIds] = useState(
    () => new Set()
  );
  const [allExpanded, setAllExpanded] = useState(false);
  const [activeQuestionId, setActiveQuestionId] =
    useState(null);

  const [zoom, setZoom] = useState(100);
  const [page, setPage] = useState(1);

  /* Poll assessment status until it's done. The backend runs the
     pipeline (question extraction -> answer mapping -> grading) on a
     background thread and reports incremental progress via
     `progress: { percent, stage }`, so a single fetch on mount isn't
     enough - we need to keep polling while status is queued/processing. */

  useEffect(() => {
    if (!sessionId) {
      setError("Assessment session not found.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    let timeoutId;

    async function poll() {
      try {
        const response = await fetch(
          `${API_BASE}/status/${sessionId}/`
        );

        const envelope = await response.json();

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          throw new Error(
            envelope?.error || "Could not load assessment."
          );
        }

        if (envelope.status === "failed") {
          throw new Error(
            envelope.error || "Assessment processing failed."
          );
        }

        setData(envelope);

        if (envelope.status === "completed") {
          setLoading(false);
          return;
        }

        setLoading(true);
        timeoutId = setTimeout(poll, 1500);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error("Result error:", err);

        setError(err.message || "Could not load result.");
        setLoading(false);
      }
    }

    poll();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [sessionId]);

  /* Normalize backend data.

     The status endpoint returns:
       { session_id, status, result, error, progress }
     and `result` (once status === "completed") is:
       { questions: [...], unmatched: [...], summary: {...} }
     - see pipeline.run_pipeline's `final_result`. */

  const result = data?.result || {};

  const questions = useMemo(() => {
    const rawQuestions = Array.isArray(result.questions)
      ? result.questions
      : [];

    return rawQuestions.map(normalizeQuestion);
  }, [result]);

  const unmatched = Array.isArray(result.unmatched)
    ? result.unmatched
    : [];

  const summary = result.summary || null;

  /* The status response has no image URLs - answer sheet pages are
     served individually from PageImageView
     (`/page/<session_id>/answer/<page_num>/`). We don't get a page
     count back explicitly, so it's derived from the highest page
     number referenced by any mapped or unmatched region. */

  const totalAnswerPages = useMemo(() => {
    let max = 0;

    questions.forEach((question) => {
      question.regions.forEach((region) => {
        if (region.page > max) {
          max = region.page;
        }
      });
    });

    unmatched.forEach((item) => {
      if (item.page > max) {
        max = item.page;
      }
    });

    return max || 1;
  }, [questions, unmatched]);

  const answerSheetPages = useMemo(() => {
    if (!sessionId) {
      return [];
    }

    return Array.from(
      { length: totalAnswerPages },
      (_, index) => ({
        image_url: `${API_BASE}/image/${sessionId}/answer/${
          index + 1
        }/`,
      })
    );
  }, [sessionId, totalAnswerPages]);

  /* Question interactions */

  function toggleQuestion(id) {
    setExpandedIds((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });

    setActiveQuestionId(id);

    // Jump the answer sheet to wherever this question's answer
    // actually lives, and surface it on mobile too.
    const question = questions.find((item) => item.id === id);

    if (question?.regions?.length) {
      setPage(question.regions[0].page);
    }

    setMobileView("answer-sheet");
  }

  function toggleExpandAll() {
    if (allExpanded) {
      setExpandedIds(new Set());
      setAllExpanded(false);
      return;
    }

    setExpandedIds(
      new Set(questions.map((question) => question.id))
    );
    setAllExpanded(true);
  }

  function adjustZoom(amount) {
    setZoom((current) =>
      Math.min(200, Math.max(50, current + amount))
    );
  }

  /* Active answer-sheet highlight(s) */

  const activeQuestion = questions.find(
    (question) => question.id === activeQuestionId
  );

  const activeRegions = useMemo(() => {
    if (!activeQuestion) {
      return [];
    }

    return activeQuestion.regions.filter(
      (region) => region.page === page
    );
  }, [activeQuestion, page]);

  return (
    <div
      className={`answer-page ${
        sidebarExpanded ? "sidebar-expanded" : ""
      }`}
    >
      {mobileSidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <CollapsedSidebar
        onExpand={() => setSidebarExpanded(true)}
      />

      <ExpandedSidebar
        isMobileOpen={mobileSidebarOpen}
        onCollapse={() => {
          setSidebarExpanded(false);
          setMobileSidebarOpen(false);
        }}
      />

      <div className="main-content">
        <Navbar
          onBack={() => navigate("/")}
          onOpenMenu={() => setMobileSidebarOpen(true)}
        />

        <main className="result-shell">
          {loading && (
            <LoadingState
              percent={data?.progress?.percent}
              stage={data?.progress?.stage}
            />
          )}

          {!loading && error && (
            <ErrorState
              message={error}
              onRetry={() => navigate("/")}
            />
          )}

          {!loading && !error && data && (
            <>
              <MobileViewToggle
                view={mobileView}
                onChange={setMobileView}
              />

              <div
                className={`review-layout mobile-view-${mobileView}`}
              >
                <QuestionsPane
                  questions={questions}
                  unmatched={unmatched}
                  summary={summary}
                  expandedIds={expandedIds}
                  allExpanded={allExpanded}
                  activeQuestionId={activeQuestionId}
                  onToggleQuestion={toggleQuestion}
                  onToggleAll={toggleExpandAll}
                  result={result}
                />

                <AnswerSheet
                  pages={answerSheetPages}
                  page={page}
                  zoom={zoom}
                  activeRegions={activeRegions}
                  activeQuestion={activeQuestion}
                  onZoom={adjustZoom}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default AssessmentUpload;