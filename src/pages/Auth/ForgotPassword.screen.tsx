import React, { useState } from "react";
import Button from "../../components/common/Button.component";
import Icon from "../../components/common/Icon/Icon.component";
import { useForgotPassword } from "../../hooks/auth/useForgotPassword.hook";
import { useAppTranslate } from "../../hooks/useAppTranslate";
import { useNavigate } from "react-router-dom";

export const ForgotPassword: React.FC<{ onSuccess: (email: string) => void }> = ({ onSuccess }) => {
  const { t } = useAppTranslate("auth");
  const navigate = useNavigate();
  const { email, setEmail, message, loading, error, handleSubmit, focused,
    setFocused } = useForgotPassword({
      onSuccess: (email) => onSuccess(email),
    });


  const floatingLabel = (label: string) => (
    <label
      htmlFor="email"
      className={`absolute select-none pointer-events-none left-4 px-1 transition-all duration-200 ease-out
        ${focused || email
          ? "text-xs -top-2 bg-white text-black font-medium"
          : "top-1/2 text-gray-500 text-[15px] -translate-y-1/2"
        }`}
    >
      {label}
    </label>
  );

  return (
    <>
      {/* LEFT SIDE */}
      <div className="flex w-full flex-col gap-8 p-6 md:w-1/2 md:p-10">
        <div className="space-y-4">
          <button
            className="items-center group hover:text-gray-500"
            onClick={() => navigate("/login")}
          >
            <Icon name="backHome" size={24} />
          </button>

          <h2 className="text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
            {t("forgot_title")}
          </h2>
          <p className="text-sm text-gray-500 md:text-base">
            {t("forgot_description")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative flex flex-col h-14">
            <div className="relative h-full">
              {floatingLabel(t("email_placeholder"))}
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className={`w-full h-full rounded-full border-2 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition-all duration-200 ease-out
                  ${focused
                    ? "border-black"
                    : "border-gray-200 focus:border-black"
                  }`}
                required
              />
            </div>
            {error && (
              <p className="mt-1 px-2 text-xs text-red-500">- {error}</p>
            )}
            {message && (
              <p className="mt-1 px-2 text-xs text-green-600">{message}</p>
            )}
          </div>

          <Button
            type="submit"
            title={loading ? t("forgot_loading") : t("forgot_submit")}
            disabled={loading || !email}
            className={`w-full rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300
              ${loading || !email
                ? "!bg-gray-200 !text-gray-400 !cursor-not-allowed"
                : "bg-black text-white hover:bg-black/80"
              }`}
            inverted
          />
        </form>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="underline transition hover:text-gray-700"
          >
            {t("forgot_back_login")}
          </button>
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="font-semibold text-gray-900 underline transition hover:text-black"
          >
            {t("no_account_register")}
          </button>
        </div>
      </div>
    </>


  );
};

export default ForgotPassword;
