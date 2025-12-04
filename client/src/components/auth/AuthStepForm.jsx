import React from "react";

import Button from "../common/Button";
import Spinner from "../common/Spinner";

const AuthStepForm = ({
  icon,
  title,
  description,
  error,
  loading,
  onSubmit,
  submitLabel,
  loadingLabel = "Processing...", // Default loading text
  inputElement,
  footerContent,
  hideSubmitButton = false, // Option để ẩn nút submit (dùng cho trang Success)
}) => {
  return (
    <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-slate-100 max-w-md mx-auto mt-10 animate-fadeIn relative overflow-hidden">
      <div className="flex justify-center mb-6">
        {/* Clone element để thêm class chung nếu cần, hoặc render trực tiếp */}
        {icon && React.isValidElement(icon)
          ? React.cloneElement(icon, {
              className: `w-12 h-12 mb-4 mx-auto ${icon.props.className || ""}`,
            })
          : icon}
      </div>

      <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">
        {title}
      </h2>

      {description && (
        <p className="text-slate-500 text-center mb-8 text-sm">{description}</p>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center shadow-inner">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Input Field */}
        {inputElement}

        {/* Submit Button */}
        {!hideSubmitButton && (
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Spinner size="sm" className="text-white" />
                  <span>{loadingLabel}</span>
                </div>
              ) : (
                submitLabel
              )}
            </Button>
          </div>
        )}
      </form>

      {/* Footer Content */}
      {footerContent && <div className="mt-6 text-center">{footerContent}</div>}
    </div>
  );
};

export default AuthStepForm;
