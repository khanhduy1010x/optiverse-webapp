import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppTranslate } from "../../hooks/useAppTranslate";
import ForgotPassword from "./ForgotPassword.screen";
import VerifyOtpScreen from "./VerifyOtp.screen";
import ResetPasswordForm from "./ResetPassword.screen";
import { useForgotPasswordContainer } from "../../hooks/auth/useForgotPasswordContainer";

const ForgotPasswordContainer: React.FC = () => {
    const { t } = useAppTranslate("auth");
    const { step,
        setStep,
        email,
        setEmail,
        resetToken,
        setResetToken } = useForgotPasswordContainer();
    const navigate = useNavigate()

    return (
        <div className="mx-auto flex w-full flex-col overflow-hidden h-screen bg-white shadow-2xl md:flex-row">
            {step === "forgot" && (
                <ForgotPassword
                    onSuccess={(emailValue: string) => {
                        setEmail(emailValue);
                        setStep("verify");
                    }}
                />
            )}

            {step === "verify" && email && (
                <VerifyOtpScreen
                    email={email}
                    type="forgot"
                    onChangeEmail={() => {
                        setEmail('');
                        setResetToken('');
                        setStep('forgot');
                    }}
                    onToken={(token) => {
                        setResetToken(token);
                    }}
                    onSuccess={() => setStep("reset")}
                />
            )}

            {step === "reset" && resetToken && (
                <ResetPasswordForm
                    resetToken={resetToken}
                    onSuccess={() => navigate('/login')}
                />
            )}

            {/* RIGHT SIDE IMAGE */}
            <div className="relative hidden w-full md:block md:w-1/2">
                <img
                    src="/Background_login.png"
                    alt={t("forgot_image_alt")}
                    className="h-full w-full object-cover"
                />
            </div>
        </div>
    );
};

export default ForgotPasswordContainer;
