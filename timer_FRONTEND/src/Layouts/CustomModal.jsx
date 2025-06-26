import { Modal } from "@mantine/core";
import { useModal } from "../context/ModalContext";


/*

This is the single modal which is used by components throughout the app. 

When the openmodal function is used by a component through context, it will change the modal state
and since the customModal is subscirbed to it also through context, it will rerender with the 
new info (1), and either open or close. 

All modals have the same close button. (2)

*/
export default function CustomModal() {
    //(1)
  const { modalState, closeModal } = useModal();

  return (
    <Modal
      opened={modalState.isOpen}
      onClose={closeModal}
      centered
      size="75%"
      withCloseButton={true}
      closeButtonProps={{ 
        "aria-label": "Close modal",
        size: "lg" 
      }}
    >
      {modalState.content}

    </Modal>
  );
}