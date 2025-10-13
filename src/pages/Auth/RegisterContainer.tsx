import React, { useEffect, useState } from "react";
import { RegisterFormProps } from "../../types/auth/props/component.props";
import { useAppTranslate } from "../../hooks/useAppTranslate";
import { RegisterScreen } from "./Register.screen";
import VerifyCodeFormRegister from "./VerifyCodeRegister.screen";
import useRegisterContainer from "../../hooks/auth/useRegisterContainer.hook";

const RegisterContainer: React.FC = () => {
    const { t } = useAppTranslate("auth");
    const { isShowOTPScreen,
        setIsShowOTPScreen,
        email,
        setEmail } = useRegisterContainer();
    return (
        <div className="mx-auto flex w-full flex-col overflow-hidden h-screen bg-white shadow-2xl md:flex-row">
            {/* Form Section */}
            {isShowOTPScreen && email ? (
                <VerifyCodeFormRegister
                    email={email}
                    onChangeEmail={() => {
                        setEmail(undefined);
                        setIsShowOTPScreen(false);
                    }}
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
        </div>

    );
};

export default RegisterContainer;
