import { useNavigate } from "react-router-dom";
import Icon from "../../components/common/Icon/Icon.component";
import Button from "../../components/common/Button.component";
import { useAppTranslate } from "../../hooks/useAppTranslate";
import { useRegister } from "../../hooks/auth/useRegister.hook";

interface RegisterScreenProps {
  onSuccess: (email: string) => void;
}
export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onSuccess }) => {
  const { t } = useAppTranslate("auth");

  const navigate = useNavigate()
  const {
    formData,
    errors,
    handleChange,
    onSubmit,
    focusedField,
    setFocusedField,
    showPassword,
    setShowPassword,
    showConfirm,
    setShowConfirm,
    strength,
    strengthLabel,
    strengthColor,
    isFormValid,
    loading
  } = useRegister({ onSuccess });
  const floatingLabel = (field: string, label: string, value: string) => {
    const isFocused = focusedField === field;
    const hasValue = value.trim() !== "";
    return (
      <label
        htmlFor={field}
        className={`absolute select-none pointer-events-none left-4 px-1 transition-all duration-200 ease-out ${isFocused || hasValue
          ? "text-xs -top-2 bg-white text-black font-medium"
          : "top-1/2 text-gray-500 text-[15px] -translate-y-1/2"
          }`}
      >
        {label}
      </label>
    );
  };
  return (
    <div className="relative flex w-full flex-col gap-8 p-6 md:w-1/2 md:p-10">

      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="w-10 h-10 border-4 border-black/20 border-t-black rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium text-gray-800">{t("register_loading")}</p>
        </div>
      )}
      <div className="space-y-4">
        <button className="items-center group hover:text-gray-500" onClick={() => navigate("/")}>
          <Icon name="backHome" size={24} />
        </button>

        <h2 className="text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
          {t("register_title")}
        </h2>
        <p className="text-sm text-gray-500 md:text-base">
          {t("register_description")}
        </p>
      </div>


      <div>
        <button
          type="button"
          onClick={() => { navigate('/login') }}
          className="font-semibold text-gray-900 underline transition hover:text-black"
        >
          {t("register_already_have")}
        </button>
      </div>


      <form onSubmit={onSubmit} className="space-y-5">
        {errors.email_exits && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            - {errors.email_exits}
          </div>
        )}
        <div className="relative flex flex-col">
          <div className="relative">
            {floatingLabel("full_name", t("register_full_name"), formData.full_name)}
            <input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
              onFocus={() => setFocusedField("full_name")}
              onBlur={() => setFocusedField(null)}
              className={`w-full rounded-full border-2 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition-all duration-200 ease-out ${focusedField === "full_name"
                ? "border-black"
                : "border-gray-200 focus:border-black"
                }`}
            />
          </div>
          {errors.full_name && (
            <p className="mt-1 px-2 text-xs text-red-500">- {errors.full_name}</p>
          )}
        </div>


        <div className="relative flex flex-col">
          <div className="relative">
            {floatingLabel("email", t("register_email"), formData.email)}
            <input
              id="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value.trim())}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              className={`w-full rounded-full border-2 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition-all duration-200 ease-out ${focusedField === "email"
                ? "border-black"
                : "border-gray-200 focus:border-black"
                }`}
            />
          </div>
          {errors.email && (
            <p className="mt-1 px-2 text-xs text-red-500">- {errors.email}</p>
          )}
        </div>


        <div className="relative flex flex-col">
          <div className="relative">
            {floatingLabel("password", t("password_placeholder"), formData.password)}
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              className={`w-full rounded-full border-2 bg-white px-4 pr-12 py-3 text-sm text-gray-700 outline-none transition-all duration-200 ease-out ${focusedField === "password"
                ? "border-black"
                : "border-gray-200 focus:border-black"
                }`}
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute top-1/2 -translate-y-1/2 right-5"
              onClick={() => setShowPassword((p) => !p)}
            >
              <Icon name={showPassword ? "eye" : "hiddenEye"} className="text-gray-500" />
            </button>
          </div>
          <div className="px-4 pt-2">
            <p className="text-xs text-gray-500 text-center md:text-left leading-relaxed   italic">
              {t('register_password_hint')}
            </p>
          </div>


          {formData.password && (
            <div className="flex items-center gap-2 px-4 mt-2">
              <div className="w-full h-1 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${Math.max((strength / 4) * 100, 10)}%`,
                    backgroundColor:
                      formData.password.length < 6 ? "#ef4444" : strengthColor,
                  }}
                />
              </div>
              <span
                className="text-[11px] font-medium"
                style={{
                  color:
                    formData.password.length < 6 ? "#ef4444" : strengthColor,
                }}
              >
                {formData.password.length < 6
                  ? t("register_strength_weak")
                  : strengthLabel}
              </span>
            </div>
          )}

          {errors.password && (
            <p className="mt-1 px-2 text-xs text-red-500">- {errors.password}</p>
          )}
        </div>


        <div className="relative flex flex-col mb-6">
          <div className="relative">
            {floatingLabel("confirmPassword", t("register_confirm_password"), formData.confirmPassword)}
            <input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              onFocus={() => setFocusedField("confirmPassword")}
              onBlur={() => setFocusedField(null)}
              className={`w-full rounded-full border-2 bg-white px-4 pr-12 py-3 text-sm text-gray-700 outline-none transition-all duration-200 ease-out ${focusedField === "confirmPassword"
                ? "border-black"
                : "border-gray-200 focus:border-black"
                }`}
            />
            <button
              type="button"
              className="absolute top-1/2 -translate-y-1/2 right-5"
              onClick={() => setShowConfirm((p) => !p)}
            >
              <Icon name={showConfirm ? "eye" : "hiddenEye"} className="text-gray-500" />
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 px-2 text-xs text-red-500">
              - {errors.confirmPassword}
            </p>
          )}
        </div>

        <div className="pl-2"> <p className="text-xs text-gray-400">
          {t("login_terms_prefix")}{" "}
          <span className="font-medium text-gray-600 underline">
            {t("login_terms_tos")}
          </span>{" "}
          {t("login_terms_and")}{" "}
          <span className="font-medium text-gray-600 underline">
            {t("login_terms_privacy")}
          </span>
          , {t("login_terms_suffix")}
        </p></div>
        <Button type="submit" title={t("register_submit")} disabled={!isFormValid}
          className={`w-full rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 ${isFormValid ? "bg-black text-white hover:bg-black/80" : "bg-gray-200 text-gray-400 cursor-not-allowed"} !disabled:bg-gray-200 !disabled:text-gray-400 disabled:cursor-not-allowed `} inverted={true} />
      </form>
    </div>
  );
}
