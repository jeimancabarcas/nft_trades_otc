import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { NotificationService } from './shared/services/notification.service';
import { ToastModule } from 'primeng/toast';
import { ClassNamesModule } from 'primeng/classnames';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, ToastModule, ClassNamesModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // Inject NotificationService to start monitoring
  private notificationService = inject(NotificationService);
}
