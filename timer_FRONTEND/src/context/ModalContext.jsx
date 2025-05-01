import { createContext, useContext, useState } from "react";

const ModalContext = createContext();


/*
This context is used to Manage the one custom modal in the app. This allows any componenet to 
open a modal. 

Briefly:
When a component uses openModal, modal state is changed 
and the custom modal componenet is then rerendered to 
show the modal with the content and title.
*/
export function ModalProvider({children}){

    const [modalState, setModalState] = useState({
        isOpen: false,
        content: null,
        title: null
    })

    const openModal = (content, title) => {

        setModalState({
            isOpen: true,
            content,
            title
        })
    }

    const closeModal = () => {
        setModalState({
            ...modalState,
            isOpen: false
        })
    }

    return (
        <ModalContext.Provider value={{modalState, openModal, closeModal}}>
            {children}
        </ModalContext.Provider>
    )
}

export const useModal = () => useContext(ModalContext);
