import { Component, OnDestroy } from '@angular/core';
import { CommonModule }         from '@angular/common';                   
import { trigger, transition, style, animate } from '@angular/animations';
import { Subscription }        from 'rxjs';
import { FooterToggleService } from '../../services/footer-toggle.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule                  
  ],
  templateUrl: './footer.component.html',
  styleUrls:   ['./footer.component.scss'],
  animations: [
    trigger('toggleFooter', [
      transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateY(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class FooterComponent implements OnDestroy {
  isVisible = true;
  private sub: Subscription;

  constructor(public footerToggle: FooterToggleService) {
    this.sub = this.footerToggle.visible$.subscribe(v => this.isVisible = v);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
