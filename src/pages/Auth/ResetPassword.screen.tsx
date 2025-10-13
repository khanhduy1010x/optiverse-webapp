import React, { useState } from "react";
import Button from "../../components/common/Button.component";
import Icon from "../../components/common/Icon/Icon.component";
import { ResetPasswordFormProps } from "../../types/auth/props/component.props";
import { useResetPasswordForm } from "../../hooks/auth/useResetPassword.hook";
import { useAppTranslate } from "../../hooks/useAppTranslate";
import { useNavigate } from "react-router-dom";

const ResetPasswordForm: React.FC<{ resetToken: string; onSuccess: () => void }> = ({ resetToken, onSuccess }) => {
  const { t } = useAppTranslate("auth");
  const navigate = useNavigate()
  const {
    newPassword,
    confirmPassword,
    setNewPassword,
    setConfirmPassword,
    handleSubmit,
    message,
    loading,
    focusedField,
    setFocusedField,
    showPassword,
    setShowPassword,
    showConfirm,
    setShowConfirm,
  } = useResetPasswordForm({ token: resetToken, onSuccess });



  const floatingLabel = (field: string, label: string, value: string) => {
    const isFocused = focusedField === field;
    const hasValue = value.trim() !== "";
    return (
      <label
        htmlFor={field}
        className={`absolute pointer-events-none left-4 px-1 transition-all duration-200 ease-out ${isFocused || hasValue
          ? "bg-white text-xs font-medium text-black -top-2"
          : "top-1/2 -translate-y-1/2 text-[15px] text-gray-500"
          }`}
      >
        {label}
      </label>
    );
  };

  const renderMessage = () => {
    if (!message) return null;

    const baseClasses = "rounded-xl border px-4 py-3 text-sm";
    const statusClasses =
      message.type === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-600"
        : "border-red-200 bg-red-50 text-red-600";

    return (
      <div className={`${baseClasses} ${statusClasses}`}>
        {message.type === "error" ? `- ${message.text}` : message.text}
      </div>
    );
  };

  return (
    <>
      <div className="flex w-full flex-col gap-8 p-10 md:w-1/2 md:p-14">
        <div className="space-y-4">
          <button className="items-center group hover:text-gray-500" onClick={() => navigate("/login")}>
            <Icon name="backHome" size={24} />
          </button>

          <h2 className="text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
            {t("reset_title")}
          </h2>
          <p className="text-sm text-gray-500 md:text-base">
            {t("reset_description")}
          </p>
        </div>

        {renderMessage()}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative flex flex-col">
            <div className="relative">
              {floatingLabel("newPassword", t("reset_new_password_label"), newPassword)}
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onFocus={() => setFocusedField("newPassword")}
                onBlur={() => setFocusedField(null)}
                className={`w-full rounded-full border-2 bg-white px-4 pr-12 py-3 text-sm text-gray-700 outline-none transition-all duration-200 ease-out ${focusedField === "newPassword" ? "border-black" : "border-gray-200 focus:border-black"
                  }`}
              />
              <button
                type="button"
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                <Icon name={showPassword ? "eye" : "hiddenEye"} />
              </button>
            </div>
            <p className="mt-2 px-2 text-xs text-gray-400">{t("reset_password_hint")}</p>
          </div>

          <div className="relative flex flex-col">
            <div className="relative">
              {floatingLabel("confirmPassword", t("reset_confirm_password_label"), confirmPassword)}
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setFocusedField("confirmPassword")}
                onBlur={() => setFocusedField(null)}
                className={`w-full rounded-full border-2 bg-white px-4 pr-12 py-3 text-sm text-gray-700 outline-none transition-all duration-200 ease-out ${focusedField === "confirmPassword" ? "border-black" : "border-gray-200 focus:border-black"
                  }`}
              />
              <button
                type="button"
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowConfirm((prev) => !prev)}
              >
                <Icon name={showConfirm ? "eye" : "hiddenEye"} />
              </button>
            </div>
          </div>

          <Button
            type="submit"
            title={loading ? t("reset_loading") : t("reset_submit_button")}
            className="w-full rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            inverted={true}
          />
        </form>
      </div>


    </>
  );
};

export default ResetPasswordForm;
