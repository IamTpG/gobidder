import React from "react";
import Modal from "./Modal";
import Button from "./Button";

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "danger",
  isLoading = false,
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={isLoading}>
        {cancelText}
      </Button>
      <Button
        variant={confirmVariant}
        onClick={handleConfirm}
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : confirmText}
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
      <p className="text-gray-700">{message}</p>
    </Modal>
  );
};

export default ConfirmDialog;
