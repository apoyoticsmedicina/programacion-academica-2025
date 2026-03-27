import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudesCambioComponent } from './solicitudes-cambio.component';

describe('SolicitudesCambioComponent', () => {
  let component: SolicitudesCambioComponent;
  let fixture: ComponentFixture<SolicitudesCambioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitudesCambioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitudesCambioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
