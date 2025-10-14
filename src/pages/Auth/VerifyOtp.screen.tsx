import React from "react";
import Button from "../../components/common/Button.component";
import Icon from "../../components/common/Icon/Icon.component";
import { OTPInputField } from "../../components/common/Input.component";
import { useAppTranslate } from "../../hooks/useAppTranslate";
import { useNavigate } from "react-router-dom";
import { useVerifyOtp } from "../../hooks/auth/useVerifyOtp.hook";
import { VerifyOtpScreenProps } from "../../types/auth/props/component.props";


const VerifyOtpScreen: React.FC<VerifyOtpScreenProps> = ({
  email,
  type,
  onChangeEmail,
  onSuccess,
  onToken,
}) => {
  const { t } = useAppTranslate("auth");

  const { control, onSubmit, handleResend, message, loading, setValue } = useVerifyOtp({
    email,
    type,
    onSuccess,
    onToken,
  });

  return (
    <div className="flex w-full flex-col gap-8 p-6 md:w-1/2 md:p-10">
      <div className="space-y-4">

        <h2 className="text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
          {t("verify_title")}
        </h2>
        <p className="text-sm text-gray-500 md:text-base">
          {t("verify_description")}
        </p>
      </div>

      <div>
        <p
          className={`text-sm text-center px-4 py-3 rounded-lg transition-all duration-200 ${message.type === "error"
            ? "bg-red-50 text-red-600"
            : message.type === "success"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-gray-50 text-gray-600"
            }`}
        >
          {message.type === "error" ? `${message.text}` : message.text}
        </p>
      </div>

      <form onSubmit={(e) => {
        console.log('Form submitting...');
        onSubmit(e);
      }} className="space-y-8">
        <div className="flex justify-center">
          <OTPInputField<{ code: string }>
            name="code"
            control={control}
            label={t("verify_label")}
            rules={{
              required: t("verify_required"),
              validate: value =>
                /^\d{6}$/.test(value || '') || t("verify_error_length"),
            }}
            otpLength={6}
          />
        </div>

        <Button
          type="submit"
          title={t("verify_button")}
          className="w-full rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
          inverted
        />
      </form>

      <div className="space-y-2 text-center text-sm text-gray-600">
        <p>
          {t("verify_not_received")}{" "}
          <span
            onClick={() => {
              if (!loading) handleResend();
            }}
            className={`font-semibold text-black hover:underline ${loading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
          >
            {t("verify_resend")}
          </span>
        </p>
        <button
          type="button"
          onClick={onChangeEmail}
          className="font-semibold text-black hover:underline"
        >
          {t("verify_change_email")}
        </button>
      </div>
    </div>
  );
};

export default VerifyOtpScreen;
