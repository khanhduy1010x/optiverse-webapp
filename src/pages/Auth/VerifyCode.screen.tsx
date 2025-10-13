import React, { useEffect, useState } from "react";
import Button from "../../components/common/Button.component";
import Icon from "../../components/common/Icon/Icon.component";
import { OTPInputField } from "../../components/common/Input.component";
import { useAppTranslate } from "../../hooks/useAppTranslate";
import { useNavigate } from "react-router-dom";
import { RegisterForm } from "../../types/auth/auth.types";
import { validateOTP } from "../../utils/validate.util";
import { useVerifyPassWord } from "../../hooks/auth/useVerifyResetPassword.hook";

interface VerifyCodeFormProps {
  data: string;
  onSwitch: (view: "reset" | "login") => void;
  setToken?: (token: string) => void;
  onChangeEmail?: () => void;
}

const VerifyCodeForm: React.FC<VerifyCodeFormProps> = ({
  data,
  onSwitch,
  setToken,
  onChangeEmail,
}) => {
  const { t } = useAppTranslate("auth");
  const navigate = useNavigate();

  const [message, setMessage] = useState({
    type: "info" as "info" | "error",
    message: t("verify_sent_message_with_email", { email: data }),
  });

  useEffect(() => {
    setMessage(prev =>
      prev.type === "info"
        ? {
            ...prev,
            message: t("verify_sent_message_with_email", { email: data }),
          }
        : prev
    );
  }, [data, t]);

  const { onSubmit, control, handleSubmit, handleResend } = useVerifyPassWord({
    email: data,
    setMessage,
    onRedirect: () => onSwitch("reset"),
    setToken,
  });

  return (
    <div className="flex w-full flex-col gap-8 p-6 md:w-1/2 md:p-10">
      {/* HEADER */}
      <div className="space-y-4">
        <button
          className="items-center group hover:text-gray-500"
          onClick={() => navigate("/")}
        >
          <Icon name="backHome" size={24} />
        </button>

        <h2 className="text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
          {t("verify_title")}
        </h2>
        <p className="text-sm text-gray-500 md:text-base">
          {t("verify_description")}
        </p>
      </div>

      {/* MESSAGE */}
      <div>
        <p
          className={`text-sm text-center px-4 py-3 rounded-lg transition-all duration-200 ${message.type === "error"
            ? "text-red-600"
            : "bg-gray-50 text-gray-600"
            }`}
        >
          {message.message}
        </p>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex justify-center">
          <OTPInputField<RegisterForm>
            name="code"
            control={control}
            label={t("verify_label")}
            rules={{
              required: t("verify_required"),
              validate: (v) => validateOTP(v),
            }}
            otpLength={6}
          />
        </div>

        <Button
          type="submit"
          title={t("verify_button")}
          className="w-full rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/80"
          inverted
        />
      </form>

      {/* FOOTER */}
      <div className="space-y-2 text-center text-sm text-gray-600">
        <p>
          {t("verify_not_received")}{" "}
          <span
            onClick={handleResend}
            className="cursor-pointer font-semibold text-black hover:underline"
          >
            {t("verify_resend")}
          </span>
        </p>
        <button
          type="button"
          onClick={() => {
            if (onChangeEmail) {
              onChangeEmail();
            } else {
              navigate("/forgot");
            }
          }}
          className="font-semibold text-black hover:underline"
        >
          {t("verify_change_email")}?
        </button>
      </div>
    </div>
  );
};

export default VerifyCodeForm;
