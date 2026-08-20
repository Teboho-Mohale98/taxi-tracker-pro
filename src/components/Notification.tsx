interface NotificationProps {
  message: string;
  type: 'success' | 'error';
}

export function Notification({ message, type }: NotificationProps) {
  return (
    <div className={`notification ${type}`}>
      {message}
    </div>
  );
}
