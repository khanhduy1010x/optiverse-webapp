import { ConfirmationModalProps } from '../../types/profile/props/component.props';
import { GROUP_CLASSNAMES } from '../../styles/group-class-name.style';

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className={GROUP_CLASSNAMES.modalOverlayProfile}>
      <div className={GROUP_CLASSNAMES.modalContentProfile}>
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className={GROUP_CLASSNAMES.modalButtonCancel}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={GROUP_CLASSNAMES.modalButtonConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
