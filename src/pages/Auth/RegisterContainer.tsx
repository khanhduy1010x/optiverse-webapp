import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppTranslate } from "../../hooks/useAppTranslate";
import { RegisterScreen } from "./Register.screen";
import VerifyOtpScreen from "./VerifyOtp.screen";
import useRegisterContainer from "../../hooks/auth/useRegisterContainer.hook";
import { motion } from "framer-motion";

const RegisterContainer: React.FC = () => {
    const { t } = useAppTranslate("auth");
    const navigate = useNavigate();
    const { isShowOTPScreen,
        setIsShowOTPScreen,
        email,
        setEmail } = useRegisterContainer();
    const location = useLocation();


    const emailVerify = location.state?.emailVerify;
    useEffect(() => {
        if (emailVerify) {
            setEmail(emailVerify);
            setIsShowOTPScreen(true);

        }
    }, []);
    return (
        <motion.div
            initial={{ opacity: 0, y: -80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -80 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mx-auto flex w-full flex-col overflow-hidden h-screen bg-white shadow-2xl md:flex-row">
            {/* Form Section */}
            {isShowOTPScreen && email ? (
                <VerifyOtpScreen
                    email={email}
                    type="register"
                    onChangeEmail={() => {
                        setEmail(undefined);
                        setIsShowOTPScreen(false);
                    }}
                    onSuccess={() => navigate("/login")}
                />
            ) : (
                <RegisterScreen
                    onSuccess={(userEmail: string) => {
                        setEmail(userEmail);
                        setIsShowOTPScreen(true);
                    }}
                />
            )}

            {/* Background Section */}
            <div className="relative hidden md:block md:w-1/2">
                <img
                    src="/Background_login.png"
                    alt={t("register_image_alt")}
                    className="h-full w-full object-cover"
                />
            </div>
        </motion.div>

    );
};

export default RegisterContainer;
