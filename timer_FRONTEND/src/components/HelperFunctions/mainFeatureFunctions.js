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