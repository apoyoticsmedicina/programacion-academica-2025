import { Component } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
// import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, NgOptimizedImage],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  // Por ahora simulamos un usuario “dummy”
  user = { name: 'Usuario Ejemplo', email: 'user@udea.edu.co', avatarUrl: '' };

  constructor(
    private router: Router,
    // private auth: AuthService
  ) {}

  goToProfile() {
    this.router.navigate(['/dashboard/profile']);
  }

  logout() {
    // this.auth.logout();
    this.router.navigate(['/login']);
  }
}
