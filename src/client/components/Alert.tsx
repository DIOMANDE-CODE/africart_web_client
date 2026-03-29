import React, { useEffect, useRef } from "react";
import "../styles/Alert.css";

export type AlertType = "success" | "error" | "info";

interface AlertProps {
  message: string;
  type: AlertType;
  onClose?: () => void;
  duration?: number; // ms
}

export const Alert: React.FC<AlertProps> = ({ message, type, onClose, duration = 3000 }) => {
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!onClose) return;
    timerRef.current = window.setTimeout(onClose, duration);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [onClose, duration]);

  const handleKeyClose = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClose && onClose();
    }
  };

  const ariaLive = type === "error" ? "assertive" : "polite";

  return (
    <div
      role="status"
      aria-live={ariaLive}
      className={`alert-floating alert-${type}`}
      tabIndex={0}
    >
      <span className="alert-icon" aria-hidden="true">
        {type === "success" ? (
          <i className="fas fa-check-circle"></i>
        ) : type === "error" ? (
          <i className="fas fa-exclamation-triangle"></i>
        ) : (
          <i className="fas fa-info-circle"></i>
        )}
      </span>

      <div className="alert-body">
        <div className="alert-message">{message}</div>
      </div>

      {onClose && (
        <button
          className="alert-close"
          onClick={onClose}
          onKeyDown={handleKeyClose}
          aria-label="Fermer"
        >
          <i className="fas fa-times" aria-hidden="true"></i>
        </button>
      )}

      {onClose && (
        <div
          className="alert-progress"
          style={{ animationDuration: `${duration}ms` }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};
