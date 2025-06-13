import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Info, CheckCircle, XCircle } from 'lucide-react';

// Define the types of messages for different icons/colors
type ModalType = 'info' | 'success' | 'error';

interface MessageModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
  type?: ModalType; // Optional type prop
}

const modalConfig = {
  info: {
    icon: <Info className="h-8 w-8 text-blue-500" />,
    buttonClass: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    title: 'Information',
  },
  success: {
    icon: <CheckCircle className="h-8 w-8 text-green-500" />,
    buttonClass: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
    title: 'Success',
  },
  error: {
    icon: <XCircle className="h-8 w-8 text-red-500" />,
    buttonClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    title: 'Error',
  },
};

const MessageModal: React.FC<MessageModalProps> = ({ isOpen, message, onClose, type = 'info' }) => {
  const { icon, buttonClass, title } = modalConfig[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md p-8 bg-white rounded-2xl shadow-xl text-center"
          >
            {/* Icon */}
            <div className="mx-auto mb-4">{icon}</div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
            
            {/* Message */}
            <p className="text-gray-600 mb-8">{message}</p>
            
            {/* OK Button */}
            <button
              onClick={onClose}
              className={`w-full px-6 py-3 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${buttonClass}`}
            >
              OK
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MessageModal;