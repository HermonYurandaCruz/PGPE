import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private toastsSignal = signal<ToastMessage[]>([]);
  readonly toasts = this.toastsSignal.asReadonly();

  show(toast: Omit<ToastMessage, 'id'>): void {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    const duration = toast.duration ?? 4500;
    const newToast: ToastMessage = {
      ...toast,
      id,
      duration
    };

    this.toastsSignal.update(current => [...current, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  success(message: string, title?: string): void {
    this.show({ type: 'success', message, title });
  }

  error(message: string, title?: string): void {
    this.show({ type: 'error', message, title });
  }

  warning(message: string, title?: string): void {
    this.show({ type: 'warning', message, title });
  }

  info(message: string, title?: string): void {
    this.show({ type: 'info', message, title });
  }

  remove(id: string): void {
    this.toastsSignal.update(current => current.filter(t => t.id !== id));
  }
}
