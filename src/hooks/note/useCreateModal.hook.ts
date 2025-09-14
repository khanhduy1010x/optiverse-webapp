import { useState } from 'react';
import { UseCreateModalProps } from '../../types/note/props/component.props';



export const useCreateModal = ({ onCreate, loading = false }: UseCreateModalProps) => {
    const [itemName, setItemName] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [localLoading, setLocalLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleCreate = async () => {
        setLocalLoading(true);
        try {
            await onCreate();
            setItemName('');
            setErrorMessage('');
        } catch (error) {
            setErrorMessage('Failed to create item. Please try again.');
        } finally {
            setLocalLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.length <= 30) {
            setItemName(value);

            if (errorMessage) {
                setErrorMessage('');
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && itemName.trim() && !isButtonLoading && !isMaxLength) {
            handleCreate();
        }
    };

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);


    const isButtonLoading = loading || localLoading;
    const remainingChars = 30 - itemName.length;
    const isMaxLength = remainingChars <= -1;
    const canCreate = itemName.trim() && !isButtonLoading && !isMaxLength;

    return {
        itemName,
        isFocused,
        errorMessage,
        isButtonLoading,
        remainingChars,
        isMaxLength,
        canCreate,
        setItemName,
        handleCreate,
        handleInputChange,
        handleKeyPress,
        handleFocus,
        handleBlur,
        setErrorMessage
    };
};