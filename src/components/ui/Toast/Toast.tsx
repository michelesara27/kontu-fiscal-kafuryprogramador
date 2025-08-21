// src/components/ui/Toast/Toast.tsx
import { ToastType } from '../../../hooks/useToast';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info
};

const styles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800'
};

export const Toast = ({ type, message, onClose }: ToastProps) => {
  const Icon = icons[type];

  return (
    <div className={`flex items-center p-4 border rounded-lg shadow-lg ${styles[type]}`}>
      <Icon className="w-5 h-5 mr-3" />
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-4 text-gray-400 hover:text-gray-600"
      >
        ×
      </button>
    </div>
  );
};
