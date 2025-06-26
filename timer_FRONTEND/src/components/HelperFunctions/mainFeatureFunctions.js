import { useNavigate } from "react-router-dom";
import { useModal } from "../../context/ModalContext";


//function to get category color based on post category
export const getCategoryColor = (category) => {
    const categoryColors = {
    'announcement': 'blue',
    'question': 'orange', 
    'discussion': 'green',
    'misc': 'gray'
    };
    return categoryColors[category] || 'grape'; // fallback color
};


export const useNavigateToUser = () => {
    const navigate = useNavigate();
    const { closeModal } = useModal();
    
    return (userId) => {
        navigate(`/UserPage/${userId}`);
        closeModal();
    };
};