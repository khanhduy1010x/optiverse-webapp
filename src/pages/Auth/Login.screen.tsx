import React from "react";
import { useLoginForm } from "../../hooks/auth/useLogin.hook";
import { useAppTranslate } from "../../hooks/useAppTranslate";
import Icon from "../../components/common/Icon/Icon.component";
import Button from "../../components/common/Button.component";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export const Login: React.FC = () => {
  const { t } = useAppTranslate("auth");
  const navigate = useNavigate()
  const {
    email,
    password,
    setEmail,
    setPassword,
    isEmailLoginLoading,
    isGoogleLoginLoading,
    error,
    handleSubmit,
    handleInputChange,
    handleGoogleLogin,
    disabled,
    setFocusedField,
    focusedField,
    showPassword, setShowPassword
  } = useLoginForm();

  const floatingLabel = (field: "email" | "password", label: string, value: string) => {
    const isFocused = focusedField === field;
    const hasValue = Boolean(value);

    return (
      <label
        htmlFor={field}
        className={`absolute select-none pointer-events-none left-4 px-1 transition-all duration-200 ${isFocused || hasValue
          ? "text-xs -top-2 bg-white text-black"
          : "top-1/2 text-gray-500 text-[15px] -translate-y-1/2"
          }`}
      >
        {label}
      </label>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -80 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -80 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mx-auto flex w-full flex-col overflow-hidden h-screen bg-white shadow-2xl md:flex-row">


      <div className="flex w-full flex-col gap-8 p-6 md:w-1/2 md:p-10">

        <div className="space-y-4">
          <button className="items-center group hover:text-gray-500" onClick={() => navigate("/")}>
            <Icon name="backHome" size={24} />
          </button>
          <h2 className="text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
            {t("login_title")}
          </h2>
          <p className="text-sm text-gray-500 md:text-base">{t("login_des")}</p>
        </div>


        <div className="space-y-3">
          <Button
            type="button"
            onClick={handleGoogleLogin}
            disabled={disabled}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-800 transition hover:border-gray-300 hover:shadow disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon name="googleIcon" className="mr-2" size={18} />
            <span>
              {isGoogleLoginLoading ? t("google_loading") : t("login_with_google")}
            </span>
          </Button>
        </div>


        <div className="flex items-center gap-4">
          <span className="h-px flex-1 bg-gray-200" />
          <span className="text-xs uppercase tracking-[0.4em] text-gray-400">{t("or")}</span>
          <span className="h-px flex-1 bg-gray-200" />
        </div>


        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="relative h-14">
            {floatingLabel("email", t("username_placeholder"), email)}
            <input
              id="email"
              value={email}
              onChange={handleInputChange(setEmail)}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              className={`w-full h-full rounded-full border-2 bg-white px-4 text-sm text-gray-700 outline-none transition-all ${focusedField === "email"
                ? "border-black"
                : "border-gray-200 focus:border-black"
                }`}
              disabled={disabled}
              required
            />
          </div>


          <div className="relative h-14">
            {floatingLabel("password", t("password_placeholder"), password)}
            <input
              id="password"
              type={`${showPassword ? 'text' : 'password'}`}
              value={password}
              onChange={handleInputChange(setPassword)}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              className={`w-full h-full rounded-full border-2 bg-white px-4 text-sm text-gray-700 outline-none pr-20 transition-all ${focusedField === "password"
                ? "border-black"
                : "border-gray-200 focus:border-black"
                }`}
              disabled={disabled}
              required
            />
            <button className="absolute top-0 bottom-0 right-5" type="button" onClick={() => { setShowPassword(!showPassword) }}>            <Icon name={`${!showPassword ? 'eye' : 'hiddenEye'}`} />
            </button>
          </div>


          {error && (
            <div className="px-4 text-sm text-red-600">
              {error}
            </div>
          )}


          <Button
            inverted={true}
            type="submit"
            disabled={disabled || (!password || !email)}
            className="w-full rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isEmailLoginLoading ? t("logging_in") : t("login_email_button")}
          </Button>
        </form>


        <p className="text-xs text-gray-400">
          {t("login_terms_prefix")}{" "}
          <span className="font-medium text-gray-600 underline">
            {t("login_terms_tos")}
          </span>{" "}
          {t("login_terms_and")}{" "}
          <span className="font-medium text-gray-600 underline">
            {t("login_terms_privacy")}
          </span>
          , {t("login_terms_suffix")}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <button
            onClick={() => { navigate('/forgot') }}
            type="button"
            className="underline transition hover:text-gray-700"
            disabled={disabled}
          >
            {t("forgot_password")}
          </button>
          <button
            onClick={() => { navigate('/register') }}
            type="button"
            className="font-semibold text-gray-900 underline transition hover:text-black"
            disabled={disabled}
          >
            {t("no_account_register")}
          </button>
        </div>
      </div>


      <div className="relative hidden w-full md:block md:w-1/2">
        <img
          src="/Background_login.png"
          alt={t("login_image_alt")}
          className="h-full w-full object-cover"
        />
      </div>
    </motion.div>
  );
};

export default Login;
