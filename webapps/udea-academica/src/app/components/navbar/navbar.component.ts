import { Component } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';
import { AuthUser } from '../../dto/auth.dto';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, NgOptimizedImage],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  // la inicializamos en el constructor
  user$!: Observable<AuthUser | null>;

  defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

  constructor(private router: Router, private authService: AuthService) {
    this.user$ = this.authService.currentUser$;
  }

  onAvatarError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = this.defaultAvatar;
  }

  goToProfile() {
    this.router.navigate(['/dashboard/perfil']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
