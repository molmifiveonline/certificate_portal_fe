import React from 'react';

const LoadingSpinner = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        </div>
    );
};

export default LoadingSpinner;
